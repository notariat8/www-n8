# Design-Spec: Streng konservativer Style Guide für www-n8

Datum: 2026-06-09
Status: Entwurf zur Nutzerprüfung
Projekt: www-n8 / notariat8.de

## Ziel

Für www-n8 soll ein verbindlicher Style Guide entstehen, der künftige Änderungen an öffentlich sichtbaren Texten prüfbar macht. Der Guide richtet sich primär an Agenten und Bearbeiter, nicht an Website-Besucher. Er soll sicherstellen, dass neue Texte zur Zielgruppe, zum juristischen Kontext und zum externen Charakter der Website passen.

Die Website ist keine Werbeveranstaltung und keine Entwicklerdokumentation. Sie richtet sich an Notariate, Rechtsanwälte, Notarkammern, mögliche Partner und gegebenenfalls Behörden. Alle sichtbaren Aussagen müssen sachlich, prüfbar, juristisch anschlussfähig und fachlich nüchtern formuliert sein.

## Geltungsbereich

Der Style Guide gilt für alle öffentlich sichtbaren Inhalte von www-n8:

- deutsche Seiten, insbesondere `index.html` und `repo-governance.html`
- englische Seiten, insbesondere `en/index.html`
- rechtliche Seiten und Kontakt-/Impressums-/Datenschutztexte, soweit sie im Repository liegen
- künftige öffentliche Ergänzungen auf notariat8.de

Nicht im Fokus stehen interne Entwicklernotizen, Build-Skripte oder rein technische Testnamen. Sobald ein technischer Begriff aber sichtbar auf der Website erscheint oder in einem öffentlich sichtbaren Attribut verwendet wird, fällt er unter den Guide.

## Grundhaltung

Der Modus ist streng konservativ.

Texte sollen:

- sachlich und zurückhaltend klingen
- rechtlich und organisatorisch anschlussfähig sein
- Fachbegriffe nur verwenden, wenn sie erklärt oder aus dem notariellen/juristischen Kontext hergeleitet werden
- Aussagen so formulieren, dass sie anhand von Quellen, Produktverhalten oder Projektartefakten überprüfbar sind
- keine übersteigernden Versprechen, Marketingformeln oder IT-Jargon enthalten

Texte sollen nicht:

- wie Produktwerbung, Pitch Deck oder Entwicklerblog klingen
- technische Innenbegriffe ungefiltert nach außen tragen
- Sicherheit, Compliance oder Rechtskonformität pauschal behaupten
- juristische Begriffe als dekorative Synonyme für technische Konzepte verwenden

## Informationsarchitektur

Es sollen drei Artefakte entstehen:

1. `docs/agent-style-guide.md`
   Menschlich lesbarer Style Guide. Er erklärt Zielgruppe, Ton, Quellenhierarchie, Begriffsregeln und Beispiele.

2. `styleguide.json`
   Maschinenlesbare Regeln für Agenten und Tests. Die Datei enthält Zielgruppe, Tonregeln, Quellenpriorität, blockierte Begriffe, erklärungspflichtige Begriffe, bevorzugte Übersetzungen und Prüf-Checklisten.

3. Verweis in `AGENTS.md`
   Ein kurzer Hinweis, dass bei Änderungen an öffentlich sichtbaren Texten zuerst der Style Guide zu prüfen ist.

Die eigentliche Website soll erst nach Freigabe dieses Designs und nach Erstellung der Guide-Dateien geändert werden.

## Datenfluss Für Künftige Änderungen

Wenn ein Prompt eine Änderung an der Website verlangt, soll der Agent künftig diesen Ablauf verwenden:

1. Prüfen, ob die Änderung öffentlich sichtbare Sprache betrifft.
2. `docs/agent-style-guide.md` lesen.
3. `styleguide.json` gegen vorgeschlagene Begriffe und Formulierungen anwenden.
4. Bei juristischen oder sicherheitsbezogenen Aussagen die Quellenhierarchie prüfen.
5. Erst danach Textänderungen vorschlagen oder umsetzen.
6. Tests ausführen, die verbotene und erklärungspflichtige Begriffe prüfen.

Bei Unsicherheit gilt: nach außen konservativer formulieren oder vor Umsetzung nachfragen.

## Quellenhierarchie

Für juristische und notarielle Begriffe sollen offizielle oder institutionell tragfähige Quellen Vorrang haben:

1. Notar.de, Bundesnotarkammer, Notarkammern
2. BMJ/BMJ-nahe Informationsangebote und einschlägige amtliche Quellen
3. Gesetzestexte und amtliche EU-Quellen
4. BSI, NIST und vergleichbare Fachstellen für Sicherheit und Software-Lieferketten
5. Fachliche Hilfsquellen, etwa `ofunk/claude-fuer-deutsches-recht`, nur als Formulierungs- und Strukturhilfe

