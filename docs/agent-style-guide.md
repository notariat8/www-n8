# Agent Style Guide for www-n8

Status: verbindlich für Änderungen an öffentlich sichtbaren Texten
Modus: streng konservativ
Stand: 2026-06-09

## Zweck

Dieser Guide ist eine Arbeitsanweisung für Agenten und Bearbeiter von www-n8. Er soll verhindern, dass öffentliche Texte technisch, werblich oder juristisch unscharf werden.

www-n8 ist eine externe Website. Alles Sichtbare richtet sich an Notariate, Rechtsanwälte, Notarkammern, mögliche Partner und gegebenenfalls Behörden. Die Seite ist keine Entwicklerdokumentation und keine Werbeveranstaltung.

## Vor jeder Textänderung

Prüfe zuerst:

1. Betrifft die Änderung öffentlich sichtbare Sprache?
2. Ist die Aussage sachlich prüfbar?
3. Ist der Begriff für Notariat, Recht oder Governance anschlussfähig?
4. Wird ein technischer Begriff erklärt oder juristisch übersetzt?
5. Klingt der Text nüchtern genug für Notariate, Kammern, Partner und Behörden?

Bei Unsicherheit gilt: konservativer formulieren oder vor der Änderung nachfragen.

## Ton

Erlaubt:

- sachlich
- zurückhaltend
- juristisch anschlussfähig
- organisatorisch klar
- prüfbar
- fachlich nüchtern

Nicht erlaubt:

- werbliche Überhöhung
- Pitch-Sprache
- Entwicklerjargon ohne Erklärung
- pauschale Sicherheits-, Compliance- oder Rechtsversprechen
- juristische Begriffe als bloße Dekoration für technische Konzepte

## Quellenhierarchie

Für notarielle und juristische Begriffe gelten offizielle oder institutionell tragfähige Quellen zuerst:

1. Notar.de, Bundesnotarkammer, Notarkammern
2. BMJ und amtliche Quellen
3. Gesetzestexte und amtliche EU-Quellen
4. BSI, NIST und vergleichbare Fachstellen für Sicherheit und Software-Lieferketten
5. Fachliche Hilfsquellen wie `ofunk/claude-fuer-deutsches-recht` nur als Formulierungs- und Strukturhilfe

Hilfsquellen ersetzen keine offizielle Quelle für rechtliche oder regulatorische Aussagen.

## Technische Begriffe

Technische Begriffe dürfen nicht ungefiltert nach außen getragen werden. Wenn ein Begriff fachlich wichtig ist, wird er in die juristische oder organisatorische Welt übersetzt.

Bevorzugte Richtungen:

- `Repo` oder `Repository`: Referenzstand, Ablage für freigegebene Fassungen, nachvollziehbare Änderungshistorie
- `GitOps`: dokumentierte, versionierte und freigegebene Fassungen
- `Pull Request`: Änderungsvorschlag mit Prüfung und Freigabe
- `Commit`: nachvollziehbarer Änderungseintrag
- `GitHub`: Ort des Referenzstands, nicht Entwicklerplattform als Selbstzweck
- `Use Case`: fachlich abgegrenzter Vorgang, Vorgang, ausgewählter Vorgang
- `Use-Case-Viewer`: Vorgangsübersicht
- `Notariatsprozesse`: digitale Vorgangsbearbeitung, notarielle Vorgänge, freigegebene Arbeits- und Prüfabläufe
- `Prozesse`: Vorgänge oder Abläufe, je nach Kontext
- `Workflow`: freigegebener Arbeits- und Prüfablauf, Ablauf mit Prüfpunkten, Vorgangsbearbeitung
- `BPMN`: fachliche Prozessmodellierung (BPMN)
- `digital first`: zuerst digital abgebildet oder vorrangig digital bearbeitet

Auf der deutschen öffentlichen Seite sollen `Use Case`, `Use-Case-Viewer`, `Prozess-View`, `Notariatsprozesse`, generisches `Prozesse`, generisches `Workflow` und `digital first` nicht sichtbar stehen. Der fachliche Begriff ist der Vorgang; der prüfbare Ablauf ist der freigegebene Arbeits- und Prüfablauf.

