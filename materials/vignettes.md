# Clinical vignettes

The practice item and the twelve experimental vignettes as presented to participants. The
texts are in German, the language of the study, and are not translated.

Each vignette had three diagnosis options. After the participant chose one, the AI named an
option and spoke the explanation for it. The named option depends on the participant's choice
and the trial's AI condition (`pickAudioFile` in `../app/src/lib/trialState.ts`):

- `confirm`: the AI names the option the participant chose.
- `refute`: the AI names one of the other two options, selected by a seeded coin flip.

The explanation for an option is the same in confirm and refute trials.

## Spoken text

Each clip consists of the explanation for the named option, which refers to the diagnosis in
its first sentence. There is no separate carrier sentence. The exact rendering is in
`../app/src/lib/server/audio/generate.ts` (`renderTextPlain`, `renderTextAnthro`).

- Machine voice: the explanation text of the named option, nothing else. Microsoft Edge TTS,
  `de-DE-KatjaNeural`, pitch -30 Hz, rate -5%.
- Anthropomorphic voice: a hesitation opener that depends on the option letter
  (`A` "Also... [breath]", `B` "Ähm... [breath]", `C` "Ok, also... [breath]"), followed by the
  same explanation text with a `[breath]` tag after its first sentence. ElevenLabs custom voice created with Voice Design, model
  `eleven_v3`, stability 0.35, similarity boost 0.75, style 0.45, speaker boost on. The tags
  are ElevenLabs delivery cues and are not spoken.

The hesitation opener depends on the option letter, not on the AI condition, and occurs only
in the anthropomorphic voice. The three openers are of similar length.

All clips were loudness-normalised to -16 LUFS (EBU R128). The audio files are not included
in this repository for licensing reasons (see `../README.md`).

### Stimulus stability

All 81 participants heard the same clips. All clips were generated in one batch on 2026-05-19
at 15:32, before the first session was completed at 16:07, and none was regenerated later.
Every `.mp3` on the production server has a modification date of 2026-05-19.

The TTS settings listed above were saved at 15:27 on the same day, before generation, and are
the settings used for the clips.

## Practice item (`practice`)

Shown once before the first block. Excluded from all analyses.

> Maximilian (23) hat seit gestern Bauchschmerzen, nachdem er drei große Pizzen hintereinander gegessen hat. Ihm ist leicht übel.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Magen-Überlastung durch übermäßiges Essen | Die Symptome traten direkt nach einer sehr großen Mahlzeit auf, was typisch für eine akute Magenüberlastung ist. Die leichte Übelkeit passt dazu, dass der Magen schlicht überdehnt wurde. |
| B | Lebensmittelvergiftung | Bauchschmerzen und Übelkeit nach einer Mahlzeit können auf eine Lebensmittelvergiftung hindeuten. Verdorbene Speisen lösen häufig genau solche Beschwerden aus, und der zeitliche Zusammenhang mit dem Essen passt gut zu dieser Diagnose. |
| C | Sodbrennen / Reflux | Sodbrennen entsteht häufig nach üppigen Mahlzeiten durch aufsteigende Magensäure. Die beschriebenen Bauchschmerzen und die Übelkeit könnten darauf hinweisen. |

## Experimental vignettes

Each participant saw eight of the twelve vignettes, in randomised order.

### Vignette 1: `case-anna-erkaeltung`

> Anna (28) klagt seit einigen Tagen über starke Halsschmerzen und anfallsartigen Keuchhusten. Zusätzlich hat sie eine verstopfte Nase, die ihr das Atmen erschwert. Immer wieder bekommt sie Fieber mit Schüttelfrost und fühlt sich insgesamt sehr geschwächt. Begleitend treten Kopf- und Ohrenschmerzen auf.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Erkältung | Die beschriebenen Beschwerden könnten zu einer Erkältung passen. Besonders der Husten, Kopf- und Ohrenschmerzen sowie Fieber mit Schüttelfrost treten häufig bei viralen Atemwegsinfekten auf. |
| B | Grippe (Influenza) | Die Beschwerden könnten zu einer Grippe passen. Besonders das Fieber mit Schüttelfrost, die Hals- und Kopfschmerzen sowie der starke Husten sprechen dafür. |
| C | Mittelohrentzündung | Die Beschwerden könnten auf eine Mittelohrentzündung hindeuten. Besonders die Ohrenschmerzen sowie das Fieber passen zu diesem Krankheitsbild. Auch Husten und eine verstopfte Nase können im Rahmen einer vorausgehenden Atemwegsinfektion auftreten. |

