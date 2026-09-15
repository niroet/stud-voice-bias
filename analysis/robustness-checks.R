#!/usr/bin/env Rscript
# Robustness checks for the mixed models, with the same specification as mixed-models.R
# (sum coding, bobyqa). Prints to the console and writes no files.

suppressWarnings(suppressMessages({ library(lme4); library(lmerTest) }))

d <- read.csv("analysis/trial_data_clean.csv", stringsAsFactors = FALSE)
d$ai      <- factor(d$ai,    levels = c("confirm", "refute"))
d$voice   <- factor(d$voice, levels = c("machine", "anthropomorphic"))
d$session <- factor(d$session)
d$case    <- factor(d$case)
d$log_rt  <- log(d$final_decision_ms)

sumfit_lmm <- function(formula, data = d) {
  op <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(op))
  lmerTest::lmer(formula, data = data, REML = TRUE,
                 control = lmerControl(optimizer = "bobyqa"))
}
sumfit_glmm <- function(formula, data = d) {
  op <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(op))
  lme4::glmer(formula, data = data, family = binomial,
              control = glmerControl(optimizer = "bobyqa", optCtrl = list(maxfun = 2e5)))
}
term_row <- function(model, i) {
  ct <- summary(model)$coefficients
  list(est = ct[i, 1], se = ct[i, 2], p = ct[i, ncol(ct)])
}

cat("\n========== 1. TOST equivalence for AI x Voice interaction ==========\n")
# Under sum coding the AI coefficient is half the confirm-refute contrast and the
# interaction coefficient is a quarter of the difference in differences. A SESOI of
# half the AI effect (4 * delta = b_ai) therefore gives delta = 0.25 * |b_ai|.
tost_p <- function(est, se, delta) {
  pL <- pnorm((est + delta) / se, lower.tail = FALSE)
  pU <- pnorm((est - delta) / se, lower.tail = TRUE)
  max(pL, pU)
}
m_pick  <- sumfit_glmm(pick_changed ~ ai * voice + (1 | session) + (1 | case))
m_shift <- sumfit_lmm(shift        ~ ai * voice + (1 | session) + (1 | case))
m_rt    <- sumfit_lmm(log_rt       ~ ai * voice + (1 | session) + (1 | case))
for (nm in c("pick", "shift", "rt")) {
  m   <- get(paste0("m_", nm))
  ai  <- term_row(m, 2); int <- term_row(m, 4)
  delta <- 0.25 * abs(ai$est)
  p_tost <- tost_p(int$est, int$se, delta)
  cat(sprintf("%-6s AI b=%.3f | interaction b=%.3f se=%.3f | SESOI=+/-%.3f on b_int (= half the AI main effect on the interpretable scale) | TOST p=%.4g\n",
              nm, ai$est, int$est, int$se, delta, p_tost))
}

cat("\n========== 2. Confidence shift restricted to non-switchers ==========\n")
# For switchers the post-AI confidence refers to a different diagnosis than the initial one.
stayers <- d[d$pick_changed == 0, ]
pct_stayers <- 100 * nrow(stayers) / nrow(d)
m_stay <- sumfit_lmm(shift ~ ai + (1 | session) + (1 | case), data = stayers)
st <- term_row(m_stay, 2)
cat(sprintf("Stayers: %.1f%% of trials (n=%d) | AI b=%.3f (full confirm-refute diff=%.3f) se=%.3f p=%.3g\n",
            pct_stayers, nrow(stayers), st$est, 2 * st$est, st$se, st$p))
cat("NOTE: pick_changed==0 is a post-treatment split (confirm trials are ~99% stayers vs.\n",
    "~54% under refute), so this is a supportive check, not an unconfounded replication.\n")

