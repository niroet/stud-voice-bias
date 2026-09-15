#!/usr/bin/env Rscript
# Non-parametric analysis of the 2x2 within-subjects design (Voice x AI condition). Base R only.
# Writes analysis/results.json, analysis/trial_data_clean.csv and analysis/analysis-log.txt.

# Minimal JSON serializer, so the script needs no packages.
.json_escape <- function(s) {
  s <- gsub("\\\\", "\\\\\\\\", s); s <- gsub('"', '\\\\"', s)
  s <- gsub("\n", "\\\\n", s); s <- gsub("\t", "\\\\t", s); gsub("\r", "\\\\r", s)
}
to_json <- function(x, indent = 0) {
  pad <- strrep("  ", indent); pad1 <- strrep("  ", indent + 1)
  if (is.null(x) || length(x) == 0) return("null")
  if (is.atomic(x) && length(x) == 1) {
    if (is.na(x)) return("null")
    if (is.logical(x)) return(if (x) "true" else "false")
    if (is.numeric(x)) { if (!is.finite(x)) return("null")
                         return(formatC(x, format = "g", digits = 10)) }
    return(paste0('"', .json_escape(as.character(x)), '"'))
  }
  if (is.atomic(x) && is.null(names(x))) {
    return(paste0("[", paste(vapply(x, to_json, character(1), indent + 1),
                             collapse = ", "), "]"))
  }
  if (is.atomic(x)) x <- as.list(x)
  nm <- names(x)
  if (is.null(nm) || any(!nzchar(nm))) {
    el <- vapply(x, function(e) paste0(pad1, to_json(e, indent + 1)), character(1))
    return(paste0("[\n", paste(el, collapse = ",\n"), "\n", pad, "]"))
  }
  el <- vapply(seq_along(x), function(i)
    paste0(pad1, '"', .json_escape(nm[i]), '": ', to_json(x[[i]], indent + 1)),
    character(1))
  paste0("{\n", paste(el, collapse = ",\n"), "\n", pad, "}")
}

DATA_DIR  <- "study results"
WIDE_CSV  <- file.path(DATA_DIR, "stud_wide-2.csv") # de-duplicated, authoritative
LONG_CSV  <- file.path(DATA_DIR, "stud_long-1.csv") # raw; used only for visibility_lost and decision times
OUT_DIR   <- "analysis"
LOGFILE   <- file.path(OUT_DIR, "analysis-log.txt")

dir.create(OUT_DIR, showWarnings = FALSE)
log_con <- file(LOGFILE, open = "wt", encoding = "UTF-8")
say <- function(...) { msg <- paste0(...); cat(msg, "\n"); cat(msg, "\n", file = log_con) }
hr  <- function(t) say("\n========== ", t, " ==========")

VOICES     <- c("anthropomorphic", "machine")
CONDS      <- c("confirm", "refute")
CELLS      <- c("anthropomorphic.confirm", "anthropomorphic.refute",
                "machine.confirm",         "machine.refute")
VP_ITEMS   <- c("pleasantness","genderedness","competence","trust",
                "humanness","warmth","intelligibility","naturalness")

# Paired Wilcoxon signed-rank test with Z and effect size r = |Z| / sqrt(n)
# (Rosenthal 1991; Fritz et al. 2012).
wilcox_effect <- function(x, y, alternative = "two.sided") {
  d  <- x - y
  d  <- d[d != 0]                       # signed-rank drops zero differences
  n  <- length(d)
  if (n == 0) return(list(V = NA, p = NA, Z = NA, r = NA, n = 0))
  wt <- suppressWarnings(wilcox.test(x, y, paired = TRUE,
                                     alternative = alternative, exact = FALSE,
                                     correct = TRUE))
  r_abs <- rank(abs(d))
  V     <- sum(r_abs[d > 0])
  mu    <- n * (n + 1) / 4
  ties  <- table(r_abs)
  sigma <- sqrt(n * (n + 1) * (2 * n + 1) / 24 -
                 sum(ties^3 - ties) / 48)
  Z     <- (V - mu) / sigma
  list(V = unname(wt$statistic), p = wt$p.value, Z = Z,
       r = abs(Z) / sqrt(n), n = n)
}

med_iqr <- function(x) list(median = median(x), q1 = unname(quantile(x, .25)),
                            q3 = unname(quantile(x, .75)),
                            mean = mean(x), sd = sd(x), min = min(x), max = max(x))