### Vignette 2: `case-martin-bronchitis`

> Martin (45) klagt seit mehreren Tagen über einen hartnäckigen Husten, der inzwischen von zähem Auswurf begleitet wird. Während der Hustenanfälle verspürt er stechende Schmerzen im Brustbereich und im Hals, teils verbunden mit Atembeschwerden. Zusätzlich ist seine Nase verstopft, er hat Fieber entwickelt und leidet an anhaltenden Kopfschmerzen.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Akute Bronchitis | Die Beschwerden könnten auf eine akute Bronchitis hindeuten. Besonders der anhaltende Husten mit Auswurf, das Fieber sowie die Brustschmerzen passen zu diesem Krankheitsbild. |
| B | Saisonale Allergie | Die beschriebenen Beschwerden könnten auf saisonale Allergien hindeuten. Besonders der Husten kann im Zusammenhang mit einer allergischen Reaktion stehen. |
| C | Asthma | Die Beschwerden könnten zu Asthma passen. Besonders die Atembeschwerden sowie die Hustenanfälle mit stechenden Brustschmerzen sprechen dafür. |

### Vignette 3: `case-daniel-belastungsreaktion`

> Daniel (32) berichtet seit einem tragischen Ereignis über starke innere Unruhe und anhaltende Angstzustände. Er fühlt sich erschöpft, schläft schlecht und wirkt insgesamt deutlich angespannt. Zudem klagt er über drückende Kopf- und Brustschmerzen sowie gelegentliche Schwindelgefühle.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Akute Belastungsreaktion | Die beschriebenen Beschwerden könnten zu einer akuten Belastungsreaktion passen. Besonders die ausgeprägte Erschöpfung sowie Schwindelgefühle und Kopfschmerzen treten in diesem Zusammenhang häufig auf. |
| B | Angststörung | Die beschriebenen Beschwerden könnten zu einer Angststörung passen. Besonders die anhaltenden Angstzustände sowie die Brust- und Kopfschmerzen treten dabei häufig auf. |
| C | Anpassungsstörung | Die beschriebenen Beschwerden könnten zu einer Anpassungsstörung passen. Besonders die ausgeprägte innere Unruhe sowie Schlafprobleme und anhaltende Angst und Anspannung sprechen dafür. |

### Vignette 4: `case-sophie-lungenentzuendung`

> Sophie (29) leidet seit einigen Tagen unter stechenden Schmerzen im Brust- und Halsbereich, die sich besonders beim Atmen und Husten verstärken. Sie hat deutliche Atembeschwerden mit Kurzatmigkeit und fühlt sich insgesamt stark geschwächt, begleitet von steigendem Fieber mit Schüttelfrost.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Lungenentzündung | Die beschriebenen Beschwerden könnten zu einer Lungenentzündung passen. Besonders die atemabhängigen Brustschmerzen, die zunehmende Atemnot sowie das Fieber mit Schüttelfrost sprechen dafür. |
| B | Kehlkopfentzündung | Die beschriebenen Beschwerden könnten zu einer Kehlkopfentzündung passen. Die Halsschmerzen und das stechende Schmerzgefühl im Halsbereich sowie die Atembeschwerden lassen sich damit vereinbaren. |
| C | Grippe (Influenza) | Die beschriebenen Beschwerden könnten zu einer Influenza passen. Das Fieber mit Schüttelfrost sowie die ausgeprägte Schwäche und die Atemwege bezogenen Symptome wie Halsschmerzen und Husten sprechen dafür. |

### Vignette 5: `case-jonas-trommelfellriss`

