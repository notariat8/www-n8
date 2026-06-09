# www-n8 Style Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved strict-conservative style-guide artifacts for www-n8 and wire the existing content tests to the machine-readable rule set.

**Architecture:** Keep the human guide, machine-readable rules, and test enforcement separate. `docs/agent-style-guide.md` explains judgment and wording, `styleguide.json` stores enforceable and advisory rules, and `tests/content.test.js` loads the JSON for public-surface checks while preserving existing project-specific assertions.

**Tech Stack:** Static HTML/CSS/JS site, Markdown documentation, JSON style rules, Node.js built-in `node:test` and `assert`.

---

## File Structure

- Create `docs/agent-style-guide.md`
  - Human-readable guide for agents and maintainers.
  - Contains target audience, tone, source hierarchy, term rules, example wording, and review checklist.

- Create `styleguide.json`
  - Machine-readable style rules.
  - Contains strict-conservative mode, external-public surface, source priority, blocked terms, explain-only terms, preferred terms, context rules, and review checklist.

- Modify `AGENTS.md`
  - Add a short pointer near the German language style section requiring agents to check the style guide before public copy changes.

- Modify `tests/content.test.js`
  - Load `styleguide.json`.
  - Add tests for style-guide structure.
  - Add tests for blocked public terms from JSON.
  - Add explain-only term checks for terms such as `SBOM`, while retaining existing homepage-specific assertions.

No visible website copy is changed in this implementation plan.

---

### Task 1: Add Failing Style-Guide Contract Tests

**Files:**
- Modify: `tests/content.test.js`
- Test target: missing `styleguide.json`, missing `docs/agent-style-guide.md`, missing `AGENTS.md` pointer

- [ ] **Step 1: Add JSON loading and public text helpers**

Add these helpers after the existing `sitePages` declaration in `tests/content.test.js`:

```js
const styleGuidePath = "styleguide.json";
const agentStyleGuidePath = "docs/agent-style-guide.md";

function readStyleGuide() {
  assert.equal(existsSync(styleGuidePath), true, "styleguide.json must exist");
  return JSON.parse(readFileSync(styleGuidePath, "utf8"));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termRegExp(term) {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
}

function htmlToPublicText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&ouml;/g, "ö")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&auml;/g, "ä")
    .replace(/&Auml;/g, "Ä")
    .replace(/&szlig;/g, "ß")
    .replace(/\s+/g, " ")
    .trim();
}

function surroundingText(text, matchIndex, windowSize = 700) {
  return text.slice(
    Math.max(0, matchIndex - windowSize),
    Math.min(text.length, matchIndex + windowSize)
  );
}
```

- [ ] **Step 2: Add contract tests for the guide files**

Add these tests after `site pages use the canonical Notariat8 brand asset`:

```js
test("style guide artifacts exist and declare strict external-public governance", () => {
  const styleGuide = readStyleGuide();
  const agentGuide = readFileSync(agentStyleGuidePath, "utf8");

  assert.equal(styleGuide.mode, "strict-conservative");
  assert.equal(styleGuide.surface, "external-public");
  assert.deepEqual(styleGuide.languages, ["de", "en"]);
  assert.ok(styleGuide.audiences.includes("Notariate"));
  assert.ok(styleGuide.audiences.includes("Rechtsanwälte"));
  assert.ok(styleGuide.audiences.includes("Notarkammern"));
  assert.ok(styleGuide.audiences.includes("Partner"));
  assert.ok(styleGuide.audiences.includes("Behörden"));
  assert.match(agentGuide, /streng konservativ/i);
  assert.match(agentGuide, /Notariate, Rechtsanwälte, Notarkammern/i);
  assert.doesNotMatch(JSON.stringify(styleGuide), /sform|sfrom/i);
  assert.doesNotMatch(agentGuide, /sform|sfrom/i);
});

test("AGENTS points public text changes to the agent style guide", () => {
  const agents = readFileSync("AGENTS.md", "utf8");

  assert.match(agents, /docs\/agent-style-guide\.md/i);
  assert.match(agents, /öffentlich sichtbaren Texten/i);
});
```

- [ ] **Step 3: Run the contract tests and verify failure**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- FAIL because `styleguide.json` does not exist yet.
- The failure proves the new tests are active before implementation.

- [ ] **Step 4: Commit the failing tests**

Commit only the test change:

```bash
git add tests/content.test.js
git commit -m "test: define style guide contract"
```

---

### Task 2: Add Human-Readable Agent Style Guide

