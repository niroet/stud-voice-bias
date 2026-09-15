#!/usr/bin/env Rscript
# Mixed-effects models for the AI x Voice design; the interaction term is the H1 test.
# Reads analysis/trial_data_clean.csv, writes analysis/mixed-models.json and
# analysis/mixed-models-log.txt.

suppressWarnings(suppressMessages({
  ok <- requireNamespace("lme4", quietly = TRUE) &&
        requireNamespace("lmerTest", quietly = TRUE)
}))
if (!ok) stop("lme4 + lmerTest required: install.packages(c('lme4','lmerTest'))")
suppressWarnings(suppressMessages({ library(lme4); library(lmerTest) }))

# Same JSON serializer as analyze.R.
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
  if (is.atomic(x) && is.null(names(x)))
    return(paste0("[", paste(vapply(x, to_json, character(1), indent + 1),
                             collapse = ", "), "]"))
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

OUT_DIR <- "analysis"
LOGFILE <- file.path(OUT_DIR, "mixed-models-log.txt")
log_con <- file(LOGFILE, open = "wt", encoding = "UTF-8")
say <- function(...) { m <- paste0(...); cat(m, "\n"); cat(m, "\n", file = log_con) }
hr  <- function(t) say("\n========== ", t, " ==========")

hr("1  LOAD")
d <- read.csv(file.path(OUT_DIR, "trial_data_clean.csv"),
              stringsAsFactors = FALSE, fileEncoding = "UTF-8")
say("Rows: ", nrow(d), " | participants: ", length(unique(d$session)),
    " | cases: ", length(unique(d$case)))

# Reference levels make machine.confirm the baseline cell in the treatment-coded refit.
d$ai      <- factor(d$ai,    levels = c("confirm", "refute"))
d$voice   <- factor(d$voice, levels = c("machine", "anthropomorphic"))
d$session <- factor(d$session)
d$case    <- factor(d$case)
d$log_rt  <- log(d$final_decision_ms)

# Sum contrasts, so each 1-df coefficient is the main effect or interaction averaged
# over the other factor (Type III style). lmerTest supplies Satterthwaite df and p;
# the GLMM uses Wald z.
sumfit_lmm <- function(formula) {
  op <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(op))
  lmerTest::lmer(formula, data = d, REML = TRUE,
                 control = lmerControl(optimizer = "bobyqa"))
}
sumfit_glmm <- function(formula) {
  op <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(op))
  lme4::glmer(formula, data = d, family = binomial,
              control = glmerControl(optimizer = "bobyqa",
                                     optCtrl = list(maxfun = 2e5)))
}
# Treatment-coded refit, used only for the model-based cell means.
trtfit_lmm <- function(formula) {
  op <- options(contrasts = c("contr.treatment", "contr.poly")); on.exit(options(op))
  lmerTest::lmer(formula, data = d, REML = TRUE,
                 control = lmerControl(optimizer = "bobyqa"))
}
trtfit_glmm <- function(formula) {
  op <- options(contrasts = c("contr.treatment", "contr.poly")); on.exit(options(op))
  lme4::glmer(formula, data = d, family = binomial,
              control = glmerControl(optimizer = "bobyqa",
                                     optCtrl = list(maxfun = 2e5)))
}

# Columns under treatment coding: (Intercept), ai=refute, voice=anthro, ai:voice
L_cells <- rbind(
  "machine.confirm"         = c(1, 0, 0, 0),
  "machine.refute"          = c(1, 1, 0, 0),
  "anthropomorphic.confirm" = c(1, 0, 1, 0),
  "anthropomorphic.refute"  = c(1, 1, 1, 1)
)

emm_cells <- function(model, link = identity) {
  b <- lme4::fixef(model); V <- as.matrix(vcov(model))
  L <- L_cells[, seq_along(b), drop = FALSE]
  est <- as.numeric(L %*% b)
  se  <- sqrt(diag(L %*% V %*% t(L)))
  out <- lapply(seq_len(nrow(L)), function(i) {
    lo <- est[i] - 1.96 * se[i]; hi <- est[i] + 1.96 * se[i]
    list(cell = rownames(L_cells)[i],
         fit = link(est[i]), lo = link(lo), hi = link(hi),
         link_est = est[i], link_se = se[i])
  })
  names(out) <- rownames(L_cells)
  out
}