Auf der englischen öffentlichen Seite gelten entsprechend `matter`, `matter overview`, `digital matter handling`, `approved work and review flow` und `process modeling (BPMN)`. `use case`, `use-case viewer`, `process view`, `digital notarial processes`, generisches `workflow` und `digital first` sind dort ebenfalls zu vermeiden.

## Mandantenfähigkeit

`Mandantenfähigkeit` ist erlaubt und wichtig, muss aber organisationsbezogen erklärt werden. Der juristische Begriff `Mandant` und der technische Begriff `Tenant` dürfen nicht vermischt werden.

Bevorzugte Formulierung:

> Die Anwendung ist mandantenfähig angelegt: Arbeitsbereiche, Zuständigkeiten, Daten, Freigaben und Arbeitsstände werden je Organisation getrennt geführt.

Englische Richtung:

> The application is designed for organizational separation: work areas, responsibilities, data, approvals, and working states are kept separate by organization.

## Vollzug

`Vollzug` ist kein Synonym für Workflow.

Der Begriff passt, wenn es um die Durchführung oder Umsetzung eines beurkundeten, beglaubigten, registerbezogenen oder behördenbezogenen Vorgangs geht, etwa Grundbuchvollzug, Registervollzug, Einreichungen, Anzeigen, Genehmigungen, Zustimmungen, Fristen, Nachweise oder behördliche Rückmeldungen.

Für generische Abläufe nutze stattdessen:

- fachlich freigegebener Arbeits- und Prüfablauf
- Ablauf mit Prüfpunkten
- Vorgangsbearbeitung
- dokumentierte Bearbeitung

`Vollzug` darf nicht mit `Vollstreckung` verwechselt werden.

## SBOM

`SBOM` ist erlaubt, wenn der Begriff beim ersten Auftreten erklärt wird. Die Langform lautet `Software Bill of Materials (SBOM)`. Deutsch kann ergänzend `Software-Stückliste` verwendet werden.

Zulässige Bedeutung:

- Dokumentation verwendeter eigener, Drittanbieter- und Open-Source-Komponenten
- Bezug auf eine freigegebene Fassung
- Versionen und Abhängigkeiten
- Nachvollziehbarkeit von Änderungen über die Zeit
- Grundlage für Sicherheits- und Lizenzprüfung

Nicht zulässig:

- SBOM als Sicherheitsgarantie
- SBOM als Nachweis vollständiger Rechtskonformität
- SBOM als Ersatz für Schwachstellenbewertung

Geeignete Formulierung, wenn eine SBOM tatsächlich gepflegt und geprüft ist:

> Open Source bleibt nachvollziehbar, wenn eine Software Bill of Materials (SBOM) für die jeweilige freigegebene Fassung gepflegt und geprüft wird. Diese Software-Stückliste zeigt, welche Komponenten, Versionen und Abhängigkeiten verwendet werden. So lassen sich Änderungen über die Zeit, Sicherheitsmeldungen und Lizenzfragen einer konkreten Fassung zuordnen.

## Gesperrte Begriffe

Auf öffentlich sichtbaren Seiten nicht verwenden:

- `Tenant`
- `Control Plane`

Ein technischer Begriff bleibt gesperrt, solange sein externer Zweck, seine Zielgruppe und seine rechtliche oder organisatorische Bedeutung nicht klar beschrieben sind.

Einmalige Tippfehler oder Missverständnisse werden nicht als Begriffe dokumentiert.

## Review-Checkliste

Vor Abschluss einer Änderung:

1. Der Text ist für Notariate, Rechtsanwälte, Notarkammern, Partner und Behörden geeignet.
2. Technische Begriffe sind erklärt oder übersetzt.
3. Juristische Begriffe werden nicht zweckentfremdet.
4. Sicherheits- und Governance-Aussagen sind prüfbar.
5. `styleguide.json` und die Content-Tests widersprechen der Änderung nicht.
6. Deutsche Texte verwenden `ä`, `ö`, `ü`, `Ä`, `Ö`, `Ü` und `ß`, wenn die deutsche Rechtschreibung sie verlangt.