**Files:**
- Create: `docs/agent-style-guide.md`

- [ ] **Step 1: Create `docs/agent-style-guide.md`**

Create this file:

```markdown
# Agent Style Guide for www-n8

Status: verbindlich für Änderungen an öffentlich sichtbaren Texten
Modus: streng konservativ
Stand: 2026-06-09

## Zweck

Dieser Guide ist eine Arbeitsanweisung für Agenten und Bearbeiter von www-n8. Er soll verhindern, dass öffentliche Texte technisch, werblich oder juristisch unscharf werden.

www-n8 ist eine externe Website. Alles Sichtbare richtet sich an Notariate, Rechtsanwälte, Notarkammern, mögliche Partner und gegebenenfalls Behörden. Die Seite ist keine Entwicklerdokumentation und keine Werbeveranstaltung.

## Vor Jeder Textänderung

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
- `BPMN`: fachliche Prozessmodellierung

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

Geeignete Formulierung:

> Open Source bleibt nachvollziehbar: Notariat8 dokumentiert die verwendeten Softwarebestandteile in einer Software Bill of Materials (SBOM). Diese Software-Stückliste zeigt je freigegebener Fassung, welche Komponenten, Versionen und Abhängigkeiten verwendet werden. So lassen sich Änderungen über die Zeit, Sicherheitsmeldungen und Lizenzfragen einer konkreten Fassung zuordnen.

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
```

- [ ] **Step 2: Run tests and verify remaining failure**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- FAIL because `styleguide.json` still does not exist and `AGENTS.md` does not point to the guide yet.

- [ ] **Step 3: Commit the human guide**

```bash
git add docs/agent-style-guide.md
git commit -m "docs: add agent style guide"
```

---

### Task 3: Add Machine-Readable `styleguide.json`

**Files:**
- Create: `styleguide.json`

- [ ] **Step 1: Create `styleguide.json`**

Create this file:

```json
{
  "version": 1,
  "mode": "strict-conservative",
  "surface": "external-public",
  "languages": ["de", "en"],
  "audiences": [
    "Notariate",
    "Rechtsanwälte",
    "Notarkammern",
    "Partner",
    "Behörden"
  ],
  "toneRules": {
    "required": [
      "sachlich",
      "zurückhaltend",
      "juristisch anschlussfähig",
      "organisatorisch klar",
      "prüfbar",
      "fachlich nüchtern"
    ],
    "avoid": [
      "werbliche Überhöhung",
      "Pitch-Sprache",
      "Entwicklerjargon ohne Erklärung",
      "pauschale Sicherheitsversprechen",
      "pauschale Compliance-Versprechen",
      "juristische Begriffe als technische Dekoration"
    ]
  },
  "sourcePriority": [
    {
      "rank": 1,
      "label": "Notar.de, Bundesnotarkammer, Notarkammern",
      "useFor": "notarielle und juristische Begriffe"
    },
    {
      "rank": 2,
      "label": "BMJ und amtliche Quellen",
      "useFor": "rechtliche Einordnung und Begriffe"
    },
    {
      "rank": 3,
      "label": "Gesetzestexte und amtliche EU-Quellen",
      "useFor": "rechtliche und regulatorische Anforderungen"
    },
    {
      "rank": 4,
      "label": "BSI, NIST und vergleichbare Fachstellen",
      "useFor": "Sicherheit, Software-Lieferketten, SBOM"
    },
    {
      "rank": 5,
      "label": "ofunk/claude-fuer-deutsches-recht",
      "useFor": "Formulierungs- und Strukturhilfe, nicht als Autorität"
    }
  ],
  "blockedTerms": [
    {
      "term": "Tenant",
      "scope": "public-html",
      "reason": "Technischer Innenbegriff; öffentlich durch organisationsbezogene Trennung oder Mandantenfähigkeit erklären."
    },
    {
      "term": "Control Plane",
      "scope": "public-html",
      "reason": "Externer Zweck nicht freigegeben."
    }
  ],
  "explainOnlyTerms": [
    {
      "term": "SBOM",
      "firstUse": "Software Bill of Materials (SBOM), deutsch: Software-Stückliste",
      "allowedContext": [
        "Open Source",
        "Komponenten",
        "Versionen",
        "Abhängigkeiten",
        "freigegebene Fassung",
        "Nachvollziehbarkeit",
        "Sicherheitsmeldungen",
        "Lizenzfragen"
      ],
      "requiredNearbyAny": [
        "Software Bill of Materials",
        "Software-Stückliste"
      ],
      "notA": [
        "Sicherheitsgarantie",
        "Rechtskonformitätsgarantie",
        "Schwachstellenbewertung"
      ]
    },
    {
      "term": "Mandantenfähigkeit",
      "firstUse": "organisationsbezogene Trennung von Arbeitsbereichen, Zuständigkeiten, Daten, Freigaben und Arbeitsständen",
      "allowedContext": [
        "Sicherheit",
        "Governance",
        "Organisation",
        "Trennung",
        "Arbeitsbereiche",
        "Zuständigkeiten",
        "Daten",
        "Freigaben",
        "Arbeitsstände"
      ],
      "requiredNearbyAny": [
        "Organisation",
        "organisationsbezogen",
        "getrennt geführt",
        "organizational separation"
      ]
    },
    {
      "term": "GitOps",
      "firstUse": "dokumentierte, versionierte und freigegebene Fassungen",
      "allowedContext": [
        "Referenzstand",
        "freigegebene Fassung",
        "Änderungshistorie",
        "Prüfung",
        "Freigabe"
      ],
      "requiredNearbyAny": [
        "dokumentierte",
        "versionierte",
        "freigegebene Fassungen",
        "reference state"
      ]
    }
  ],
  "preferredTerms": [
    {
      "avoid": "Repo",
      "prefer": [
        "Referenzstand",
        "Ablage für freigegebene Fassungen",
        "nachvollziehbare Änderungshistorie"
      ]
    },
    {
      "avoid": "Repository",
      "prefer": [
        "Referenzstand",
        "Ablage für freigegebene Fassungen",
        "nachvollziehbare Änderungshistorie"
      ]
    },
    {
      "avoid": "Pull Request",
      "prefer": [
        "Änderungsvorschlag mit Prüfung und Freigabe"
      ]
    },
    {
      "avoid": "Commit",
      "prefer": [
        "nachvollziehbarer Änderungseintrag"
      ]
    },
    {
      "avoid": "Workflow",
      "prefer": [
        "fachlich freigegebener Arbeits- und Prüfablauf",
        "Ablauf mit Prüfpunkten",
        "Vorgangsbearbeitung"
      ]
    }
  ],
  "contextRules": [
    {
      "term": "Vollzug",
      "allowedWhen": [
        "beurkundeter Vorgang",
        "beglaubigter Vorgang",
        "Registervollzug",
        "Grundbuchvollzug",
        "Einreichung",
        "Anzeige",
        "Genehmigung",
        "Zustimmung",
        "Frist",
        "Nachweis",
        "behördliche Rückmeldung"
      ],
      "avoidWhen": [
        "generischer Workflow",
        "technischer Ablauf",
        "allgemeine Prozessbeschreibung"
      ],
      "forbiddenConfusion": "Vollstreckung"
    }
  ],
  "reviewChecklist": [
    "Ist der Text für Notariate, Rechtsanwälte, Notarkammern, Partner und Behörden geeignet?",
    "Ist die Aussage sachlich prüfbar?",
    "Sind technische Begriffe erklärt oder juristisch-organisatorisch übersetzt?",
    "Werden juristische Begriffe zweckgenau verwendet?",
    "Sind Sicherheits- und Governance-Aussagen belegt oder zurückhaltend formuliert?",
    "Widerspricht der Text keinem blockierten Begriff und keiner Erklärungspflicht?"
  ]
}
```

- [ ] **Step 2: Run tests and verify remaining failure**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- FAIL only for the missing `AGENTS.md` pointer test.
- The style-guide artifact test should now pass.

- [ ] **Step 3: Commit the JSON rules**

```bash
git add styleguide.json
git commit -m "docs: add machine-readable style guide"
```

---

### Task 4: Point `AGENTS.md` To The Style Guide

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add public-copy instruction**

Add this section immediately before `## German language style`:

```markdown
## Public website style guide

- Before changing publicly visible website text, read
  `docs/agent-style-guide.md` and apply `styleguide.json`.
- Public copy must stay strict-conservative, externally suitable, legally
  and notarially understandable, and factually checkable for Notariate,
  Rechtsanwälte, Notarkammern, Partner, and Behörden.
- Do not introduce blocked public terms from `styleguide.json`. Terms marked
  as explanation-only must be explained in their first visible context.
```

- [ ] **Step 2: Run tests and verify contract passes**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- PASS for the new artifact and pointer tests.
- Existing public-content tests still pass.

- [ ] **Step 3: Commit the AGENTS pointer**

