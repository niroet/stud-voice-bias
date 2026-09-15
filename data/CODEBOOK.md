# Codebook

Dataset for "What's the Difference? Voice Design and Confirmation Bias in AI-Assisted
Self-Diagnosis: Anthropomorphic vs. Machine-Like Voice Output".

Within-subjects online experiment with 81 participants and 8 trials each (648 analysed
trials). The study was conducted in German. Variable names are English; the levels of
`gender` are German.

## Files

| File | Rows | Description |
|---|---|---|
| `trial_data.csv` | 648 | Primary analysis dataset. One row per trial. |
| `participant_data.csv` | 81 | One row per participant: demographics, block order, all trials in wide format, voice-perception ratings. |
| `trial_data_raw.csv` | 685 | Raw trial export before cleaning (86 sessions), including the excluded incomplete sessions and duplicate rows (see Data cleaning). |

Model output (`mixed-models.json`) and descriptive results (`results.json`) as reported in the
paper are in `../analysis/reference/`.

## Pseudonymisation

Session UUIDs were replaced by participant codes `P01` to `P86`, assigned in alphabetical
order of the UUIDs and not in order of participation. Codes cover all 86 raw sessions, so the
codes of the 5 excluded sessions (`P20`, `P30`, `P67`, `P70`, `P86`) appear only in
`trial_data_raw.csv`. Completion timestamps were truncated to the date.

The UUIDs are not published. Each UUID seeds the randomisation in
`../app/src/lib/server/randomization.ts`, so it would allow reconstruction of the assignment
and linkage to the production database. The analyses only require grouping trials by
participant. The mapping table is not published.

## `trial_data.csv`

| Variable | Type | Values | Description |
|---|---|---|---|
| `participant` | string | `P01` to `P86` | Participant code, 8 rows each. |
| `case` | string | 12 levels, e.g. `case-anna-erkaeltung` | Vignette shown. Each participant saw 8 of the 12 vignettes (47 to 62 presentations per vignette). Texts in `../materials/vignettes.md`. |
| `block` | string | `t1`, `t2` | Block. One voice per block. |
| `position` | int | 1 to 4 | Position within the block. |
| `voice` | factor | `machine`, `anthropomorphic` | Voice condition: `machine` = Edge TTS, `anthropomorphic` = ElevenLabs. |
| `ai` | factor | `confirm`, `refute` | AI condition: the AI named the participant's initial diagnosis (`confirm`) or a different one (`refute`). Assigned per session, 4 of each, pair-counterbalanced. |
| `initial_pick` | factor | `A`, `B`, `C` | Diagnosis chosen before hearing the AI. |
| `final_pick` | factor | `A`, `B`, `C` | Diagnosis chosen after hearing the AI. |
| `initial_conf` | int | 1 to 7 | Confidence before the AI. 7-point forced-choice scale, 1 = very unsure, 7 = very sure. |
| `final_conf` | int | 1 to 7 | Confidence after the AI, same scale. |
| `shift` | int | -5 to 6 | `final_conf - initial_conf`. Positive values mean higher confidence after the AI. H1b outcome. |
| `pick_changed` | int | 0, 1 | 1 if `final_pick != initial_pick`. H1a outcome. |
| `cell` | string | `<voice>.<ai>` | Design cell label, redundant with `voice` and `ai`. |
| `visibility_lost` | int | 0, 1 | 1 if the browser tab lost focus during the trial. Used in the sensitivity analysis in `analyze.R`. |
| `initial_decision_ms` | int | ms | Time from vignette display to the initial diagnosis. |
| `final_decision_ms` | int | ms | Time from end of audio to the final diagnosis. H1c outcome, analysed as `log(final_decision_ms)`. |

The range of `shift` is asymmetric because confidence is bounded at 1 and 7, so the possible
change depends on the initial rating. `robustness-checks.R` repeats the confidence analysis on
trials where the diagnosis was not changed, because after a change the final confidence
refers to a different diagnosis.

## `participant_data.csv`

