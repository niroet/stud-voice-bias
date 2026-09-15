import { db } from './index';
import { cases } from './schema';

const PLACEHOLDER_AUDIOS = {
	anthropomorphic: { A: '/audio/placeholder.mp3', B: '/audio/placeholder.mp3', C: '/audio/placeholder.mp3' },
	machine: { A: '/audio/placeholder.mp3', B: '/audio/placeholder.mp3', C: '/audio/placeholder.mp3' }
};

type SeedCase = {
	id: string;
	symptoms: string;
	optionA: string;
	optionB: string;
	optionC: string;
	explainA: string;
	explainB: string;
	explainC: string;
	active: boolean;
	order: number;
};

const PRACTICE: SeedCase = {
	id: 'practice',
	symptoms:
		'Maximilian (23) hat seit gestern Bauchschmerzen, nachdem er drei große Pizzen hintereinander gegessen hat. Ihm ist leicht übel.',
	optionA: 'Magen-Überlastung durch übermäßiges Essen',
	optionB: 'Lebensmittelvergiftung',
	optionC: 'Sodbrennen / Reflux',
	explainA:
		'Die Symptome traten direkt nach einer sehr großen Mahlzeit auf, was typisch für eine akute Magenüberlastung ist. Die leichte Übelkeit passt dazu, dass der Magen schlicht überdehnt wurde.',
	explainB:
		'Bauchschmerzen und Übelkeit nach einer Mahlzeit können auf eine Lebensmittelvergiftung hindeuten. Verdorbene Speisen lösen häufig genau solche Beschwerden aus, und der zeitliche Zusammenhang mit dem Essen passt gut zu dieser Diagnose.',
	explainC:
		'Sodbrennen entsteht häufig nach üppigen Mahlzeiten durch aufsteigende Magensäure. Die beschriebenen Bauchschmerzen und die Übelkeit könnten darauf hinweisen.',
	active: false,
	order: 0
};

