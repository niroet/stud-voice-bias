<svelte:head>
	<title>STUD – Datenschutzerklärung</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
	<h1 class="mb-6 text-2xl font-semibold">Datenschutzerklärung</h1>

	<div class="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
		<h2 class="mb-2 mt-6 text-lg font-semibold">1. Verantwortliche Stelle</h2>
		<p>
			Niklas Röthlingshöfer, Studierender<br />
			Technische Hochschule Ingolstadt<br />
			Esplanade 10<br />
			85049 Ingolstadt<br />
			E-Mail: <a class="text-brand-600 underline" href="mailto:nir1031@thi.de">nir1031@thi.de</a>
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">2. Zweck der Datenverarbeitung und Studienteam</h2>
		<p>
			Diese Webanwendung ist Teil eines Forschungsprojekts an der Technischen Hochschule
			Ingolstadt zur Untersuchung des Einflusses von Stimmtypen auf Entscheidungen bei
			KI-Symptom-Checkern. Zweck der Datenverarbeitung ist ausschließlich die wissenschaftliche
			Auswertung der erhobenen Studiendaten.
		</p>
		<p class="mt-2">
			Die Studie wird gemeinsam durchgeführt von:
			<strong>Niklas Röthlingshöfer</strong>, <strong>Melanie Löffler</strong> und
			<strong>Emma Winkler</strong>. Die Verantwortlichkeit im Sinne des Art. 4 Nr. 7 DSGVO liegt
			bei Niklas Röthlingshöfer als zentralem Ansprechpartner; Zugriff auf die Studiendatenbank
			haben ausschließlich die drei genannten Personen zum Zweck der wissenschaftlichen
			Auswertung.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">3. Welche Daten werden erhoben</h2>
		<p>Im Rahmen der Studienteilnahme werden folgende Daten gespeichert:</p>
		<ul class="ml-6 list-disc space-y-1">
			<li>
				<strong>Demografische Angaben</strong>: Altersgruppe, Geschlecht, selbsteingeschätzte
				Erfahrung mit Symptom-Checkern und Sprach-KI.
			</li>
			<li>
				<strong>Studienantworten</strong>: Diagnose-Einschätzungen, Konfidenz-Bewertungen,
				Reaktionszeiten und das Hören der KI-Audios.
			</li>
			<li>
				<strong>Stimm-Wahrnehmungs-Items</strong>: Likert-Bewertungen der beiden in der Studie
				verwendeten Stimmen (z.&nbsp;B. natürlich/künstlich, kompetent/inkompetent).
			</li>
			<li>
				<strong>Technische Sitzungs-ID</strong>: eine zufällig generierte UUID zur Verknüpfung der
				Antworten innerhalb einer Sitzung; sie enthält keinerlei Personenbezug.
			</li>
			<li>
				<strong>Tab-Wechsel-Indikator</strong>: ein boolescher Marker, ob während eines
				Audio-Trials der Tab kurzzeitig inaktiv war (Qualitätsmerkmal der Datenqualität).
			</li>
		</ul>
		<p class="mt-3">
			<strong>Nicht erhoben werden</strong>: Name, E-Mail-Adresse, IP-Adresse, Browser-Fingerprint,
			Standortdaten oder anderweitige direkt oder indirekt personenidentifizierende Merkmale.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">4. Rechtsgrundlage</h2>
		<p>
			Rechtsgrundlage für die Datenverarbeitung ist Ihre Einwilligung gemäß
			<strong>Art. 6 Abs. 1 lit. a DSGVO</strong>, die Sie zu Beginn der Studie auf dem
			Einverständnis-Bildschirm aktiv erteilen. Ohne diese Einwilligung wird keine Studienteilnahme
			ermöglicht.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">5. Speicherdauer</h2>
		<p>
			Die Studiendatenbank wird nach Abschluss der wissenschaftlichen Auswertung gelöscht.
			Anonymisierte Datensätze ohne Sitzungs-ID werden dauerhaft aufbewahrt.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">6. Empfänger der Daten</h2>
		<p>
			Die Studiendatenbank wird ausschließlich von der oben genannten verantwortlichen Stelle zur
			wissenschaftlichen Auswertung verarbeitet. Anonymisierte Datensätze können zusammen mit
			wissenschaftlichen Veröffentlichungen öffentlich bereitgestellt werden. Eine Weitergabe zu
			kommerziellen oder Werbezwecken findet nicht statt.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">7. Auftragsverarbeitung (Hosting)</h2>
		<p>
			Die Webanwendung wird auf einem Server der <strong>Hetzner Online GmbH</strong>
			(Industriestraße 25, 91710 Gunzenhausen) im Rechenzentrum Nürnberg gehostet. Mit dem
			Anbieter besteht ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO. Die
			Datenverarbeitung findet ausschließlich innerhalb der Europäischen Union statt.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">8. Cookies und Tracking</h2>
		<p>
			Probanden erhalten <strong>kein Cookie</strong> und werden nicht getrackt. Die einzige
			gespeicherte Information während der Sitzung ist die Sitzungs-ID in der URL — diese ist
			anonym und wird nicht über die Studienteilnahme hinaus verwendet. Es kommen keine
			Analyse-Tools, kein Google Analytics, keine Social-Media-Plugins zum Einsatz.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">9. Verschlüsselung</h2>
		<p>
			Sämtliche Datenübertragung zwischen Ihrem Gerät und dem Server erfolgt
			TLS-verschlüsselt (HTTPS). Die Datenbank auf dem Server liegt im Klartext vor; sie ist nur
			Personen mit Server-Zugang zugänglich.
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">10. Ihre Rechte</h2>
		<p>Sie haben grundsätzlich folgende Rechte:</p>
		<ul class="ml-6 list-disc space-y-1">
			<li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
			<li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
			<li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
			<li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
			<li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
			<li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
			<li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
		</ul>
		<p class="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
			<strong>Wichtiger Hinweis zur Anonymität:</strong> Da wir bewusst keine
			personenidentifizierenden Daten erheben, können wir einen einzelnen Datensatz nach
			Studienabschluss nicht mehr Ihnen zuordnen. Eine nachträgliche Auskunft, Berichtigung oder
			Löschung Ihres individuellen Datensatzes ist daher technisch nicht möglich. Während der
			laufenden Studienteilnahme können Sie jederzeit den Tab schließen. Die bis dahin
			erhobenen Daten verbleiben als unvollständige Sitzung in der Datenbank (siehe Punkt 5).
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">11. Beschwerderecht</h2>
		<p>
			Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren:
		</p>
		<p class="ml-2">
			Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
			Promenade 18<br />
			91522 Ansbach<br />
			<a class="text-brand-600 underline" href="https://www.lda.bayern.de"
				>www.lda.bayern.de</a
			>
		</p>

		<h2 class="mb-2 mt-6 text-lg font-semibold">12. Kontakt bei Datenschutzfragen</h2>
		<p>
			Für Fragen zum Datenschutz oder zur Studie wenden Sie sich bitte an:
			<a class="text-brand-600 underline" href="mailto:nir1031@thi.de">nir1031@thi.de</a>
		</p>

		<p class="mt-8 text-xs text-slate-500">Stand: September 2026</p>
	</div>

	<div class="mt-10">
		<a href="/study/consent" class="text-sm text-brand-600 underline">← zurück zur Einwilligung</a>
	</div>
</div>
