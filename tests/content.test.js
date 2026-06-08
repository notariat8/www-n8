const { existsSync, readFileSync } = require("node:fs");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const pages = [
  ["German home page", "index.html"],
  ["English home page", "en/index.html"],
];

const sitePages = [
  ...pages,
  ["Privacy page", "datenschutz.html"],
  ["Legal notice page", "impressum.html"],
  ["Repository governance page", "repo-governance.html"],
];

test("home pages do not expose roadmap-style next-step CTA copy", () => {
  for (const [label, file] of pages) {
    const html = readFileSync(file, "utf8");

    assert.doesNotMatch(html, /Nächster Schritt|Referenzstand prüfen/i, label);
    assert.doesNotMatch(html, /Next step|Review the reference state/i, label);
  }
});

test("site pages use the canonical Notariat8 brand asset", () => {
  for (const [label, file] of sitePages) {
    const html = readFileSync(file, "utf8");

    assert.match(html, /https:\/\/bild8\.de\/assets\/8\/svg\/n8\.svg/i, label);
    assert.doesNotMatch(html, /brand-n|brand-eight/i, label);
  }
});

test("home pages keep internal operating language off the customer-facing surface", () => {
  const blockedTerms = [
    /Omnistation/i,
    /\bWorkspace\b/i,
    /\bRepo(?:sitory)?\b/i,
    /Force-Push/i,
    /\bSBOM\b/i,
    /\bGates?\b/i,
    /\bEnterprise GitOps\b/i,
    /\bTenant\b/i,
    /Domain-Hinweis/i,
    /freigegebenen Prozessversion/i,
  ];

  for (const [label, file] of pages) {
    const html = readFileSync(file, "utf8");

    for (const term of blockedTerms) {
      assert.doesNotMatch(html, term, label);
    }
  }
});

test("positioning copy stays focused on control without public-website disclaimer", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Standards werden sichtbar, Zuständigkeiten bleiben verständlich\./i);
  assert.doesNotMatch(german, /sensible Informationen gehören nicht auf eine öffentliche Website/i);

  assert.match(english, /standards stay visible, responsibilities remain understandable\./i);
  assert.doesNotMatch(english, /sensitive information does not belong on a public website/i);
});

test("home pages position use cases as bounded final workflows with GitHub as reference", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Use Cases als finale Workflows/i);
  assert.match(german, /Jeder Use Case ist für sich geschlossen/i);
  assert.match(german, /Parallelbetrieb möglich/i);
  assert.match(german, /wichtigsten 10 Use Cases digital first/i);
  assert.match(german, /GitHub als Referenzstand/i);
  assert.match(german, /nachvollziehbare Änderungshistorie/i);
  assert.match(german, /Pull Requests/i);
  assert.match(german, /real, nur ohne Daten/i);
  assert.match(german, /Abweichungen begründen/i);
  assert.match(german, /standardisierter und besser/i);
  assert.doesNotMatch(german, /Git-Audit/i);
  assert.doesNotMatch(german, /\bPRs\b/i);
  assert.doesNotMatch(german, /Gemeinsam betrachten wir/i);
  assert.doesNotMatch(german, /Geeignete digitale Unterstützung/i);
  assert.doesNotMatch(german, /Muster-Workflow|Musterprozess/i);

  assert.match(english, /Use cases as final workflows/i);
  assert.match(english, /Each use case stands on its own/i);
  assert.match(english, /Parallel operation is possible/i);
  assert.match(english, /10 most important use cases are implemented digital first/i);
  assert.match(english, /GitHub as the reference/i);
  assert.match(english, /traceable change history/i);
  assert.match(english, /pull requests/i);
  assert.match(english, /real, only without data/i);
  assert.match(english, /justify deviations/i);
  assert.match(english, /more standardized and better/i);
  assert.doesNotMatch(english, /Git audit/i);
  assert.doesNotMatch(english, /\bPRs\b/i);
  assert.doesNotMatch(english, /We look together/i);
  assert.doesNotMatch(english, /Suitable digital support/i);
  assert.doesNotMatch(english, /template workflow|template process/i);
});

