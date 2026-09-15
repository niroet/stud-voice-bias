# H1c baseline choice: AI effect on log final time as final-only, change score and ANCOVA,
# plus a placebo model on log initial time that should show no effect.
# Writes analysis/time-baseline.json.
suppressWarnings(suppressMessages({ library(lme4); library(lmerTest) }))

to_json <- function(x, ind = "") {
  num <- function(v) if (is.numeric(v)) { if (is.finite(v)) formatC(v, format = "g", digits = 10) else "null" } else "null"
  if (is.list(x)) {
    nm <- names(x)
    if (is.null(nm)) sprintf("[%s]", paste(sapply(x, function(v) to_json(v, paste0(ind, "  "))), collapse = ", "))
    else sprintf("{\n%s\n%s}", paste(mapply(function(k, v)
      sprintf('%s  "%s": %s', ind, k, to_json(v, paste0(ind, "  "))), nm, x), collapse = ",\n"), ind)
  } else if (is.character(x)) {
    if (length(x) > 1) sprintf("[%s]", paste(sprintf('"%s"', x), collapse = ", ")) else sprintf('"%s"', x)
  } else if (length(x) > 1) sprintf("[%s]", paste(sapply(x, num), collapse = ", ")) else num(x)
}

d <- read.csv("analysis/trial_data_clean.csv", stringsAsFactors = FALSE, check.names = FALSE)
d$ai    <- factor(d$ai, levels = c("confirm", "refute"))
d$voice <- factor(d$voice)
d$lf <- log(d$final_decision_ms)
d$li <- log(d$initial_decision_ms)
ctrl <- lmerControl(optimizer = "bobyqa")

# confirm is the reference level, so the confirm/refute time ratio is exp(-b).
ai_eff <- function(m) {
  s <- summary(m)$coefficients
  list(ratio = exp(-s["airefute", "Estimate"]), b = s["airefute", "Estimate"],
       t = s["airefute", "t value"], p = s["airefute", "Pr(>|t|)"])
}

m_final  <- lmer(lf ~ ai + voice + (1 | session) + (1 | case), d, REML = TRUE, control = ctrl)
m_change <- lmer(I(lf - li) ~ ai + voice + (1 | session) + (1 | case), d, REML = TRUE, control = ctrl)
m_ancova <- lmer(lf ~ ai + voice + li + (1 | session) + (1 | case), d, REML = TRUE, control = ctrl)
m_placebo<- lmer(li ~ ai + voice + (1 | session) + (1 | case), d, REML = TRUE, control = ctrl)

cor_trial  <- cor(d$li, d$lf)
wi <- d$li - ave(d$li, d$session); wf <- d$lf - ave(d$lf, d$session)
cor_within <- cor(wi, wf)

# Example input rows for the model figure (first participant, anonymized IDs).
d$P <- paste0("P", match(d$session, unique(d$session)))
d$F <- paste0("F", match(d$case, unique(d$case)))
s1 <- d[d$P == "P1", ]
ex <- rbind(s1[s1$ai == "confirm", ][1:2, ], s1[s1$ai == "refute", ][1:2, ])
mkrow <- function(k) list(pers = ex$P[k], fall = ex$F[k], ai = as.character(ex$ai[k]),
  voice = ifelse(ex$voice[k] == "anthropomorphic", "anthro", "machine"),
  ms = round(ex$final_decision_ms[k]), y = round(log(ex$final_decision_ms[k]), 2))
example_rows <- setNames(lapply(seq_len(nrow(ex)), mkrow), paste0("r", seq_len(nrow(ex))))

out <- list(
  meta = list(N = length(unique(d$session)), n_obs = nrow(d)),
  approaches = list(final = ai_eff(m_final), change = ai_eff(m_change),
                    ancova = ai_eff(m_ancova), placebo = ai_eff(m_placebo)),
  cor_trial = cor_trial, cor_within = cor_within,
  example_rows = example_rows
)
writeLines(to_json(out), "analysis/time-baseline.json")
cat("Wrote analysis/time-baseline.json\n")
cat(sprintf("final r=%.2f t=%.2f p=%.2e | change r=%.2f t=%.2f p=%.2e | ancova r=%.2f t=%.2f p=%.2e | placebo p=%.2f | cor=%.2f\n",
  ai_eff(m_final)$ratio, ai_eff(m_final)$t, ai_eff(m_final)$p,
  ai_eff(m_change)$ratio, ai_eff(m_change)$t, ai_eff(m_change)$p,
  ai_eff(m_ancova)$ratio, ai_eff(m_ancova)$t, ai_eff(m_ancova)$p,
  ai_eff(m_placebo)$p, cor_trial))
