#!/usr/bin/env Rscript
# Reproduce the analysis. Run from the repository root: Rscript analysis/reproduce.R [workdir]
# Reads data/, recreates the original study layout and a `session` column in workdir,
# and runs the analysis scripts from analysis/ there.

args    <- commandArgs(trailingOnly = TRUE)
workdir <- if (length(args) > 0) args[1] else file.path(tempdir(), "stud-reproduce")

root     <- normalizePath(".")
data_dir <- file.path(root, "data")
code_dir <- file.path(root, "analysis")

if (!dir.exists(data_dir)) {
  stop("Run this from the repository root (the directory containing data/ and analysis/).",
       call. = FALSE)
}

for (pkg in c("lme4", "lmerTest")) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("Missing R package '%s'. install.packages(\"%s\")", pkg, pkg),
         call. = FALSE)
  }
}

message("Repo    : ", root)
message("Work dir: ", workdir)

dir.create(file.path(workdir, "analysis"),      recursive = TRUE, showWarnings = FALSE)
dir.create(file.path(workdir, "study results"), recursive = TRUE, showWarnings = FALSE)

# Renaming the ID column is enough: the scripts only use it as a grouping factor.
rename_id <- function(infile, outfile, from) {
  d <- read.csv(infile, stringsAsFactors = FALSE)
  if (!from %in% names(d)) stop("Expected column '", from, "' in ", infile, call. = FALSE)
  names(d)[names(d) == from] <- "session_id"
  write.csv(d, outfile, row.names = FALSE, na = "")
}

trials <- read.csv(file.path(data_dir, "trial_data.csv"), stringsAsFactors = FALSE)
names(trials)[names(trials) == "participant"] <- "session"
write.csv(trials, file.path(workdir, "analysis", "trial_data_clean.csv"),
          row.names = FALSE, na = "")

rename_id(file.path(data_dir, "participant_data.csv"),
          file.path(workdir, "study results", "stud_wide-2.csv"), "participant")
rename_id(file.path(data_dir, "trial_data_raw.csv"),
          file.path(workdir, "study results", "stud_long-1.csv"), "participant")

owd <- setwd(workdir)
on.exit(setwd(owd), add = TRUE)

for (script in c("analyze.R", "mixed-models.R", "robustness-checks.R",
                 "time-baseline.R", "time-effect.R")) {
  message("\n=== ", script, " ===")
  source(file.path(code_dir, script), echo = FALSE)
}

message("\nDone. Output written to ", file.path(workdir, "analysis"))
message("Compare against analysis/reference/mixed-models.json.")
