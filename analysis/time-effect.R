# H1c: the confirm vs refute time difference under several tests. The time data are
# strongly right-skewed, so mean-based and rank-based tests disagree.
# Reads analysis/trial_data_clean.csv, writes analysis/time-effect.json. Base R only.
to_json <- function(x, ind = "") {
  num <- function(v) if (is.finite(v)) formatC(v, format = "g", digits = 10) else "null"
  if (is.list(x)) {
    items <- mapply(function(k, v) sprintf('%s  "%s": %s', ind, k, to_json(v, paste0(ind, "  "))),
                    names(x), x)
    sprintf("{\n%s\n%s}", paste(items, collapse = ",\n"), ind)
  } else if (length(x) > 1) {
    sprintf("[%s]", paste(sapply(x, num), collapse = ", "))
  } else if (is.character(x)) sprintf('"%s"', x) else num(x)
}

d_clean <- read.csv("analysis/trial_data_clean.csv", stringsAsFactors = FALSE, check.names = FALSE)
stopifnot(all(c("session", "ai", "final_decision_ms") %in% names(d_clean)))

cc <- tapply(d_clean$final_decision_ms[d_clean$ai == "confirm"], d_clean$session[d_clean$ai == "confirm"], mean)
rr <- tapply(d_clean$final_decision_ms[d_clean$ai == "refute"],  d_clean$session[d_clean$ai == "refute"],  mean)
ids <- intersect(names(cc), names(rr)); cc <- cc[ids]; rr <- rr[ids]
d <- cc - rr; n <- length(d)

gm    <- function(v) exp(mean(log(v)))
skew  <- function(v) { m <- mean(v); s <- sd(v); mean(((v - m) / s)^3) }
trim  <- function(v, p = .2) mean(v, trim = p)

wilcox_effect <- function(x, y, alternative) {
  dd <- x - y; dd <- dd[dd != 0]; m <- length(dd)
  r_abs <- rank(abs(dd)); V <- sum(r_abs[dd > 0])
  wt <- suppressWarnings(wilcox.test(x, y, paired = TRUE, alternative = alternative, exact = FALSE, correct = TRUE))
  mu <- m * (m + 1) / 4; sg <- sqrt(m * (m + 1) * (2 * m + 1) / 24)
  Z <- (V - mu) / sg
  list(V = V, Z = Z, p = wt$p.value, r = abs(Z) / sqrt(m), n = m)
}

t_raw <- t.test(cc, rr, paired = TRUE, alternative = "less")
t_raw_ci <- t.test(cc, rr, paired = TRUE)              # two-sided, only for the 95% CI
dz_raw <- mean(d) / sd(d)
lcc <- tapply(log(d_clean$final_decision_ms[d_clean$ai == "confirm"]), d_clean$session[d_clean$ai == "confirm"], mean)
lrr <- tapply(log(d_clean$final_decision_ms[d_clean$ai == "refute"]),  d_clean$session[d_clean$ai == "refute"],  mean)
lcc <- lcc[ids]; lrr <- lrr[ids]; ld <- lcc - lrr
t_log <- t.test(lcc, lrr, paired = TRUE, alternative = "less")
dz_log <- mean(ld) / sd(ld)
wx <- wilcox_effect(cc, rr, "less")
k <- sum(d < 0)
p_sign <- binom.test(k, n, alternative = "greater")$p.value

out <- list(
  meta = list(N = n, r_version = paste0(R.version$major, ".", R.version$minor)),
  desc = list(
    confirm = list(mean = mean(cc), median = median(cc), gm = gm(cc), sd = sd(cc)),
    refute  = list(mean = mean(rr), median = median(rr), gm = gm(rr), sd = sd(rr)),
    diff    = list(mean = mean(d), median = median(d), trimmed20 = trim(d), sd = sd(d),
                   skew = skew(d), min = min(d), max = max(d)),
    trial_max_ms = max(d_clean$final_decision_ms), n_faster_confirm = k
  ),
  normality = list(
    shapiro_W = unname(shapiro.test(d)$statistic),  shapiro_p = shapiro.test(d)$p.value,
    shapiro_W_log = unname(shapiro.test(ld)$statistic), shapiro_p_log = shapiro.test(ld)$p.value),
  approaches = list(
    raw_t  = list(metric = "Cohen's dz", effect = dz_raw, stat_label = "t", stat = unname(t_raw$statistic),
                  df = unname(t_raw$parameter), p = t_raw$p.value,
                  ci_low = unname(t_raw_ci$conf.int[1]), ci_high = unname(t_raw_ci$conf.int[2])),
    log_t  = list(metric = "Cohen's dz (log)", effect = dz_log, stat_label = "t", stat = unname(t_log$statistic),
                  df = unname(t_log$parameter), p = t_log$p.value, gm_ratio = exp(mean(ld))),
    wilcox = list(metric = "r", effect = wx$r, stat_label = "Z", stat = wx$Z, p = wx$p),
    sign   = list(metric = "Anteil schneller", effect = k / n, stat_label = "k/n",
                  stat = k, p = p_sign)
  ),
  raw = list(confirm = as.numeric(cc), refute = as.numeric(rr))
)

writeLines(to_json(out), "analysis/time-effect.json")
cat("Wrote analysis/time-effect.json (N =", n, ")\n")
cat(sprintf("raw-t dz=%.2f p=%.3g | log-t dz=%.2f p=%.3g | wilcox r=%.2f p=%.3g | sign %d/%d p=%.3g\n",
            dz_raw, t_raw$p.value, dz_log, t_log$p.value, wx$r, wx$p, k, n, p_sign))