# Under sum coding the coefficient rows are (Intercept), ai1, voice1, ai1:voice1.
fixed_terms_lmm <- function(model) {
  ct <- summary(model)$coefficients
  rn <- rownames(ct)
  pick <- function(i, label) list(
    term = label, est = ct[i, 1], se = ct[i, 2],
    df = ct[i, 3], stat = ct[i, 4], p = ct[i, 5],
    f = ct[i, 4]^2)                   # F = t^2 for a 1-df term
  list(
    ai          = pick(2, "AI (confirm vs refute)"),
    voice       = pick(3, "Voice (anthro vs machine)"),
    interaction = pick(4, "AI x Voice"))
}
fixed_terms_glmm <- function(model) {
  ct <- summary(model)$coefficients
  pick <- function(i, label) list(
    term = label, est = ct[i, 1], se = ct[i, 2],
    stat = ct[i, 3], p = ct[i, 4],
    or = exp(ct[i, 1]))
  list(
    ai          = pick(2, "AI (confirm vs refute)"),
    voice       = pick(3, "Voice (anthro vs machine)"),
    interaction = pick(4, "AI x Voice"))
}

ranef_summary <- function(model) {
  vc <- as.data.frame(lme4::VarCorr(model))
  getv <- function(g) { r <- vc$vcov[vc$grp == g]; if (length(r)) r[1] else NA }
  s <- getv("session"); c <- getv("case"); r <- getv("Residual")
  tot <- sum(c(s, c, r), na.rm = TRUE)
  list(session_var = s, case_var = c, resid_var = r,
       session_sd = sqrt(s), case_sd = if (is.na(c)) NA else sqrt(c),
       resid_sd = if (is.na(r)) NA else sqrt(r),
       icc_session = s / tot,
       singular = isSingular(model))
}

hr("2  M1  shift ~ ai*voice + (1|session) + (1|case)")
m1  <- sumfit_lmm(shift ~ ai * voice + (1 | session) + (1 | case))
m1t <- trtfit_lmm(shift ~ ai * voice + (1 | session) + (1 | case))
f1  <- fixed_terms_lmm(m1); r1 <- ranef_summary(m1); e1 <- emm_cells(m1t)
say(sprintf("AI main:        b=%.3f  t=%.2f  p=%.3g", f1$ai$est, f1$ai$stat, f1$ai$p))
say(sprintf("Voice main:     b=%.3f  t=%.2f  p=%.3g", f1$voice$est, f1$voice$stat, f1$voice$p))
say(sprintf("AI x Voice:     b=%.3f  t=%.2f  p=%.3g  <- H1", f1$interaction$est, f1$interaction$stat, f1$interaction$p))
say(sprintf("ranef SD: session=%.3f case=%.3f resid=%.3f | ICC=%.3f | singular=%s",
            r1$session_sd, ifelse(is.na(r1$case_sd),0,r1$case_sd), r1$resid_sd, r1$icc_session, r1$singular))

hr("3  M2  final_conf ~ ai*voice + (1|session) + (1|case)")
m2  <- sumfit_lmm(final_conf ~ ai * voice + (1 | session) + (1 | case))
m2t <- trtfit_lmm(final_conf ~ ai * voice + (1 | session) + (1 | case))
f2  <- fixed_terms_lmm(m2); r2 <- ranef_summary(m2); e2 <- emm_cells(m2t)
say(sprintf("AI main: b=%.3f p=%.3g | Voice: b=%.3f p=%.3g | IxV: b=%.3f p=%.3g",
            f2$ai$est,f2$ai$p, f2$voice$est,f2$voice$p, f2$interaction$est,f2$interaction$p))

hr("4  M3  pick_changed ~ ai*voice + (1|session) + (1|case)  [binomial]")
# Only 4 of 324 confirm trials have a change, so the confirm cells are sparse and their SEs wide.
m3  <- sumfit_glmm(pick_changed ~ ai * voice + (1 | session) + (1 | case))
m3t <- trtfit_glmm(pick_changed ~ ai * voice + (1 | session) + (1 | case))
f3  <- fixed_terms_glmm(m3); r3 <- ranef_summary(m3); e3 <- emm_cells(m3t, link = plogis)
say(sprintf("AI main: b=%.3f (OR=%.2f) z=%.2f p=%.3g", f3$ai$est, f3$ai$or, f3$ai$stat, f3$ai$p))
say(sprintf("Voice:   b=%.3f (OR=%.2f) z=%.2f p=%.3g", f3$voice$est, f3$voice$or, f3$voice$stat, f3$voice$p))
say(sprintf("IxV:     b=%.3f z=%.2f p=%.3g | session SD=%.2f singular=%s",
            f3$interaction$est, f3$interaction$stat, f3$interaction$p, r3$session_sd, r3$singular))