Hilfsquellen ersetzen keine offizielle Quelle für rechtliche oder regulatorische Aussagen.

Referenzquellen für die erste Fassung:

- Notar.de Glossar: https://www.notar.de/themen/glossar
- BMJ zu Beurkundungen: https://www.bmjv.de/DE/themen/wege_zum_recht/rechtsanwaelte_notare/beurkundung/beurkundung.html
- BNotK/Westfälische Notarkammer Glossar: https://www.westfaelische-notarkammer.de/buergerservice/glossar/V
- BSI Cyber Resilience Act: https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Cyber_Resilience_Act/cyber_resilience_act_node.html
- BSI TR-03183: https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03183/tr-03183.html
- NIST SBOM: https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-supply-chain-security-guidance-20
- EU Cyber Resilience Act: https://eur-lex.europa.eu/eli/reg/2024/2847/oj
- Bitkom Open Source Guide: https://www.bitkom.org/sites/main/files/2024-04/bitkom-opensource-guide-en.pdf
- Hilfsquelle für Stil und juristische Umschreibung: https://github.com/ofunk/claude-fuer-deutsches-recht

## Begriffspolitik

### Blockiert

`Tenant` darf auf öffentlich sichtbaren deutschen Seiten nicht verwendet werden. Auf englischen Seiten ist der Begriff ebenfalls zu vermeiden, solange er nicht zwingend durch einen konkreten fachlichen Kontext erforderlich wird.

`Control Plane` ist nicht freigegeben. Der Begriff bleibt gesperrt, bis sein externer Zweck, seine Zielgruppe und seine rechtliche oder organisatorische Bedeutung klar beschrieben sind.

### Erlaubt Mit Erklärung

`Mandantenfähigkeit` ist erlaubt und fachlich wichtig. Der Begriff ist unter Sicherheit und Governance zu erklären. Wegen der Kollision zwischen juristischem Mandantenbegriff und technischer Mandantenfähigkeit muss die Erklärung organisationsbezogen sein.

Bevorzugte deutsche Richtung:

> Die Anwendung ist mandantenfähig angelegt: Arbeitsbereiche, Zuständigkeiten, Daten, Freigaben und Arbeitsstände werden je Organisation getrennt geführt.

Bevorzugte englische Richtung:

> The application is designed for organizational separation: work areas, responsibilities, data, approvals, and working states are kept separate by organization.

`SBOM` ist erlaubt, wenn der Begriff beim ersten Auftreten erklärt wird. Die bevorzugte Langform lautet `Software Bill of Materials (SBOM)`; deutsch kann ergänzend `Software-Stückliste` verwendet werden.

SBOM darf nur sachlich beschrieben werden:

- als Dokumentation verwendeter eigener, Drittanbieter- und Open-Source-Komponenten
- je freigegebener Fassung
- mit Versionen und Abhängigkeiten
- zur Nachvollziehbarkeit von Änderungen über die Zeit
- als Grundlage für Sicherheits- und Lizenzprüfung

SBOM darf nicht als Garantie für Sicherheit, Rechtskonformität oder Fehlerfreiheit dargestellt werden.

Vorschlag für Website-Sprache:

> Open Source bleibt nachvollziehbar: Notariat8 dokumentiert die verwendeten Softwarebestandteile in einer Software Bill of Materials (SBOM). Diese Software-Stückliste zeigt je freigegebener Fassung, welche Komponenten, Versionen und Abhängigkeiten verwendet werden. So lassen sich Änderungen über die Zeit, Sicherheitsmeldungen und Lizenzfragen einer konkreten Fassung zuordnen.

### Technische Begriffe Übersetzen

`Repo` oder `Repository` sollen auf öffentlichen Seiten grundsätzlich nicht roh erscheinen. Bevorzugte Umschreibungen:

- Referenzstand
- Ablage für freigegebene Fassungen
- nachvollziehbare Änderungshistorie

`GitOps` darf nicht als Schlagwort verwendet werden. Das zugrunde liegende Prinzip soll fachlich erklärt werden: Änderungen erfolgen über dokumentierte, versionierte und freigegebene Fassungen.

`Pull Request` soll als Änderungsvorschlag mit Prüfung und Freigabe beschrieben werden.

`Commit` soll als nachvollziehbarer Änderungseintrag beschrieben werden.

`GitHub` darf genannt werden, wenn es um den Ort des Referenzstands oder um Nachvollziehbarkeit geht. Es soll nicht als Entwicklerplattform beworben werden.

`BPMN` darf verwendet werden, wenn es als fachliche Prozessmodellierung erklärt oder aus dem Kontext verständlich ist.