> Jonas (27) bemerkt seit kurzem ein deutlich schlechteres Hörvermögen auf dem rechten Ohr. Er beschreibt ein ziehendes Gefühl sowie gelegentliches Rauschen im Ohr, das sich wie „verstopft" anfühlt. Zudem ist das Ohr gerötet und es tritt zeitweise Flüssigkeit aus.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Trommelfellriss | Die beschriebenen Beschwerden könnten zu einem Trommelfellriss passen. Das austretende Sekret aus dem Ohr sowie das verstopfte Gefühl und das Ohrrauschen sprechen dafür. |
| B | Mittelohrentzündung | Die beschriebenen Beschwerden könnten zu einer Mittelohrentzündung passen. Das verstopfte Gefühl im Ohr mit vermindertem Hörvermögen sowie die Ohrschmerzen und das mögliche Auftreten von Flüssigkeit sprechen dafür. |
| C | Ohrenschmalzpfropf | Die beschriebenen Beschwerden könnten zu einem Ohrschmalzpfropf passen. Eine wahrgenommene Flüssigkeit im Ohr kann durch die Verlegung des Gehörgangs entstehen und auch das verminderte Hörvermögen spricht dafür. |

### Vignette 6: `case-lea-streptokokken`

> Lea (19) klagt seit zwei Tagen über starke Halsschmerzen, die bis in die Ohren ausstrahlen, sowie begleitende Kopfschmerzen. Ihre Nase ist verstopft, und das Schlucken fällt ihr deutlich schwer. Zusätzlich hat sie Fieber mit Schüttelfrost und berichtet über allgemeine Gliederschmerzen im ganzen Körper. Auffällig ist zudem ein feinfleckiger Hautausschlag, der sich am Rumpf entwickelt hat.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Streptokokkeninfektion | Die Beschwerden könnten zu einer Streptokokkeninfektion passen. Besonders der feinfleckige Hautausschlag am Rumpf in Kombination mit Fieber, Schüttelfrost und Halsschmerzen spricht dafür. |
| B | Kehlkopfentzündung | Die Beschwerden könnten zu einer Kehlkopfentzündung passen. Die Halsschmerzen mit deutlich eingeschränktem Schlucken sowie begleitende Infektzeichen der oberen Atemwege sprechen dafür. |
| C | Mandelentzündung | Die beschriebenen Beschwerden könnten zu einer Mandelentzündung passen. Besonders die starken Halsschmerzen und ein enges Gefühl im Hals sprechen dafür. |

### Vignette 7: `case-tim-karies`

> Tim (24) klagt seit einigen Tagen über zunehmende Zahnschmerzen, die teilweise ins Zahnfleisch sowie bis ins Ohr ausstrahlen. Zudem bemerkt er eine leichte Schwellung im Bereich des Kiefers und Untergesichts, wodurch sich das Gesicht gespannt anfühlt.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Karies | Die beschriebenen Beschwerden könnten zu Karies passen. Die Zahnschmerzen mit Ausstrahlung in den Kieferbereich sowie die lokale Schwellung sprechen für eine fortschreitende Zahnerkrankung. |
| B | Zahnabszess | Die Beschwerden könnten zu einem Zahnabszess passen. Die Schwellung im Bereich von Kiefer, Untergesicht und Lippe sowie die Zahnschmerzen sprechen für eine lokale eitrige Entzündung. |
| C | Zahnfleischentzündung | Die beschriebenen Beschwerden könnten zu einer Zahnfleischentzündung passen. Die Schmerzen im Zahnfleisch mit Ausstrahlung in Kiefer und Gesicht sowie die Zahnschmerzen sprechen dafür. |

### Vignette 8: `case-markus-bandscheibe`

> Markus (46) leidet unter starken Rückenschmerzen im Lendenbereich, die bis ins Bein ausstrahlen. Zusätzlich hat er Nackenschmerzen sowie eine zunehmende Schwäche im Bein. Gelegentlich treten Kribbeln und Taubheitsgefühle im Bein auf.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Bandscheibenvorfall | Die Beschwerden passen zu einem Bandscheibenvorfall. Die ausstrahlenden Schmerzen vom unteren Rücken ins Bein sowie Kribbeln, Taubheitsgefühle und Muskelschwäche sprechen dafür. |
| B | Chronische Rückenschmerzen | Die beschriebenen Beschwerden passen zu chronischen Rückenschmerzen. Die anhaltenden Schmerzen im unteren Rücken sowie die Ausstrahlung in Nacken und Hüfte sprechen dafür. |
| C | Wirbelbruch | Die Beschwerden passen zu einer Wirbelkörperfraktur. Die starken Rückenschmerzen mit Ausstrahlung in Hüfte und Nacken sowie neurologische Auffälligkeiten sprechen für eine mögliche strukturelle Schädigung der Wirbelsäule. |

### Vignette 9: `case-helga-alterswarzen`