hr("1  LOAD & VALIDATE")
W <- read.csv(WIDE_CSV, stringsAsFactors = FALSE, check.names = FALSE,
              fileEncoding = "UTF-8")
say("Wide rows (completed sessions): ", nrow(W))
stopifnot(all(nzchar(W$completed_at)))
stopifnot(!any(duplicated(W$session_id)))
N <- nrow(W)

slots <- expand.grid(b = c("t1", "t2"), p = 1:4, stringsAsFactors = FALSE)
long  <- do.call(rbind, lapply(seq_len(nrow(slots)), function(i) {
  b <- slots$b[i]; p <- slots$p[i]; pre <- paste0(b, "_", p, "_")
  data.frame(
    session = W$session_id, block = b, position = p,
    case  = W[[paste0(pre, "case")]],
    voice = W[[paste0(pre, "voice")]],
    ai    = W[[paste0(pre, "ai_condition")]],
    initial_pick  = W[[paste0(pre, "initial_pick")]],
    final_pick    = W[[paste0(pre, "final_pick")]],
    initial_conf  = W[[paste0(pre, "initial_conf")]],
    final_conf    = W[[paste0(pre, "final_conf")]],
    shift = W[[paste0(pre, "shift")]],
    stringsAsFactors = FALSE)
}))
long$pick_changed <- as.integer(long$initial_pick != long$final_pick)
long$cell <- paste(long$voice, long$ai, sep = ".")

stopifnot(nrow(long) == N * 8)
stopifnot(all(long$voice %in% VOICES), all(long$ai %in% CONDS))
stopifnot(all(long$shift == long$final_conf - long$initial_conf))
stopifnot(all(range(c(long$initial_conf, long$final_conf)) == c(1, 7)))
stopifnot(!anyNA(long[c("initial_conf","final_conf","initial_pick","final_pick")]))
cells_per_subj <- tapply(long$position, list(long$session, long$cell), length)
stopifnot(all(cells_per_subj == 2L))
say("Validation passed: ", N, " participants x 8 trials = ", nrow(long),
    " observations; 4 cells x 2 trials each, no missing values.")

Lraw <- read.csv(LONG_CSV, stringsAsFactors = FALSE, check.names = FALSE,
                 fileEncoding = "UTF-8")
vis  <- aggregate(visibility_lost ~ session_id + case_id, data = Lraw,
                  FUN = function(x) as.integer(any(x == 1)))
long <- merge(long, vis, by.x = c("session","case"),
              by.y = c("session_id","case_id"), all.x = TRUE)
long$visibility_lost[is.na(long$visibility_lost)] <- 0L
say("Trials flagged visibility_lost (completed sessions): ", sum(long$visibility_lost))

# The 8 double-submitted sessions have duplicate (session, case) rows in the raw
# export. Their timings are identical and only the final responses differ, so the
# mean per (session, case) recovers the true value.
ms <- aggregate(cbind(initial_decision_ms, final_decision_ms) ~ session_id + case_id,
                data = Lraw[Lraw$session_id %in% W$session_id, ], FUN = mean)
long <- merge(long, ms, by.x = c("session","case"),
              by.y = c("session_id","case_id"), all.x = TRUE)
stopifnot(!anyNA(long$final_decision_ms), !anyNA(long$initial_decision_ms))
say(sprintf("Decision times merged: final_ms M=%.0f Md=%.0f | initial_ms M=%.0f Md=%.0f",
            mean(long$final_decision_ms), median(long$final_decision_ms),
            mean(long$initial_decision_ms), median(long$initial_decision_ms)))

write.csv(long, file.path(OUT_DIR, "trial_data_clean.csv"), row.names = FALSE,
          fileEncoding = "UTF-8")

raw_sessions   <- length(unique(Lraw$session_id))
raw_incomplete <- raw_sessions - N
dup_sessions   <- sum(tapply(Lraw$session_id, Lraw$session_id, length) > 8)
data_notes <- list(
  wide_sessions = N,
  raw_long_sessions = raw_sessions,
  raw_long_rows = nrow(Lraw),
  incomplete_sessions_excluded = raw_incomplete,
  sessions_with_duplicate_rows = unname(dup_sessions),
  resolution = paste0("Analysis uses the de-duplicated wide export as the ",
                      "authoritative source (N=", N, " completed sessions, ",
                      "648 trials). The raw long export contained ", raw_incomplete,
                      " incomplete sessions and ", dup_sessions,
                      " sessions with duplicated trial rows (double-submitted ",
                      "responses); both issues are absent from the wide export.")
)