```bash
git add AGENTS.md
git commit -m "docs: require public style guide checks"
```

---

### Task 5: Enforce Blocked And Explain-Only Terms From JSON

**Files:**
- Modify: `tests/content.test.js`

- [ ] **Step 1: Add JSON-backed blocked-term test**

Add this test after `home pages keep internal operating language off the customer-facing surface`:

```js
test("public pages do not expose style-guide blocked terms", () => {
  const styleGuide = readStyleGuide();

  for (const [label, file] of sitePages) {
    const html = readFileSync(file, "utf8");
    const publicText = htmlToPublicText(html);

    for (const { term } of styleGuide.blockedTerms) {
      assert.doesNotMatch(publicText, termRegExp(term), `${label}: ${term}`);
    }
  }
});
```

- [ ] **Step 2: Add explain-only context test**

Add this test immediately after the blocked-term test:

```js
test("public pages explain style-guide explain-only terms in visible context", () => {
  const styleGuide = readStyleGuide();

  for (const [label, file] of sitePages) {
    const html = readFileSync(file, "utf8");
    const publicText = htmlToPublicText(html);

    for (const { term, requiredNearbyAny = [] } of styleGuide.explainOnlyTerms) {
      const pattern = termRegExp(term);
      const match = pattern.exec(publicText);

      if (!match) {
        continue;
      }

      const context = surroundingText(publicText, match.index);
      const hasExplanation = requiredNearbyAny.some((phrase) =>
        new RegExp(escapeRegExp(phrase), "i").test(context)
      );

      assert.equal(
        hasExplanation,
        true,
        `${label}: ${term} must be explained near first visible use`
      );
    }
  }
});
```

- [ ] **Step 3: Update the legacy internal-language blocklist**

In `home pages keep internal operating language off the customer-facing surface`, remove `/\bSBOM\b/i` from the local `blockedTerms` array because SBOM is now explanation-only. Keep the other existing homepage-specific expressions:

```js
const blockedTerms = [
  /Omnistation/i,
  /\bWorkspace\b/i,
  /\bRepo(?:sitory)?\b/i,
  /Force-Push/i,
  /\bGates?\b/i,
  /\bEnterprise GitOps\b/i,
  /\bTenant\b/i,
  /Domain-Hinweis/i,
  /freigegebenen Prozessversion/i,
];
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- PASS with all tests.
- The new JSON-backed blocked-term and explain-only checks pass because current public pages do not contain `SBOM`, `Mandantenfähigkeit`, or `GitOps` in an unexplained visible context.

- [ ] **Step 5: Commit test enforcement**

```bash
git add tests/content.test.js
git commit -m "test: enforce public style guide terms"
```

---

### Task 6: Final Verification

**Files:**
- Read/verify only unless a previous task exposed a defect

- [ ] **Step 1: Check working tree**

Run:

```bash
git status --short
```

Expected:

- No output.

- [ ] **Step 2: Run full content tests**

Run:

```bash
node --test tests/content.test.js
```

Expected:

- All tests pass.
- The TAP summary reports zero failures.

- [ ] **Step 3: Inspect latest commits**

Run:

```bash
git log --oneline -5
```

Expected:

- Recent commits include:
  - `test: define style guide contract`
  - `docs: add agent style guide`
  - `docs: add machine-readable style guide`
  - `docs: require public style guide checks`
  - `test: enforce public style guide terms`

---

## Self-Review

Spec coverage:

- Human-readable guide: Task 2.
- Machine-readable guide: Task 3.
- `AGENTS.md` pointer: Task 4.
- Tests for blocked and explain-only terms: Tasks 1 and 5.
- Strict conservative external audience: Tasks 2 and 3.
- Mandantenfähigkeit under Sicherheit/Governance: Tasks 2 and 3.
- SBOM as explanation-only with Open Source, versions, dependencies, traceability over time: Tasks 2 and 3.
- Vollzug not as generic workflow: Tasks 2 and 3.
- No accidental typo term captured: Tasks 1, 2, and 3.

Placeholder scan:

- No unresolved placeholders or marker words are intentionally present.
- Each code-changing step includes the exact content to add or remove.

Type and name consistency:

- Test helper names are defined before use: `readStyleGuide`, `escapeRegExp`, `termRegExp`, `htmlToPublicText`, `surroundingText`.
- JSON keys used in tests match the planned JSON: `mode`, `surface`, `languages`, `audiences`, `blockedTerms`, `explainOnlyTerms`, `requiredNearbyAny`.