cat("\n========== 3. Block order + position as covariates ==========\n")
first_voice <- aggregate(voice ~ session, data = d[d$block == "t1", ], FUN = function(v) as.character(v[1]))
names(first_voice)[2] <- "block_order"
d2 <- merge(d, first_voice, by = "session")
d2$block_order <- factor(d2$block_order, levels = c("machine", "anthropomorphic"))
d2$position <- as.numeric(d2$position)
for (spec in list(
    list(nm = "pick",  fn = sumfit_glmm, f = pick_changed ~ ai * voice + block_order + position + (1 | session) + (1 | case)),
    list(nm = "shift", fn = sumfit_lmm,  f = shift        ~ ai * voice + block_order + position + (1 | session) + (1 | case)),
    list(nm = "rt",    fn = sumfit_lmm,  f = log_rt       ~ ai * voice + block_order + position + (1 | session) + (1 | case)))) {
  m <- spec$fn(spec$f, data = d2)
  ct <- summary(m)$coefficients
  int_row <- ct["ai1:voice1", ]
  cat(sprintf("%-6s AIxVoice with block_order+position added: b=%.3f p=%.3g (n rows=%d)\n",
              spec$nm, int_row[1], int_row[ncol(ct)], nrow(ct)))
}

cat("\n========== 4. Floor-effect raw counts (confirm condition, pick_changed) ==========\n")
tab <- table(d$ai, d$pick_changed)
cat(sprintf("Confirm: %d changed / %d trials | Refute: %d changed / %d trials\n",
            tab["confirm", "1"], sum(tab["confirm", ]),
            tab["refute", "1"], sum(tab["refute", ])))

cat("\n========== 5. Maximal random-effects check (by-participant AI slope) ==========\n")
try_maximal <- function(formula, fitfn) {
  fit <- tryCatch(fitfn(formula), warning = function(w) w, error = function(e) e)
  fit
}
m_pick_max  <- try_maximal(pick_changed ~ ai * voice + (1 + ai | session) + (1 | case), sumfit_glmm)
m_shift_max <- try_maximal(shift        ~ ai * voice + (1 + ai | session) + (1 | case), sumfit_lmm)
report_maximal <- function(nm, fit, base_int_p) {
  if (inherits(fit, "condition") && !inherits(fit, "merMod")) {
    cat(sprintf("%-6s maximal model did not fit cleanly (%s)\n", nm, conditionMessage(fit)))
    return(invisible())
  }
  sing <- isSingular(fit)
  ct <- summary(fit)$coefficients
  int_p <- ct[4, ncol(ct)]
  cat(sprintf("%-6s maximal model singular=%s | interaction p (reduced=%.3g -> maximal=%.3g)\n",
              nm, sing, base_int_p, int_p))
}
report_maximal("pick",  m_pick_max,  term_row(m_pick, 4)$p)
report_maximal("shift", m_shift_max, term_row(m_shift, 4)$p)

cat("\n========== 6. Model-based full confirm-vs-refute OR for pick_changed ==========\n")
# exp(b_ai) from the sum-coded fit (\pickAiOR) is a half-effect, not the confirm-vs-refute
# odds ratio. The full OR comes from the treatment-coded cell probabilities, averaged over voice.
op <- options(contrasts = c("contr.treatment", "contr.poly"))
m_pick_trt <- lme4::glmer(pick_changed ~ ai * voice + (1 | session) + (1 | case), data = d,
                          family = binomial, control = glmerControl(optimizer = "bobyqa", optCtrl = list(maxfun = 2e5)))
options(op)
bt <- fixef(m_pick_trt)
L <- rbind(machine.confirm = c(1, 0, 0, 0), machine.refute = c(1, 1, 0, 0),
           anthro.confirm  = c(1, 0, 1, 0), anthro.refute  = c(1, 1, 1, 1))
p_cell <- plogis(as.numeric(L %*% bt)); names(p_cell) <- rownames(L)
confirmP <- mean(p_cell[c("machine.confirm", "anthro.confirm")])
refuteP  <- mean(p_cell[c("machine.refute",  "anthro.refute")])
or_full <- (refuteP / (1 - refuteP)) / (confirmP / (1 - confirmP))
cat(sprintf("model-based confirm rate=%.4f refute rate=%.4f full OR(refute vs confirm)=%.1f\n",
            confirmP, refuteP, or_full))

cat("\nDone.\n")