hr("5  M4  log(final_ms) ~ ai*voice + (1|session) + (1|case)")
m4  <- sumfit_lmm(log_rt ~ ai * voice + (1 | session) + (1 | case))
m4t <- trtfit_lmm(log_rt ~ ai * voice + (1 | session) + (1 | case))
f4  <- fixed_terms_lmm(m4); r4 <- ranef_summary(m4)
e4  <- emm_cells(m4t, link = exp)
say(sprintf("AI main: b=%.3f (x%.2f time) t=%.2f p=%.3g | IxV p=%.3g",
            f4$ai$est, exp(f4$ai$est), f4$ai$stat, f4$ai$p, f4$interaction$p))

# Likelihood-ratio tests of fixed effects need ML fits, not REML.
hr("6  LRT: does the AI x Voice interaction improve fit? (per model)")
lrt_interaction <- function(dv, family = NULL) {
  op <- options(contrasts = c("contr.sum","contr.poly")); on.exit(options(op))
  f_full <- as.formula(paste(dv, "~ ai * voice + (1|session) + (1|case)"))
  f_red  <- as.formula(paste(dv, "~ ai + voice + (1|session) + (1|case)"))
  if (is.null(family)) {
    a <- lme4::lmer(f_full, d, REML = FALSE, control = lmerControl(optimizer="bobyqa"))
    b <- lme4::lmer(f_red,  d, REML = FALSE, control = lmerControl(optimizer="bobyqa"))
  } else {
    a <- lme4::glmer(f_full, d, family = family, control = glmerControl(optimizer="bobyqa", optCtrl=list(maxfun=2e5)))
    b <- lme4::glmer(f_red,  d, family = family, control = glmerControl(optimizer="bobyqa", optCtrl=list(maxfun=2e5)))
  }
  an <- anova(b, a)
  list(chisq = an$Chisq[2], df = an$Df[2], p = an$`Pr(>Chisq)`[2])
}
lrt1 <- lrt_interaction("shift")
lrt2 <- lrt_interaction("final_conf")
lrt3 <- lrt_interaction("pick_changed", family = binomial)
lrt4 <- lrt_interaction("log_rt")
say(sprintf("shift: chi2(%d)=%.3f p=%.3g | final_conf: p=%.3g | pick: p=%.3g | rt: p=%.3g",
            lrt1$df, lrt1$chisq, lrt1$p, lrt2$p, lrt3$p, lrt4$p))

hr("7  WRITE mixed-models.json")
pack_model <- function(formula, fixed, ranef, emm, lrt, n_obs, type) {
  list(
    type = type, formula = formula, n_obs = n_obs,
    fixed = list(ai = fixed$ai, voice = fixed$voice, interaction = fixed$interaction),
    ranef = ranef,
    emm = unname(emm),
    lrt_interaction = lrt)
}
out <- list(
  meta = list(
    N = length(unique(d$session)),
    n_trials = nrow(d),
    n_cases = length(unique(d$case)),
    generated_from = "analysis/trial_data_clean.csv",
    lme4 = as.character(packageVersion("lme4")),
    lmerTest = as.character(packageVersion("lmerTest")),
    r_version = paste(R.version$major, R.version$minor, sep = ".")
  ),
  m_shift = pack_model("shift ~ ai*voice + (1|session)+(1|case)", f1, r1, e1, lrt1, nrow(d), "LMM"),
  m_final_conf = pack_model("final_conf ~ ai*voice + (1|session)+(1|case)", f2, r2, e2, lrt2, nrow(d), "LMM"),
  m_pick = pack_model("pick_changed ~ ai*voice + (1|session)+(1|case)", f3, r3, e3, lrt3, nrow(d), "GLMM (binomial)"),
  m_rt = pack_model("log(final_ms) ~ ai*voice + (1|session)+(1|case)", f4, r4, e4, lrt4, nrow(d), "LMM (log)")
)
writeLines(to_json(out), file.path(OUT_DIR, "mixed-models.json"))
say("Done. Wrote analysis/mixed-models.json")
close(log_con)