test("home pages explain GitHub review terms with accessible links", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");
  const commitDocs = "https://docs.github.com/github/committing-changes-to-your-project/creating-and-editing-commits/about-commits";
  const pullRequestDocs = "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests";

  assert.match(german, new RegExp(`<a class="text-link" href="${commitDocs}">nachvollziehbare Änderungshistorie</a>`));
  assert.match(german, new RegExp(`<a class="text-link" href="${pullRequestDocs}">Pull Requests</a>`));
  assert.match(german, /was geändert wurde, warum es freigegeben wurde/i);

  assert.match(english, new RegExp(`<a class="text-link" href="${commitDocs}">traceable change history</a>`));
  assert.match(english, new RegExp(`<a class="text-link" href="${pullRequestDocs}">pull requests</a>`));
  assert.match(english, /what changed, why it was approved/i);
});

test("home pages state mandatory documentation, human review, and app test boundary", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Dokumentation ist Pflicht/i);
  assert.match(german, /Human in the loop ist Pflicht/i);
  assert.match(german, /Prozess-View/i);
  assert.match(german, /app\.notariat8\.de/i);
  assert.match(german, /Datenschutzerklärung/i);
  assert.match(german, /GitHub-Referenzstand/i);
  assert.match(german, /Pflichten im finalen Workflow/i);

  assert.match(english, /Documentation is mandatory/i);
  assert.match(english, /Human in the loop is mandatory/i);
  assert.match(english, /process view/i);
  assert.match(english, /app\.notariat8\.de/i);
  assert.match(english, /privacy notice/i);
  assert.match(english, /GitHub reference/i);
  assert.match(english, /Mandatory parts of the final workflow/i);
});

test("home pages keep GitHub and BPMN modeling visible from the homepage", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /<a href="https:\/\/github\.com\/notariat8\/NaC">GitHub<\/a>/);
  assert.match(german, /BPMN-Modellierung/i);
  assert.match(german, /Prozess-View: Use Case, BPMN-Modellierung, finaler Workflow und GitHub-Referenzstand/i);

  assert.match(english, /<a href="https:\/\/github\.com\/notariat8\/NaC">GitHub<\/a>/);
  assert.match(english, /BPMN modeling/i);
  assert.match(english, /process view: use case, BPMN modeling, final workflow and GitHub reference/i);
});

test("home pages expose a data-free use case viewer for the top ten final workflows", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  for (const html of [german, english]) {
    assert.match(html, /assets\/site\.css\?v=20260608-usecase-viewer/i);
    assert.match(html, /assets\/site\.js\?v=20260608-usecase-viewer/i);
  }

  assert.match(german, /Use-Case-Viewer/i);
  assert.match(german, /Kanonische Top 10/i);
  assert.match(german, /Immobilienkaufvertrag/i);
  assert.match(german, /GmbH-\/UG-Gründung/i);
  assert.match(german, /Vorsorgevollmacht und Patientenverfügung/i);
  assert.match(german, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
  assert.match(german, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn/i);
  assert.match(german, /app\.notariat8\.de\/\?source=www-n8&amp;entry=usecase&amp;usecase=immobilienkaufvertrag/i);
  assert.match(german, /realer finaler Workflow, nur ohne Mandatsdaten/i);

  assert.match(english, /Use-case viewer/i);
  assert.match(english, /Canonical top 10/i);
  assert.match(english, /Real final workflow, only without client data/i);
  assert.match(english, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
});

test("site does not ship internal control-plane artwork", () => {
  const css = readFileSync("assets/site.css", "utf8");

  assert.equal(existsSync("assets/nac-control-plane.svg"), false);
  assert.doesNotMatch(css, /nac-control-plane\.svg/i);
});

test("repository governance page documents every notariat8 repository", () => {
  const html = readFileSync("repo-governance.html", "utf8");

  for (const repo of ["NaC", "www-n8", "demo8notariat", "oci-landing-zone"]) {
    assert.match(html, new RegExp(repo.replace("-", "\\-")), repo);
  }

  assert.match(html, /Veröffentlichungsregeln für die gültige Fassung/i);
  assert.match(html, /rückwirkend überschrieben oder gelöscht/i);
  assert.match(html, /Vier-Augen-Freigabe/i);
  assert.match(html, /Prüfung als Veröffentlichungsbedingung/i);
  assert.match(html, /für die Veröffentlichung freigegebene Hauptfassung/i);
  assert.match(html, /Technischer Name/i);
  assert.doesNotMatch(html, /Geschützte Default-Branches/i);
  assert.match(html, /GitHub Pro oder ein öffentliches Repository/i);
});
