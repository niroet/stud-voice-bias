# Voice-perception items

After each block, participants rated the voice they had just heard on eight items. Ratings
after block 1 are stored as `vpA_*` and after block 2 as `vpB_*`.

Each item was a 7-point forced-choice scale with labelled endpoints and no neutral opt-out.
Item order was randomised per participant and voice, seeded by session ID
(`shuffleVoicePerceptionItems` in `../app/src/lib/server/randomization.ts`), so the CSV column order
does not reflect presentation order.

Original German wording:

| Variable | Question shown | 1 = | 7 = |
|---|---|---|---|
| `humanness` | Wie menschlich wirkte der KI-Assistent auf dich? | sehr maschinell | sehr menschlich |
| `naturalness` | Wie natürlich wirkte der KI-Assistent auf dich? | sehr künstlich | sehr natürlich |
| `pleasantness` | Wie angenehm fandest du den KI-Assistenten? | sehr unangenehm | sehr angenehm |
| `competence` | Wie kompetent wirkte der KI-Assistent auf dich? | sehr inkompetent | sehr kompetent |
| `trust` | Wie vertrauenswürdig fandest du den KI-Assistenten? | gar nicht vertrauenswürdig | sehr vertrauenswürdig |
| `warmth` | Wie warm/zugewandt wirkte der KI-Assistent auf dich? | sehr distanziert | sehr warm |
| `intelligibility` | Wie verständlich war der KI-Assistent? | sehr unverständlich | sehr verständlich |
| `genderedness` | Wie würdest du die Stimme des KI-Assistenten einordnen? | klingt männlich | klingt weiblich |

## Notes for reanalysis

**`genderedness` is bipolar** (1 = klingt männlich, 7 = klingt weiblich). Higher values mean
the voice sounded more feminine. It should not be averaged with the other seven items, and a
mean near 4 indicates an androgynous voice or disagreement between raters.

The two voices were perceived as differing in gender. Both were synthesised from female
German voices, and the machine voice was pitched down by 30 Hz. Ratings: anthropomorphic
M = 6.33 (SD 0.94), machine M = 3.47 (SD 1.44), Wilcoxon signed-rank p < .001. Perceived
gender therefore covaries with the voice manipulation and cannot be separated from
anthropomorphism in this design.

`vpA_*` and `vpB_*` are indexed by block, not by voice. Use `block_order` to map them to
voices. `../analysis/analyze.R` applies this remapping before
the manipulation check.

## Use in the analysis

`humanness` is the primary manipulation-check variable. Participants rated the
anthropomorphic voice as more human than the machine voice, so the null result on the
behavioural outcomes is not due to a failed manipulation.

The study used the informal address (du) throughout.