> Helga (72) bemerkt seit einiger Zeit mehrere unregelmäßig aussehende Hautveränderungen am Rücken und an den Armen, die teils als kleine warzenartige Erhebungen erscheinen. Die betroffenen Stellen wirken leicht verdickt und zeigen vereinzelt dunklere Flecken. Gelegentlich jucken diese Hautareale, sind jedoch ansonsten nicht schmerzhaft.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Alterswarzen | Die beschriebenen Beschwerden könnten zu Alterswarzen passen. Die warzenartigen, leicht verdickten Hautveränderungen mit gelegentlichem Juckreiz sprechen dafür. |
| B | Hautkrebs | Die beschriebenen Beschwerden passen zu Hautkrebs. Unregelmäßige Hautveränderungen mit dunkleren Flecken und verdickten Arealen sprechen dafür. |
| C | Hautpigmentstörungen | Die beschriebenen Beschwerden könnten zu Hautpigmentstörungen passen. Die unregelmäßigen dunkleren Hautveränderungen sowie die trockenen und leicht verdickten Hautstellen sprechen dafür. |

### Vignette 10: `case-paul-ekzem`

> Paul (34) berichtet über stark juckende, trockene und schuppige Hautstellen, die gerötet und gereizt sind. Teilweise zeigen sich kleine pickelartige Veränderungen und unregelmäßige Hautareale. Zusätzlich treten immer wieder allergisch wirkende Reaktionen auf der Haut auf.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Ekzem (Dermatitis) | Die beschriebenen Beschwerden könnten zu einem Ekzem passen. Die stark juckenden, geröteten und schuppigen Hautstellen sowie die Hautreizungen sprechen dafür. |
| B | Hautpilz | Die beschriebenen Beschwerden passen zu einem Hautpilz. Die juckenden, schuppigen und geröteten Hautstellen sowie die unregelmäßigen Hautveränderungen sprechen dafür. |
| C | Akne | Die beschriebenen Beschwerden könnten zu Akne passen. Die pickelartigen Hautveränderungen sowie gereizte und unregelmäßige Hautareale sprechen dafür. |

### Vignette 11: `case-nina-bindehaut`

> Nina (26) klagt über gerötete, juckende und geschwollene Augen, die stark tränen und sich unangenehm gereizt anfühlen. Zusätzlich hat sie leichte Halsschmerzen sowie eine verstopfte Nase mit Schnupfen.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Bindehautentzündung | Die beschriebenen Beschwerden könnten zu einer Bindehautentzündung passen. Die geröteten, juckenden und tränenden Augen sowie die Schwellung sprechen dafür. |
| B | Hornhautentzündung | Die beschriebenen Beschwerden könnten zu einer Hornhautentzündung passen. Die geröteten, schmerzenden Augen mit Brennen und stechendem Schmerz sprechen dafür. |
| C | Fremdkörper im Auge | Die beschriebenen Beschwerden könnten zu einem Fremdkörper im Auge passen. Das stechende und brennende Schmerzgefühl sowie die Rötung und Reizung sprechen für eine mechanische Irritation der Augenoberfläche. |

### Vignette 12: `case-tomas-blase`

> Tomas (30) berichtet über häufigen, kaum kontrollierbaren Harndrang mit kleinen Urinmengen. Beim Wasserlassen treten deutliche Schmerzen auf. Zudem bemerkt er stechende Schmerzen im Unterbauch und Beckenbereich, die teilweise in den Rücken ausstrahlen. In einigen Fällen ist der Urin leicht blutig.

| Option | Diagnosis | Spoken explanation |
|---|---|---|
| A | Blasenentzündung | Die beschriebenen Beschwerden könnten zu einer Blasenentzündung passen. Der häufige Harndrang mit schmerzhaftem Wasserlassen sowie die Unterbauchschmerzen sprechen dafür. |
| B | Harnwegsinfektion | Die beschriebenen Beschwerden könnten zu einer Harnwegsinfektion passen. Die Schmerzen beim Wasserlassen sowie die Beschwerden im Unterbauch mit Ausstrahlung in den Rücken sprechen dafür. |
| C | Hämorrhoiden | Die beschriebenen Beschwerden könnten teilweise zu Hämorrhoiden passen. Schmerzen im Beckenbereich sowie Veränderungen beim Ausscheiden können damit verbunden sein. |