## Vollzug

`Vollzug` ist ein notariell und juristisch relevanter Begriff und darf nicht als beliebiges Synonym für Workflow verwendet werden.

Der Begriff ist passend, wenn es um die Durchführung oder Umsetzung eines beurkundeten, beglaubigten, registerbezogenen oder behördenbezogenen Vorgangs geht, etwa:

- Grundbuchvollzug
- Registervollzug
- Einreichungen
- Anzeigen
- Genehmigungen
- Zustimmungen
- Fristen
- Nachweise
- behördliche Rückmeldungen

Für generische technische oder organisatorische Abläufe sollen andere Begriffe verwendet werden:

- fachlich freigegebener Arbeits- und Prüfablauf
- Ablauf mit Prüfpunkten
- Vorgangsbearbeitung
- dokumentierte Bearbeitung

`Vollzug` darf nicht mit `Vollstreckung` verwechselt werden.

## Maschinenlesbare Struktur

`styleguide.json` soll mindestens diese Bereiche enthalten:

- `version`
- `mode`
- `surface`
- `audiences`
- `languages`
- `toneRules`
- `sourcePriority`
- `blockedTerms`
- `explainOnlyTerms`
- `preferredTerms`
- `contextRules`
- `reviewChecklist`

Beispielstruktur:

```json
{
  "version": 1,
  "mode": "strict-conservative",
  "surface": "external-public",
  "audiences": [
    "Notariate",
    "Rechtsanwälte",
    "Notarkammern",
    "Partner",
    "Behörden"
  ],
  "blockedTerms": [
    {
      "term": "Tenant",
      "reason": "Technischer Innenbegriff; öffentlich durch organisationsbezogene Trennung oder Mandantenfähigkeit erklären."
    },
    {
      "term": "Control Plane",
      "reason": "Externer Zweck nicht freigegeben."
    }
  ],
  "explainOnlyTerms": [
    {
      "term": "SBOM",
      "firstUse": "Software Bill of Materials (SBOM), deutsch: Software-Stückliste",
      "allowedContext": "Open Source, Komponenten, Versionen, Abhängigkeiten, Nachvollziehbarkeit über freigegebene Fassungen"
    }
  ]
}
```

Die Datei soll keine Tippfehler oder einmalige Missverständnisse als eigene Begriffe aufnehmen.

## Tests

Die bestehende Inhaltsprüfung soll später so angepasst werden, dass sie `styleguide.json` lädt oder daraus synchronisierte Regeln nutzt.

Zu prüfen sind mindestens:

- blockierte Begriffe erscheinen nicht öffentlich sichtbar
- erklärungspflichtige Begriffe erscheinen nur mit Erklärung im näheren Kontext
- `SBOM` ist nicht pauschal verboten, sondern nur ohne Erklärung ein Fehler
- `Mandantenfähigkeit` ist erlaubt, wenn organisationsbezogene Trennung erklärt wird
- `Vollzug` wird nicht als generisches Synonym für Workflow verwendet
- deutsche Texte verwenden echte deutsche Zeichen gemäß `AGENTS.md`

## Fehler- Und Unsicherheitsregeln

Wenn ein Begriff unklar ist, soll der Agent ihn nicht automatisch aufnehmen. Einmalige Tippfehler werden nicht dokumentiert.

Wenn ein technischer Begriff fachlich wichtig ist, aber noch keine tragfähige externe Erklärung hat, bleibt er gesperrt oder erklärungspflichtig.

Wenn eine Aussage rechtlich, regulatorisch oder sicherheitsbezogen klingt, muss sie entweder belegt, abgeschwächt oder entfernt werden.

Wenn die englische Seite einen technischen Begriff nahelegt, der im Deutschen vermieden wird, muss die englische Fassung ebenfalls fachlich erklärt oder umschrieben werden.

## Freigabekriterien

Die Umsetzung dieser Spec ist fertig, wenn:

- `docs/agent-style-guide.md` die Regeln menschlich verständlich abbildet
- `styleguide.json` die wichtigsten Regeln maschinenlesbar enthält
- `AGENTS.md` auf den Style Guide verweist
- die Tests die neue Begriffspolitik berücksichtigen
- bestehende Inhalte weiterhin die Content-Tests bestehen

## Offene Punkte

Keine fachlichen Blocker. Die Nutzerentscheidungen vom 2026-06-09 sind übernommen:

- Geltung für alle sichtbaren Seiten
- strenger konservativer Modus
- Mandantenfähigkeit unter Sicherheit und Governance
- SBOM mit Erklärung erlaubt
- offizielle Quellen vor Hilfsquellen
- human-readable und machine-readable Artefakte