hr("2  SAMPLE DESCRIPTIVES")
age_tab    <- as.list(table(factor(W$age)))
gender_tab <- as.list(table(factor(W$gender)))
border_tab <- as.list(table(factor(W$block_order)))
say("Age bands: ",   paste(names(age_tab),    age_tab,    sep="=", collapse=", "))
say("Gender: ",      paste(names(gender_tab), gender_tab, sep="=", collapse=", "))
say("Block order: ", paste(names(border_tab), border_tab, sep="=", collapse=", "))
exp_sc <- med_iqr(W$exp_symptom_checkers)
exp_va <- med_iqr(W$exp_voice_ai)
exp_sc$raw <- as.integer(W$exp_symptom_checkers)
exp_va$raw <- as.integer(W$exp_voice_ai)
say(sprintf("Experience symptom-checkers (1-7): M=%.2f SD=%.2f Md=%g",
            exp_sc$mean, exp_sc$sd, exp_sc$median))
say(sprintf("Experience voice-AI (1-7): M=%.2f SD=%.2f Md=%g",
            exp_va$mean, exp_va$sd, exp_va$median))

cell_desc <- lapply(CELLS, function(c) {
  s <- long$shift[long$cell == c]; ch <- long$pick_changed[long$cell == c]
  list(cell = c, n_trials = length(s),
       shift_mean = mean(s), shift_sd = sd(s), shift_median = median(s),
       change_rate = mean(ch), change_n = sum(ch))
})
names(cell_desc) <- CELLS
for (c in CELLS) say(sprintf("  %-26s shift M=%+.3f SD=%.3f | change=%.1f%% (%d/%d)",
   c, cell_desc[[c]]$shift_mean, cell_desc[[c]]$shift_sd,
   100*cell_desc[[c]]$change_rate, cell_desc[[c]]$change_n, cell_desc[[c]]$n_trials))

cond_desc <- lapply(CONDS, function(k) {
  s <- long$shift[long$ai == k]; ch <- long$pick_changed[long$ai == k]
  list(condition = k, shift_mean = mean(s), shift_sd = sd(s),
       change_rate = mean(ch), change_n = sum(ch), n_trials = length(s))
}); names(cond_desc) <- CONDS

hr("3  MANIPULATION CHECK (voice perception)")
# vpA/vpB rate the block-1/block-2 voice, not a fixed voice, so map them via block_order.
anthro_is_A <- W$block_order == "anthro_first"
get_dim <- function(dim) {
  a <- ifelse(anthro_is_A, W[[paste0("vpA_", dim)]], W[[paste0("vpB_", dim)]])
  m <- ifelse(anthro_is_A, W[[paste0("vpB_", dim)]], W[[paste0("vpA_", dim)]])
  list(anthro = a, machine = m)
}
vp_results <- lapply(VP_ITEMS, function(dim) {
  g  <- get_dim(dim)
  ef <- wilcox_effect(g$anthro, g$machine)
  tt <- t.test(g$anthro, g$machine, paired = TRUE)
  dz <- mean(g$anthro - g$machine) / sd(g$anthro - g$machine)
  list(item = dim,
       anthro_mean = mean(g$anthro), anthro_md = median(g$anthro),
       machine_mean = mean(g$machine), machine_md = median(g$machine),
       diff_mean = mean(g$anthro - g$machine),
       V = ef$V, Z = ef$Z, p = ef$p, r = ef$r,
       t = unname(tt$statistic), df = unname(tt$parameter),
       p_t = tt$p.value, dz = dz)
})
names(vp_results) <- VP_ITEMS
p_holm <- p.adjust(sapply(vp_results, function(x) x$p), method = "holm")
for (i in seq_along(VP_ITEMS)) vp_results[[i]]$p_holm <- unname(p_holm[i])
hum <- vp_results[["humanness"]]
say(sprintf("humanness  anthro Md=%g (M=%.2f) vs machine Md=%g (M=%.2f)",
            hum$anthro_md, hum$anthro_mean, hum$machine_md, hum$machine_mean))
say(sprintf("  Wilcoxon V=%.0f, Z=%.2f, p=%.3g, r=%.2f | paired t(%d)=%.2f, p=%.3g, dz=%.2f",
            hum$V, hum$Z, hum$p, hum$r, hum$df, hum$t, hum$p_t, hum$dz))