const CASES: SeedCase[] = [
	{
		id: 'case-anna-erkaeltung',
		symptoms:
			'Anna (28) klagt seit einigen Tagen über starke Halsschmerzen und anfallsartigen Keuchhusten. Zusätzlich hat sie eine verstopfte Nase, die ihr das Atmen erschwert. Immer wieder bekommt sie Fieber mit Schüttelfrost und fühlt sich insgesamt sehr geschwächt. Begleitend treten Kopf- und Ohrenschmerzen auf.',
		optionA: 'Erkältung',
		optionB: 'Grippe (Influenza)',
		optionC: 'Mittelohrentzündung',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einer Erkältung passen. Besonders der Husten, Kopf- und Ohrenschmerzen sowie Fieber mit Schüttelfrost treten häufig bei viralen Atemwegsinfekten auf.',
		explainB:
			'Die Beschwerden könnten zu einer Grippe passen. Besonders das Fieber mit Schüttelfrost, die Hals- und Kopfschmerzen sowie der starke Husten sprechen dafür.',
		explainC:
			'Die Beschwerden könnten auf eine Mittelohrentzündung hindeuten. Besonders die Ohrenschmerzen sowie das Fieber passen zu diesem Krankheitsbild. Auch Husten und eine verstopfte Nase können im Rahmen einer vorausgehenden Atemwegsinfektion auftreten.',
		active: true,
		order: 1
	},
	{
		id: 'case-martin-bronchitis',
		symptoms:
			'Martin (45) klagt seit mehreren Tagen über einen hartnäckigen Husten, der inzwischen von zähem Auswurf begleitet wird. Während der Hustenanfälle verspürt er stechende Schmerzen im Brustbereich und im Hals, teils verbunden mit Atembeschwerden. Zusätzlich ist seine Nase verstopft, er hat Fieber entwickelt und leidet an anhaltenden Kopfschmerzen.',
		optionA: 'Akute Bronchitis',
		optionB: 'Saisonale Allergie',
		optionC: 'Asthma',
		explainA:
			'Die Beschwerden könnten auf eine akute Bronchitis hindeuten. Besonders der anhaltende Husten mit Auswurf, das Fieber sowie die Brustschmerzen passen zu diesem Krankheitsbild.',
		explainB:
			'Die beschriebenen Beschwerden könnten auf saisonale Allergien hindeuten. Besonders der Husten kann im Zusammenhang mit einer allergischen Reaktion stehen.',
		explainC:
			'Die Beschwerden könnten zu Asthma passen. Besonders die Atembeschwerden sowie die Hustenanfälle mit stechenden Brustschmerzen sprechen dafür.',
		active: true,
		order: 2
	},
	{
		id: 'case-daniel-belastungsreaktion',
		symptoms:
			'Daniel (32) berichtet seit einem tragischen Ereignis über starke innere Unruhe und anhaltende Angstzustände. Er fühlt sich erschöpft, schläft schlecht und wirkt insgesamt deutlich angespannt. Zudem klagt er über drückende Kopf- und Brustschmerzen sowie gelegentliche Schwindelgefühle.',
		optionA: 'Akute Belastungsreaktion',
		optionB: 'Angststörung',
		optionC: 'Anpassungsstörung',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einer akuten Belastungsreaktion passen. Besonders die ausgeprägte Erschöpfung sowie Schwindelgefühle und Kopfschmerzen treten in diesem Zusammenhang häufig auf.',
		explainB:
			'Die beschriebenen Beschwerden könnten zu einer Angststörung passen. Besonders die anhaltenden Angstzustände sowie die Brust- und Kopfschmerzen treten dabei häufig auf.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einer Anpassungsstörung passen. Besonders die ausgeprägte innere Unruhe sowie Schlafprobleme und anhaltende Angst und Anspannung sprechen dafür.',
		active: true,
		order: 3
	},
	{
		id: 'case-sophie-lungenentzuendung',
		symptoms:
			'Sophie (29) leidet seit einigen Tagen unter stechenden Schmerzen im Brust- und Halsbereich, die sich besonders beim Atmen und Husten verstärken. Sie hat deutliche Atembeschwerden mit Kurzatmigkeit und fühlt sich insgesamt stark geschwächt, begleitet von steigendem Fieber mit Schüttelfrost.',
		optionA: 'Lungenentzündung',
		optionB: 'Kehlkopfentzündung',
		optionC: 'Grippe (Influenza)',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einer Lungenentzündung passen. Besonders die atemabhängigen Brustschmerzen, die zunehmende Atemnot sowie das Fieber mit Schüttelfrost sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden könnten zu einer Kehlkopfentzündung passen. Die Halsschmerzen und das stechende Schmerzgefühl im Halsbereich sowie die Atembeschwerden lassen sich damit vereinbaren.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einer Influenza passen. Das Fieber mit Schüttelfrost sowie die ausgeprägte Schwäche und die Atemwege bezogenen Symptome wie Halsschmerzen und Husten sprechen dafür.',
		active: true,
		order: 4
	},
	{
		id: 'case-jonas-trommelfellriss',
		symptoms:
			'Jonas (27) bemerkt seit kurzem ein deutlich schlechteres Hörvermögen auf dem rechten Ohr. Er beschreibt ein ziehendes Gefühl sowie gelegentliches Rauschen im Ohr, das sich wie „verstopft" anfühlt. Zudem ist das Ohr gerötet und es tritt zeitweise Flüssigkeit aus.',
		optionA: 'Trommelfellriss',
		optionB: 'Mittelohrentzündung',
		optionC: 'Ohrenschmalzpfropf',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einem Trommelfellriss passen. Das austretende Sekret aus dem Ohr sowie das verstopfte Gefühl und das Ohrrauschen sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden könnten zu einer Mittelohrentzündung passen. Das verstopfte Gefühl im Ohr mit vermindertem Hörvermögen sowie die Ohrschmerzen und das mögliche Auftreten von Flüssigkeit sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einem Ohrschmalzpfropf passen. Eine wahrgenommene Flüssigkeit im Ohr kann durch die Verlegung des Gehörgangs entstehen und auch das verminderte Hörvermögen spricht dafür.',
		active: true,
		order: 5
	},
	{
		id: 'case-lea-streptokokken',
		symptoms:
			'Lea (19) klagt seit zwei Tagen über starke Halsschmerzen, die bis in die Ohren ausstrahlen, sowie begleitende Kopfschmerzen. Ihre Nase ist verstopft, und das Schlucken fällt ihr deutlich schwer. Zusätzlich hat sie Fieber mit Schüttelfrost und berichtet über allgemeine Gliederschmerzen im ganzen Körper. Auffällig ist zudem ein feinfleckiger Hautausschlag, der sich am Rumpf entwickelt hat.',
		optionA: 'Streptokokkeninfektion',
		optionB: 'Kehlkopfentzündung',
		optionC: 'Mandelentzündung',
		explainA:
			'Die Beschwerden könnten zu einer Streptokokkeninfektion passen. Besonders der feinfleckige Hautausschlag am Rumpf in Kombination mit Fieber, Schüttelfrost und Halsschmerzen spricht dafür.',
		explainB:
			'Die Beschwerden könnten zu einer Kehlkopfentzündung passen. Die Halsschmerzen mit deutlich eingeschränktem Schlucken sowie begleitende Infektzeichen der oberen Atemwege sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einer Mandelentzündung passen. Besonders die starken Halsschmerzen und ein enges Gefühl im Hals sprechen dafür.',
		active: true,
		order: 6
	},
	{
		id: 'case-tim-karies',
		symptoms:
			'Tim (24) klagt seit einigen Tagen über zunehmende Zahnschmerzen, die teilweise ins Zahnfleisch sowie bis ins Ohr ausstrahlen. Zudem bemerkt er eine leichte Schwellung im Bereich des Kiefers und Untergesichts, wodurch sich das Gesicht gespannt anfühlt.',
		optionA: 'Karies',
		optionB: 'Zahnabszess',
		optionC: 'Zahnfleischentzündung',
		explainA:
			'Die beschriebenen Beschwerden könnten zu Karies passen. Die Zahnschmerzen mit Ausstrahlung in den Kieferbereich sowie die lokale Schwellung sprechen für eine fortschreitende Zahnerkrankung.',
		explainB:
			'Die Beschwerden könnten zu einem Zahnabszess passen. Die Schwellung im Bereich von Kiefer, Untergesicht und Lippe sowie die Zahnschmerzen sprechen für eine lokale eitrige Entzündung.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einer Zahnfleischentzündung passen. Die Schmerzen im Zahnfleisch mit Ausstrahlung in Kiefer und Gesicht sowie die Zahnschmerzen sprechen dafür.',
		active: true,
		order: 7
	},
	{
		id: 'case-markus-bandscheibe',
		symptoms:
			'Markus (46) leidet unter starken Rückenschmerzen im Lendenbereich, die bis ins Bein ausstrahlen. Zusätzlich hat er Nackenschmerzen sowie eine zunehmende Schwäche im Bein. Gelegentlich treten Kribbeln und Taubheitsgefühle im Bein auf.',
		optionA: 'Bandscheibenvorfall',
		optionB: 'Chronische Rückenschmerzen',
		optionC: 'Wirbelbruch',
		explainA:
			'Die Beschwerden passen zu einem Bandscheibenvorfall. Die ausstrahlenden Schmerzen vom unteren Rücken ins Bein sowie Kribbeln, Taubheitsgefühle und Muskelschwäche sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden passen zu chronischen Rückenschmerzen. Die anhaltenden Schmerzen im unteren Rücken sowie die Ausstrahlung in Nacken und Hüfte sprechen dafür.',
		explainC:
			'Die Beschwerden passen zu einer Wirbelkörperfraktur. Die starken Rückenschmerzen mit Ausstrahlung in Hüfte und Nacken sowie neurologische Auffälligkeiten sprechen für eine mögliche strukturelle Schädigung der Wirbelsäule.',
		active: true,
		order: 8
	},
	{
		id: 'case-helga-alterswarzen',
		symptoms:
			'Helga (72) bemerkt seit einiger Zeit mehrere unregelmäßig aussehende Hautveränderungen am Rücken und an den Armen, die teils als kleine warzenartige Erhebungen erscheinen. Die betroffenen Stellen wirken leicht verdickt und zeigen vereinzelt dunklere Flecken. Gelegentlich jucken diese Hautareale, sind jedoch ansonsten nicht schmerzhaft.',
		optionA: 'Alterswarzen',
		optionB: 'Hautkrebs',
		optionC: 'Hautpigmentstörungen',
		explainA:
			'Die beschriebenen Beschwerden könnten zu Alterswarzen passen. Die warzenartigen, leicht verdickten Hautveränderungen mit gelegentlichem Juckreiz sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden passen zu Hautkrebs. Unregelmäßige Hautveränderungen mit dunkleren Flecken und verdickten Arealen sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu Hautpigmentstörungen passen. Die unregelmäßigen dunkleren Hautveränderungen sowie die trockenen und leicht verdickten Hautstellen sprechen dafür.',
		active: true,
		order: 9
	},
	{
		id: 'case-paul-ekzem',
		symptoms:
			'Paul (34) berichtet über stark juckende, trockene und schuppige Hautstellen, die gerötet und gereizt sind. Teilweise zeigen sich kleine pickelartige Veränderungen und unregelmäßige Hautareale. Zusätzlich treten immer wieder allergisch wirkende Reaktionen auf der Haut auf.',
		optionA: 'Ekzem (Dermatitis)',
		optionB: 'Hautpilz',
		optionC: 'Akne',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einem Ekzem passen. Die stark juckenden, geröteten und schuppigen Hautstellen sowie die Hautreizungen sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden passen zu einem Hautpilz. Die juckenden, schuppigen und geröteten Hautstellen sowie die unregelmäßigen Hautveränderungen sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu Akne passen. Die pickelartigen Hautveränderungen sowie gereizte und unregelmäßige Hautareale sprechen dafür.',
		active: true,
		order: 10
	},
	{
		id: 'case-nina-bindehaut',
		symptoms:
			'Nina (26) klagt über gerötete, juckende und geschwollene Augen, die stark tränen und sich unangenehm gereizt anfühlen. Zusätzlich hat sie leichte Halsschmerzen sowie eine verstopfte Nase mit Schnupfen.',
		optionA: 'Bindehautentzündung',
		optionB: 'Hornhautentzündung',
		optionC: 'Fremdkörper im Auge',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einer Bindehautentzündung passen. Die geröteten, juckenden und tränenden Augen sowie die Schwellung sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden könnten zu einer Hornhautentzündung passen. Die geröteten, schmerzenden Augen mit Brennen und stechendem Schmerz sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten zu einem Fremdkörper im Auge passen. Das stechende und brennende Schmerzgefühl sowie die Rötung und Reizung sprechen für eine mechanische Irritation der Augenoberfläche.',
		active: true,
		order: 11
	},
	{
		// In der Vorlage steht "bemerkt sie", korrigiert zu "er".
		id: 'case-tomas-blase',
		symptoms:
			'Tomas (30) berichtet über häufigen, kaum kontrollierbaren Harndrang mit kleinen Urinmengen. Beim Wasserlassen treten deutliche Schmerzen auf. Zudem bemerkt er stechende Schmerzen im Unterbauch und Beckenbereich, die teilweise in den Rücken ausstrahlen. In einigen Fällen ist der Urin leicht blutig.',
		optionA: 'Blasenentzündung',
		optionB: 'Harnwegsinfektion',
		optionC: 'Hämorrhoiden',
		explainA:
			'Die beschriebenen Beschwerden könnten zu einer Blasenentzündung passen. Der häufige Harndrang mit schmerzhaftem Wasserlassen sowie die Unterbauchschmerzen sprechen dafür.',
		explainB:
			'Die beschriebenen Beschwerden könnten zu einer Harnwegsinfektion passen. Die Schmerzen beim Wasserlassen sowie die Beschwerden im Unterbauch mit Ausstrahlung in den Rücken sprechen dafür.',
		explainC:
			'Die beschriebenen Beschwerden könnten teilweise zu Hämorrhoiden passen. Schmerzen im Beckenbereich sowie Veränderungen beim Ausscheiden können damit verbunden sein.',
		active: true,
		order: 12
	}
];

const existing = await db.select({ id: cases.id }).from(cases);
if (existing.length > 0) {
	console.error(`Abbruch: DB enthält bereits ${existing.length} Cases.`);
	process.exit(1);
}

await db.insert(cases).values([PRACTICE, ...CASES].map((c) => ({ ...c, audios: PLACEHOLDER_AUDIOS })));
console.log(`${1 + CASES.length} Cases angelegt (1 Practice, ${CASES.length} aktiv).`);
