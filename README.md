# What's the Difference? Voice Design and Confirmation Bias in AI-Assisted Self-Diagnosis

Study application, data, analysis code and materials for a within-subjects online experiment
on whether the voice design of an AI symptom checker moderates confirmation bias in lay
self-diagnosis. Participants (N = 81, 648 trials) read a clinical vignette, chose one of three
diagnoses and rated their confidence. They then heard an AI recommendation that confirmed or
refuted their choice, spoken by an anthropomorphic voice (ElevenLabs) or a machine-like voice
(Microsoft Edge TTS), and decided again. The direction of the recommendation strongly affected
diagnostic choice, confidence and response time. The voice did not moderate these effects.

Röthlingshöfer, N., Winkler, E., Löffler, M., & Rosbach, E. (2026). What's the Difference?
Voice Design and Confirmation Bias in AI-Assisted Self-Diagnosis: Anthropomorphic vs.
Machine-Like Voice Output. Technische Hochschule Ingolstadt. The first three authors
contributed equally. Preprint: to be added.

## Contents

```
app/          study application (SvelteKit, Bun, SQLite)
data/         pseudonymised datasets and CODEBOOK.md
analysis/     R analysis scripts and reproduce.R
  reference/  published results.json and mixed-models.json
materials/    vignettes and voice-perception items (German originals)
CITATION.cff  citation metadata
```

## Running the study app

Requirements: [Bun](https://bun.sh) and ffmpeg. The machine voice is synthesised with Edge TTS
through `uvx` (from [uv](https://docs.astral.sh/uv/)). The anthropomorphic voice requires an
ElevenLabs API key.

```bash
cd app
bun install
cp env.example .env
bun run db:push
bun run db:seed
bun run dev
```

Set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env` before starting. The participant flow
starts at `/study`, and the admin dashboard is at `/admin`. For a production build run
`bun run build` and `bun run start`; `ORIGIN` must then match the public URL, otherwise form
submissions are rejected. `bun run test` runs the end-to-end test of the full flow.

Audio stimuli are not included, because the terms of the TTS providers do not clearly permit
redistributing the generated speech. Running `bun run scripts/generate-all-audios.ts` in `app/`
regenerates them from the seeded texts. Without audio files the flow runs with a placeholder
tone. The anthropomorphic voice used in the study was a custom voice created with ElevenLabs
Voice Design on the authors' account. It is not publicly available, so regenerated
anthropomorphic clips use whichever voice `ELEVENLABS_VOICE_ID` is set to.

## Differences from the deployed version

Operational tooling used during data collection was removed: the voice design panel, preview
mode, database reset and backup, the case editor, the live results page, the study-closed
switch and logging. The refute choice in the practice trial is now seeded instead of using
`Math.random`. `ADMIN_PASSWORD` and `SESSION_SECRET` must be set. The data-use wording on the
consent and privacy pages was revised. Otherwise the participant-facing flow, randomisation,
stimulus text rendering and TTS settings are unchanged.

## Data

`data/CODEBOOK.md` documents every variable, the pseudonymisation and the exclusions.
`trial_data.csv` (648 rows) is the analysis dataset, `participant_data.csv` (81 rows) holds
demographics and voice ratings, and `trial_data_raw.csv` is the export before cleaning.
Session IDs were replaced by participant codes and completion times were truncated to the
date. Free-text responses are not included.

## Reproducing the analysis

```bash
Rscript analysis/reproduce.R [workdir]
```

Run from the repository root. Requires R with `lme4` and `lmerTest`. The script reads the
datasets in `data/`, recreates the file layout the analysis scripts expect in `workdir` (a
temporary directory by default), runs `analyze.R`, `mixed-models.R`, `robustness-checks.R`,
`time-baseline.R` and `time-effect.R`, and writes the output to `workdir/analysis/`. Compare
`results.json` and `mixed-models.json` with the files in `analysis/reference/`.

The voice by AI-condition interaction was not significant in any of the three models. TOST
equivalence tests in `robustness-checks.R` (bound: half of each model's AI main effect) show
the interaction to be equivalent to zero for confidence shift (p = .001) and response time
(p = .007), and inconclusive for diagnostic choice (p = .12).

## Randomisation

Assignment is deterministic (`app/src/lib/server/randomization.ts`). All random draws come from
a Mulberry32 generator seeded with an FNV-1a hash of the session ID, so a session ID always
yields the same assignment. Each session receives 8 of the 12 vignettes. Pair-based
counterbalancing gives 4 confirm and 4 refute trials per session. The vignettes are split into
two blocks of four, each block uses one voice, and block order is counterbalanced by a seeded
coin flip.

## Ethics

Participants gave informed consent before the study and were debriefed afterwards. The
debriefing disclosed that the AI recommendations were scripted and were not medical advice.
Participation was anonymous: no names, email addresses or IP addresses were stored. Age was
collected in bands.

## Licence

- Code in `app/` and `analysis/`: MIT (`LICENSE`)
- Data in `data/` and materials in `materials/`: CC BY 4.0 (`LICENSE-MATERIALS`)