| Variable | Type | Values | Description |
|---|---|---|---|
| `participant` | string | `P01` to `P86` | Participant code, joins to `trial_data.csv`. |
| `mode` | string | `remote` | Data collection mode. All sessions were remote. |
| `completed_at` | date | `2026-05-19` to `2026-06-02` | Completion date. Not used in the analyses; kept because `analyze.R` checks it for completeness. |
| `block_order` | factor | `anthro_first`, `machine_first` | Voice heard in block 1, randomised 50/50. Required to map `vpA_*` and `vpB_*` to voices (see below). |
| `age` | ordinal | `18–24`, `25–34`, `35–44`, `45–54`, `55+` | Age band. Exact age was not collected. |
| `gender` | factor | `weiblich`, `männlich`, `divers` | Self-reported gender (female, male, diverse/other). |
| `exp_symptom_checkers` | int | 1 to 7 | Self-rated prior experience with AI symptom checkers. |
| `exp_voice_ai` | int | 1 to 7 | Self-rated prior experience with voice assistants or voice AI. |
| `t{1,2}_{1..4}_case` | string | | Vignette at that block and position. |
| `t{1,2}_{1..4}_voice` | factor | | Voice condition for that trial. |
| `t{1,2}_{1..4}_ai_condition` | factor | | AI condition for that trial. |
| `t{1,2}_{1..4}_initial_pick` | factor | `A`/`B`/`C` | |
| `t{1,2}_{1..4}_initial_conf` | int | 1 to 7 | |
| `t{1,2}_{1..4}_final_pick` | factor | `A`/`B`/`C` | |
| `t{1,2}_{1..4}_final_conf` | int | 1 to 7 | |
| `t{1,2}_{1..4}_shift` | int | | `final_conf - initial_conf` for that trial. |
| `vpA_<dimension>` | int | 1 to 7 | Voice-perception rating for the block-1 voice. |
| `vpB_<dimension>` | int | 1 to 7 | Voice-perception rating for the block-2 voice. |

### Voice-perception columns

**`vpA_*` and `vpB_*` are indexed by block, not by voice.** `vpA` is the voice heard in
block 1, as given by `block_order`:

- `block_order == "anthro_first"`: `vpA_*` = anthropomorphic, `vpB_*` = machine
- `block_order == "machine_first"`: `vpA_*` = machine, `vpB_*` = anthropomorphic

The manipulation-check section of `../analysis/analyze.R` applies this remapping. A
reanalysis must do the same, otherwise ratings of the two voices are mixed.

The eight dimensions are `pleasantness`, `genderedness`, `competence`, `trust`, `humanness`,
`warmth`, `intelligibility` and `naturalness`. German wording and scale anchors are in
`../materials/voice-perception-items.md`. Item order was randomised per participant and
voice (seeded by session), so the CSV column order does not reflect presentation order.

**`genderedness` is bipolar** (1 = klingt männlich, 7 = klingt weiblich) and should not be
averaged with the other items. The two voices differed on it (anthropomorphic M = 6.33,
machine M = 3.47), so perceived gender covaries with the voice manipulation.

## `trial_data_raw.csv`

Trial-level columns from the study app export (names differ from `trial_data.csv`, e.g.
`case_id`, `ai_condition`, `initial_confidence`, `confidence_shift`), plus:

| Variable | Type | Description |
|---|---|---|
| `analysed` | int | 1 for rows of the 81 analysed participants (673 rows, including duplicates), 0 for the 5 excluded sessions (12 rows). |
| `audio_file` | string | Path of the audio clip played. Encodes the refute target. |
| `age`, `gender`, `exp_*` | | Demographics, repeated on every row. |

## Data cleaning

The 685 raw rows differ from the 648 analysed rows in two ways, both handled in
`../analysis/analyze.R`:

1. 5 incomplete sessions (1, 1, 1, 3 and 6 trials) are excluded, as reported in the paper's
   Methods section.
2. 8 sessions have duplicate trial rows from double submission (9, 9, 9, 10, 10, 10, 14 and
   18 rows instead of 8). The analysis uses the de-duplicated wide export
   (`participant_data.csv`) as the authoritative source, so each analysed participant
   contributes 8 trials.

`analyze.R` asserts 648 trials (81 x 8) after cleaning.

## Missing data

`trial_data.csv` and `participant_data.csv` contain no missing values. All study phases were
forced-choice with auto-advance, so every completed session has complete data.

## Design summary

Within-subjects 2 (voice: anthropomorphic, machine) x 2 (AI: confirm, refute) design. Each
participant saw 8 vignettes, 4 per voice block, with 2 confirm and 2 refute trials per block.
Voice was blocked because switching voices between trials would have made the manipulation
salient. Pair-based counterbalancing gave every participant 4 confirm and 4 refute trials and
gave each vignette a 50% probability of being a confirm trial. The assignment is deterministic
given the session UUID (`../app/src/lib/server/randomization.ts`), which is why the UUIDs are
not published.