hr("4  PRIMARY: confidence shift, Friedman test")
M <- tapply(long$shift, list(long$session, long$cell), mean)
M <- M[, CELLS]
stopifnot(!anyNA(M), nrow(M) == N)
fr   <- friedman.test(M)
k    <- ncol(M)
W_kendall <- unname(fr$statistic) / (N * (k - 1))
say(sprintf("Friedman chi^2(%d) = %.3f, p = %.3g, N = %d",
            unname(fr$parameter), unname(fr$statistic), fr$p.value, N))
say(sprintf("Kendall's W = %.3f", W_kendall))

pairs <- combn(CELLS, 2, simplify = FALSE)
posthoc <- lapply(pairs, function(pr) {
  ef <- wilcox_effect(M[, pr[1]], M[, pr[2]])
  list(a = pr[1], b = pr[2], V = ef$V, Z = ef$Z, p = ef$p, r = ef$r)
})
ph_p <- p.adjust(sapply(posthoc, function(x) x$p), method = "holm")
for (i in seq_along(posthoc)) posthoc[[i]]$p_holm <- unname(ph_p[i])
for (x in posthoc) say(sprintf("  %s vs %s: Z=%.2f p_holm=%.3g r=%.2f",
                                x$a, x$b, x$Z, x$p_holm, x$r))

hr("5  H1: directed interaction (bias score)")
bias_anthro  <- M[, "anthropomorphic.confirm"] - M[, "anthropomorphic.refute"]
bias_machine <- M[, "machine.confirm"]         - M[, "machine.refute"]
diff         <- bias_anthro - bias_machine

ef_h1_g <- wilcox_effect(bias_anthro, bias_machine, alternative = "greater")
ef_h1_2 <- wilcox_effect(bias_anthro, bias_machine, alternative = "two.sided")
say(sprintf("bias anthro:  Md=%g M=%.3f | bias machine: Md=%g M=%.3f",
            median(bias_anthro), mean(bias_anthro),
            median(bias_machine), mean(bias_machine)))
say(sprintf("H1 (anthro>machine) one-sided Wilcoxon V=%.0f, Z=%.2f, p=%.3g, r=%.2f",
            ef_h1_g$V, ef_h1_g$Z, ef_h1_g$p, ef_h1_g$r))
say(sprintf("  two-sided p=%.3g | diff Md=%g M=%.3f", ef_h1_2$p,
            median(diff), mean(diff)))

simple_anthro  <- wilcox_effect(M[,"anthropomorphic.confirm"],
                                M[,"anthropomorphic.refute"], alternative="greater")
simple_machine <- wilcox_effect(M[,"machine.confirm"],
                                M[,"machine.refute"], alternative="greater")
say(sprintf("  simple effect anthro  (confirm>refute): Z=%.2f p=%.3g r=%.2f",
            simple_anthro$Z, simple_anthro$p, simple_anthro$r))
say(sprintf("  simple effect machine (confirm>refute): Z=%.2f p=%.3g r=%.2f",
            simple_machine$Z, simple_machine$p, simple_machine$r))

hr("6  SECONDARY: pick change, McNemar tests")
# McNemar needs one binary outcome per subject: changed on at least one trial in the set.
chg_any <- function(filter) {
  tapply(long$pick_changed[filter], long$session[filter],
         function(x) as.integer(sum(x) >= 1))
}
mcnemar_report <- function(b1, b2, lab1, lab2) {
  tab <- table(factor(b1, 0:1), factor(b2, 0:1))
  mt  <- mcnemar.test(tab, correct = TRUE)
  b <- tab["0","1"]; c <- tab["1","0"]
  bx <- binom.test(b, b + c, 0.5)                   # exact test, since c can be near 0
  list(label = paste0(lab1, " vs ", lab2),
       table = list(n00=tab["0","0"], n01=tab["0","1"],
                    n10=tab["1","0"], n11=tab["1","1"]),
       discordant_b = unname(b), discordant_c = unname(c),
       chi2 = unname(mt$statistic), p = mt$p.value,
       p_exact = bx$p.value,
       rate1 = mean(b1), rate2 = mean(b2))
}
mc_cond <- mcnemar_report(chg_any(long$ai=="confirm"), chg_any(long$ai=="refute"),
                          "confirm", "refute")
mc_voice <- mcnemar_report(chg_any(long$ai=="refute" & long$voice=="anthropomorphic"),
                           chg_any(long$ai=="refute" & long$voice=="machine"),
                           "refute/anthro", "refute/machine")
say(sprintf("Condition  confirm(%.1f%%) vs refute(%.1f%%): b=%d c=%d, chi2=%.2f p=%.3g (exact p=%.3g)",
   100*mc_cond$rate1, 100*mc_cond$rate2, mc_cond$discordant_b, mc_cond$discordant_c,
   mc_cond$chi2, mc_cond$p, mc_cond$p_exact))
say(sprintf("Voice|refute anthro(%.1f%%) vs machine(%.1f%%): b=%d c=%d, chi2=%.2f p=%.3g",
   100*mc_voice$rate1, 100*mc_voice$rate2, mc_voice$discordant_b, mc_voice$discordant_c,
   mc_voice$chi2, mc_voice$p))

# H1a-c across all trials, and H2 as the same tests within each voice. All tests are
# paired because every subject sees both confirm and refute trials.
hr("6b  H1 (across-all) + H2 (by-voice), supervisor framing")

subj_means <- function(var, cond, voice = NULL) {
  f <- long$ai == cond
  if (!is.null(voice)) f <- f & long$voice == voice
  tapply(long[[var]][f], long$session[f], mean)
}

h1a <- function(voice = NULL) {
  fc <- if (is.null(voice)) long$ai=="confirm" else long$ai=="confirm" & long$voice==voice
  fr <- if (is.null(voice)) long$ai=="refute"  else long$ai=="refute"  & long$voice==voice
  mcnemar_report(chg_any(fc), chg_any(fr), "confirm", "refute")
}

h1b <- function(voice = NULL) {
  cc <- subj_means("final_conf", "confirm", voice)
  rr <- subj_means("final_conf", "refute",  voice)
  ids <- intersect(names(cc), names(rr)); cc <- cc[ids]; rr <- rr[ids]
  ef <- wilcox_effect(cc, rr, alternative = "greater")
  list(confirm_mean = mean(cc), refute_mean = mean(rr),
       confirm_md = median(cc), refute_md = median(rr),
       diff_mean = mean(cc - rr), V = ef$V, Z = ef$Z, p = ef$p, r = ef$r, n = ef$n)
}

h1c <- function(voice = NULL) {
  cc <- subj_means("final_decision_ms", "confirm", voice)
  rr <- subj_means("final_decision_ms", "refute",  voice)
  ids <- intersect(names(cc), names(rr)); cc <- cc[ids]; rr <- rr[ids]
  d  <- cc - rr
  sw <- shapiro.test(d)
  tt <- t.test(cc, rr, paired = TRUE, alternative = "less")
  wx <- wilcox_effect(cc, rr, alternative = "less")      # fallback, the time data are skewed
  list(confirm_mean = mean(cc), refute_mean = mean(rr),
       confirm_md = median(cc), refute_md = median(rr), diff_mean = mean(d),
       shapiro_W = unname(sw$statistic), shapiro_p = sw$p.value,
       t = unname(tt$statistic), df = unname(tt$parameter), p_t = tt$p.value,
       dz = mean(d) / sd(d),
       wilcox_Z = wx$Z, wilcox_p = wx$p, wilcox_r = wx$r, n = length(ids))
}

H1a_all <- h1a();  H1b_all <- h1b();  H1c_all <- h1c()
H2 <- lapply(VOICES, function(v) list(voice = v, a = h1a(v), b = h1b(v), c = h1c(v)))
names(H2) <- VOICES

say(sprintf("H1a  pick change  confirm=%.1f%% vs refute=%.1f%%: b=%d c=%d, chi2=%.2f p=%.3g (exact %.3g)",
    100*H1a_all$rate1, 100*H1a_all$rate2, H1a_all$discordant_b, H1a_all$discordant_c,
    H1a_all$chi2, H1a_all$p, H1a_all$p_exact))
say(sprintf("H1b  final conf   confirm M=%.2f (Md %g) vs refute M=%.2f (Md %g): V=%.0f Z=%.2f p=%.3g r=%.2f",
    H1b_all$confirm_mean, H1b_all$confirm_md, H1b_all$refute_mean, H1b_all$refute_md,
    H1b_all$V, H1b_all$Z, H1b_all$p, H1b_all$r))
say(sprintf("H1c  final time   confirm M=%.0fms vs refute M=%.0fms (diff %+.0fms) | Shapiro W=%.3f p=%.3g",
    H1c_all$confirm_mean, H1c_all$refute_mean, H1c_all$diff_mean, H1c_all$shapiro_W, H1c_all$shapiro_p))
say(sprintf("     paired t(%d)=%.2f p=%.3g dz=%.2f %s| Wilcoxon Z=%.2f p=%.3g r=%.2f",
    H1c_all$df, H1c_all$t, H1c_all$p_t, H1c_all$dz,
    if (H1c_all$shapiro_p < .05) "(diffs NON-normal -> prefer Wilcoxon) " else "",
    H1c_all$wilcox_Z, H1c_all$wilcox_p, H1c_all$wilcox_r))
for (v in VOICES) say(sprintf("H2 %-15s: H1a p=%.3g (%.0f%% vs %.0f%%) | H1b Z=%.2f p=%.3g r=%.2f | H1c Wilcoxon p=%.3g (M %.0f vs %.0fms)",
    v, H2[[v]]$a$p, 100*H2[[v]]$a$rate1, 100*H2[[v]]$a$rate2,
    H2[[v]]$b$Z, H2[[v]]$b$p, H2[[v]]$b$r,
    H2[[v]]$c$wilcox_p, H2[[v]]$c$confirm_mean, H2[[v]]$c$refute_mean))

hr("7  SENSITIVITY: exclude visibility_lost trials")
keep <- long$visibility_lost == 0
Ms <- tapply(long$shift[keep], list(long$session[keep], long$cell[keep]), mean)
Ms <- Ms[, CELLS]
cc <- complete.cases(Ms)                       # listwise deletion
Ms_cc <- Ms[cc, , drop = FALSE]
frs <- friedman.test(Ms_cc)
ba  <- Ms_cc[,"anthropomorphic.confirm"] - Ms_cc[,"anthropomorphic.refute"]
bm  <- Ms_cc[,"machine.confirm"]         - Ms_cc[,"machine.refute"]
h1s <- wilcox_effect(ba, bm, alternative = "greater")
sens <- list(n_trials_removed = sum(!keep),
             n_participants_dropped = sum(!cc), N_used = nrow(Ms_cc),
             friedman_chi2 = unname(frs$statistic), friedman_p = frs$p.value,
             h1_p = h1s$p, h1_Z = h1s$Z)
say(sprintf("After removing %d trials (%d participant(s) dropped, N=%d): Friedman chi^2=%.2f p=%.3g | H1 one-sided p=%.3g",
            sum(!keep), sum(!cc), nrow(Ms_cc), unname(frs$statistic), frs$p.value, h1s$p))
say("Decision times: 0 trials < 800 ms (no implausibly fast responses); no RT-based exclusions.")

hr("8  WRITE results.json")
out <- list(
  meta = list(N = N, n_trials = nrow(long), generated_from = WIDE_CSV,
              r_version = as.character(getRversion())),
  data_notes = data_notes,
  sample = list(N = N, age = age_tab, gender = gender_tab,
                block_order = border_tab, exp_symptom_checkers = exp_sc,
                exp_voice_ai = exp_va),
  cell_descriptives = cell_desc,
  condition_descriptives = cond_desc,
  manipulation = list(items = unname(vp_results), humanness = hum),
  friedman = list(chi2 = unname(fr$statistic), df = unname(fr$parameter),
                  p = fr$p.value, kendall_w = W_kendall, N = N,
                  cell_means = as.list(colMeans(M)), posthoc = posthoc),
  h1 = list(bias_anthro = med_iqr(bias_anthro), bias_machine = med_iqr(bias_machine),
            diff = med_iqr(diff),
            test_onesided = list(V = ef_h1_g$V, Z = ef_h1_g$Z, p = ef_h1_g$p,
                                 r = ef_h1_g$r, n = ef_h1_g$n),
            test_twosided = list(p = ef_h1_2$p),
            simple_anthro = list(Z = simple_anthro$Z, p = simple_anthro$p, r = simple_anthro$r),
            simple_machine = list(Z = simple_machine$Z, p = simple_machine$p, r = simple_machine$r)),
  mcnemar = list(condition = mc_cond, voice_within_refute = mc_voice),
  supervisor = list(
    h1a = H1a_all, h1b = H1b_all, h1c = H1c_all,
    h2 = unname(H2)
  ),
  sensitivity = sens
)
writeLines(to_json(out), file.path(OUT_DIR, "results.json"))
say("Done. Wrote ", file.path(OUT_DIR, "results.json"))
close(log_con)
