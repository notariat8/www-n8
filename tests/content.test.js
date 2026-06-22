const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const pages = [
  ["German home page", "index.html"],
  ["English home page", "en/index.html"],
];

function htmlPagesIn(dir, labelPrefix) {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".html"))
    .sort()
    .map((file) => [
      `${labelPrefix} ${file}`,
      dir === "." ? file : `${dir}/${file}`,
    ]);
}

const sitePages = [
  ...htmlPagesIn(".", "Root page"),
  ...htmlPagesIn("en", "English page"),
];

const brandedSitePages = sitePages.filter(([, file]) => file !== "404.html");

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

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&ouml;/g, "ö")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&auml;/g, "ä")
    .replace(/&Auml;/g, "Ä")
    .replace(/&szlig;/g, "ß");
}

function publicAttributeText(html) {
  const publicAttributePattern = /\s(?:aria-label|aria-description|alt|title|placeholder|content)=("([^"]*)"|'([^']*)')/gi;

  return Array.from(
    html.matchAll(publicAttributePattern),
    (match) => match[2] ?? match[3] ?? ""
  ).join(" ");
}

function htmlToPublicText(html) {
  const publicHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const attributes = publicAttributeText(publicHtml);
  const bodyText = publicHtml.replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(`${bodyText} ${attributes}`)
    .replace(/\s+/g, " ")
    .trim();
}

function surroundingText(text, matchIndex, windowSize = 700) {
  return text.slice(
    Math.max(0, matchIndex - windowSize),
    Math.min(text.length, matchIndex + windowSize)
  );
}

test("home pages do not expose roadmap-style next-step CTA copy", () => {
  for (const [label, file] of pages) {
    const html = readFileSync(file, "utf8");

    assert.doesNotMatch(html, /Nächster Schritt|Referenzstand prüfen/i, label);
    assert.doesNotMatch(html, /Next step|Review the reference state/i, label);
  }
});

test("branded site pages use the canonical Notariat8 brand asset", () => {
  for (const [label, file] of brandedSitePages) {
    const html = readFileSync(file, "utf8");

    assert.match(html, /https:\/\/bild8\.de\/assets\/8\/svg\/n8\.svg/i, label);
    assert.doesNotMatch(html, /brand-n|brand-eight/i, label);
  }
});

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

test("style guide classifies required public terms", () => {
  const styleGuide = readStyleGuide();
  const blockedTerms = new Set(styleGuide.blockedTerms.map(({ term }) => term));
  const explainOnlyTerms = new Map(
    styleGuide.explainOnlyTerms.map((entry) => [entry.term, entry])
  );
  const preferredTerms = new Map(
    styleGuide.preferredTerms.map((entry) => [entry.avoid, entry])
  );

  assert.equal(blockedTerms.has("Tenant"), true);
  assert.equal(blockedTerms.has("Control Plane"), true);
  assert.equal(blockedTerms.has("SBOM"), false);
  assert.equal(blockedTerms.has("Mandantenfähigkeit"), false);
  assert.equal(blockedTerms.has("GitOps"), false);

  for (const term of ["SBOM", "Mandantenfähigkeit", "GitOps"]) {
    assert.equal(explainOnlyTerms.has(term), true, term);
    assert.ok(
      explainOnlyTerms.get(term).requiredNearbyAny.length > 0,
      `${term} needs explanation phrases`
    );
  }

  for (const term of [
    "Use Case",
    "use case",
    "Use-Case-Viewer",
    "Use-case viewer",
    "Prozess-View",
    "Notariatsprozesse",
    "Prozesse",
    "process view",
    "Digital notarial processes",
    "Workflow",
    "workflow",
    "BPMN-Modellierung",
    "BPMN modeling",
    "digital first",
  ]) {
    assert.equal(preferredTerms.has(term), true, term);
    assert.ok(
      preferredTerms.get(term).prefer.length > 0,
      `${term} needs preferred public wording`
    );
  }
});

test("AGENTS points public text changes to the agent style guide", () => {
  const agents = readFileSync("AGENTS.md", "utf8");

  assert.match(agents, /docs\/agent-style-guide\.md/i);
  assert.match(agents, /öffentlich sichtbaren Texten/i);
});

test("home pages keep internal operating language off the customer-facing surface", () => {
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

  for (const [label, file] of pages) {
    const html = readFileSync(file, "utf8");

    for (const term of blockedTerms) {
      assert.doesNotMatch(html, term, label);
    }
  }
});

test("german home page translates public process terms into notarial language", () => {
  const html = readFileSync("index.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.doesNotMatch(publicText, /Use[- ]Case(?:s)?/i);
  assert.doesNotMatch(publicText, /Prozess-View/i);
  assert.doesNotMatch(publicText, /\bWorkflow\b/i);
  assert.doesNotMatch(publicText, /digital first/i);
  assert.doesNotMatch(publicText, /finale[rsn]? Workflow/i);
  assert.doesNotMatch(publicText, /Notariatsprozesse/i);
  assert.doesNotMatch(publicText, /Prozessübersicht/i);
  assert.doesNotMatch(publicText, /\bProzesse\b/i);
  assert.doesNotMatch(publicText, /Das ist real|real, nur ohne Daten/i);

  assert.match(publicText, /Digitale Vorgangsbearbeitung/i);
  assert.match(publicText, /Vorgangsübersicht/i);
  assert.match(publicText, /fachlich abgegrenzten Vorgang/i);
  assert.match(publicText, /freigegebener Arbeits- und Prüfablauf/i);
  assert.match(publicText, /fachliche Prozessmodellierung \(BPMN\)/i);
  assert.match(publicText, /zuerst digital abgebildet/i);
  assert.match(publicText, /Der öffentliche Stand zeigt Struktur und Prüfung, nicht Mandatsdaten\./i);
  assert.match(publicText, /notariat8 zeigt Vorgänge\. Die App testet Abläufe\./i);
  assert.doesNotMatch(publicText, /\bn8 zeigt Vorgänge\b/i);
});

test("english home page translates public process terms into professional matter language", () => {
  const html = readFileSync("en/index.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.doesNotMatch(publicText, /Use[- ]case(?:s)?/i);
  assert.doesNotMatch(publicText, /process view/i);
  assert.doesNotMatch(publicText, /\bworkflow\b/i);
  assert.doesNotMatch(publicText, /digital first/i);
  assert.doesNotMatch(publicText, /final workflow/i);
  assert.doesNotMatch(publicText, /Digital notarial processes/i);
  assert.doesNotMatch(publicText, /process overview/i);
  assert.doesNotMatch(publicText, /shows processes/i);
  assert.doesNotMatch(publicText, /This is real|real, only without data/i);

  assert.match(publicText, /Digital matter handling/i);
  assert.match(publicText, /Matter overview/i);
  assert.match(publicText, /professionally bounded matter/i);
  assert.match(publicText, /approved work and review flow/i);
  assert.match(publicText, /process modeling \(BPMN\)/i);
  assert.match(publicText, /selected for digital handling first/i);
  assert.match(publicText, /The public reference shows structure and review, not client data\./i);
  assert.match(publicText, /notariat8 shows matters\. The app tests flows\./i);
  assert.doesNotMatch(publicText, /\bn8 shows matters\b/i);
});

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

test("not found page provides demo-safe recovery links", () => {
  const html = readFileSync("404.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.match(publicText, /Seite nicht gefunden/i);
  assert.match(publicText, /notariat8\.de/i);
  assert.match(publicText, /Vorgangsübersicht/i);
  assert.match(publicText, /Prozessmodell/i);
  assert.match(html, /href="\/"/i);
  assert.match(html, /href="\/prozessmodell\.html"/i);
  assert.match(html, /href="\/assets\/favicon\.svg"/i);
  assert.match(html, /href="\/assets\/site\.css\?v=20260520-nac"/i);
  assert.doesNotMatch(publicText, /\bTenant\b/i);
  assert.doesNotMatch(publicText, /\bWorkspace\b/i);
  assert.doesNotMatch(publicText, /Oracle|OCI|Runtime|Function/i);
  assert.doesNotMatch(publicText, /Mandatsdaten|Zugangsdaten|Token|Secret/i);
});

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

test("positioning copy stays focused on control without public-website disclaimer", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Standards werden sichtbar, Zuständigkeiten bleiben verständlich\./i);
  assert.doesNotMatch(german, /sensible Informationen gehören nicht auf eine öffentliche Website/i);

  assert.match(english, /standards stay visible, responsibilities remain understandable\./i);
  assert.doesNotMatch(english, /sensitive information does not belong on a public website/i);
});

test("home pages position matters as bounded approved flows with GitHub as reference", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Fachlich abgegrenzte Vorgänge als freigegebene Arbeits- und Prüfabläufe/i);
  assert.match(german, /Jeder Vorgang ist für sich geschlossen/i);
  assert.match(german, /Parallelbetrieb möglich/i);
  assert.match(german, /wichtigsten 10 Vorgänge zuerst digital abgebildet/i);
  assert.match(german, /GitHub als Referenzstand/i);
  assert.match(german, /nachvollziehbare Änderungshistorie/i);
  assert.match(german, /Pull Requests/i);
  assert.match(german, /Änderungsvorschläge mit Prüfung und Freigabe/i);
  assert.match(german, /öffentliche Stand zeigt Struktur und Prüfung, nicht Mandatsdaten/i);
  assert.match(german, /Abweichungen begründen/i);
  assert.match(german, /einheitlicher und nachvollziehbarer/i);
  assert.doesNotMatch(german, /Git-Audit/i);
  assert.doesNotMatch(german, /\bPRs\b/i);
  assert.doesNotMatch(german, /Gemeinsam betrachten wir/i);
  assert.doesNotMatch(german, /Geeignete digitale Unterstützung/i);
  assert.doesNotMatch(german, /Muster-Workflow|Musterprozess/i);

  assert.match(english, /Professionally bounded matters as approved work and review flows/i);
  assert.match(english, /Each matter stands on its own/i);
  assert.match(english, /Parallel operation is possible/i);
  assert.match(english, /10 most important matters are selected for digital handling first/i);
  assert.match(english, /GitHub as the reference/i);
  assert.match(english, /traceable change history/i);
  assert.match(english, /pull requests/i);
  assert.match(english, /change proposals with review and approval/i);
  assert.match(english, /public reference shows structure and review, not client data/i);
  assert.match(english, /justify deviations/i);
  assert.match(english, /more consistent and traceable/i);
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
  assert.match(german, /Änderungsvorschläge mit Prüfung und Freigabe/i);
  assert.match(german, /was geändert wurde, warum es freigegeben wurde/i);

  assert.match(english, new RegExp(`<a class="text-link" href="${commitDocs}">traceable change history</a>`));
  assert.match(english, new RegExp(`<a class="text-link" href="${pullRequestDocs}">pull requests</a>`));
  assert.match(english, /change proposals with review and approval/i);
  assert.match(english, /what changed, why it was approved/i);
});

test("home pages state mandatory documentation, human review, and app test boundary", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Dokumentation ist Pflicht/i);
  assert.match(german, /Human in the loop ist Pflicht/i);
  assert.match(german, /Vorgangsübersicht/i);
  assert.match(german, /app\.notariat8\.de/i);
  assert.match(german, /Datenschutzerklärung/i);
  assert.match(german, /GitHub-Referenzstand/i);
  assert.match(german, /Pflichten im freigegebenen Arbeits- und Prüfablauf/i);
  assert.match(german, /Mandantenfähigkeit/i);
  assert.match(german, /je Organisation getrennt geführt/i);
  assert.match(german, /Software Bill of Materials \(SBOM\)/i);
  assert.match(german, /Software-Stückliste/i);

  assert.match(english, /Documentation is mandatory/i);
  assert.match(english, /Human in the loop is mandatory/i);
  assert.match(english, /matter overview/i);
  assert.match(english, /app\.notariat8\.de/i);
  assert.match(english, /privacy notice/i);
  assert.match(english, /GitHub reference/i);
  assert.match(english, /Mandatory parts of the approved work and review flow/i);
  assert.match(english, /Organizational separation/i);
  assert.match(english, /kept separate by organization/i);
  assert.match(english, /Software Bill of Materials \(SBOM\)/i);
  assert.match(english, /security notices and license questions/i);
});

test("privacy notice explains tracking status, app transitions, and external targets", () => {
  const html = readFileSync("datenschutz.html", "utf8");

  assert.match(html, /keine Analyse-Cookies/i);
  assert.match(html, /kein clientseitiges Tracking/i);
  assert.doesNotMatch(html, /keine Formulare/i);
  assert.match(html, /optionale Hinweise/i);
  assert.match(html, /app\.notariat8\.de/i);
  assert.match(html, /nicht auf dieser Website gespeichert/i);
  assert.match(html, /bild8\.de/i);
  assert.match(html, /GitHub/i);
  assert.match(html, /technisch erforderliche Zugriffsdaten/i);
});

test("app transition script targets exposed application routes", () => {
  const script = readFileSync("assets/site.js", "utf8");

  assert.match(script, /onboarding\/readiness/i);
  assert.match(script, /login/i);
  assert.match(script, /source", "notariat8"/i);
  assert.match(script, /audience", "customer"/i);
  assert.match(script, /domain_hint/i);
  assert.doesNotMatch(script, /tenant_slug/i);
  assert.doesNotMatch(script, /admin_email/i);
  assert.doesNotMatch(script, /url\.searchParams\.set\("entry", transitionType\)/);
});

test("home pages do not link app transition actions to the unexposed app root", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  for (const html of [german, english]) {
    assert.match(html, /<meta name="nac-app-url" content="https:\/\/app\.notariat8\.de">/i);
    assert.match(html, /assets\/site\.js\?v=20260613-process-model/i);
    assert.match(html, /app\.notariat8\.de\/login\?source=notariat8&amp;entry=usecase/i);
    assert.doesNotMatch(html, /<meta name="nac-app-url" content="https:\/\/app\.notariat8\.de\/">/i);
    assert.doesNotMatch(html, /app\.notariat8\.de\/\?source=/i);
    assert.doesNotMatch(html, /source=www-n8/i);
  }
});

test("home app handoff copy explains safe login and readiness behavior", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Bestehende Kunden öffnen nur die Anmeldung/i);
  assert.match(german, /Interesse vormerken bereitet nur die Bereitschaftsprüfung vor/i);
  assert.match(german, /keine Onboarding-Anfrage/i);
  assert.match(german, /keine E-Mail/i);
  assert.match(german, /keine Mandatsdaten, keine Dokumente und keine Zugangsdaten/i);

  assert.match(english, /Existing customers open login only/i);
  assert.match(english, /Registering interest only prepares the readiness check/i);
  assert.match(english, /no onboarding request/i);
  assert.match(english, /no email/i);
  assert.match(english, /does not collect client data, documents or credentials/i);
});

test("home pages keep GitHub and BPMN modeling visible from the homepage", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /<a href="https:\/\/github\.com\/notariat8\/NaC">GitHub<\/a>/);
  assert.match(german, /fachliche Prozessmodellierung \(BPMN\)/i);
  assert.match(german, /Vorgangsübersicht verbindet den fachlich abgegrenzten Vorgang, die fachliche Prozessmodellierung \(BPMN\), den freigegebenen Arbeits- und Prüfablauf und den GitHub-Referenzstand/i);

  assert.match(english, /<a href="https:\/\/github\.com\/notariat8\/NaC">GitHub<\/a>/);
  assert.match(english, /process modeling \(BPMN\)/i);
  assert.match(english, /matter overview connects the professionally bounded matter, process modeling \(BPMN\), the approved work and review flow and the GitHub reference/i);
});

test("home pages expose a data-free process viewer for selected approved flows", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  for (const html of [german, english]) {
    assert.match(html, /assets\/site\.css\?v=20260621-process-model-readability/i);
    assert.match(html, /assets\/site\.js\?v=20260613-process-model/i);
  }

  assert.match(german, /Vorgangsübersicht/i);
  assert.match(german, /Notariat8 Prozessmodell \(BPMN\) ansehen/i);
  assert.match(german, /href="prozessmodell\.html\?vorgang=immobilienkaufvertrag"/i);
  assert.match(german, /Ausgewählte Vorgänge/i);
  assert.match(german, /Immobilienkaufvertrag/i);
  assert.match(german, /GmbH-\/UG-Gründung/i);
  assert.match(german, /Vorsorgevollmacht und Patientenverfügung/i);
  assert.match(german, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
  assert.match(german, /prozessmodell\.html\?vorgang=immobilienkaufvertrag/i);
  assert.match(german, /Prozessmodell ansehen[\s\S]*Referenzstand auf GitHub[\s\S]*In der App testen/i);
  assert.doesNotMatch(german, /Vorgang auf GitHub/i);
  assert.doesNotMatch(german, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn">Prozessmodell ansehen/i);
  assert.match(german, /app\.notariat8\.de\/login\?source=notariat8&amp;entry=usecase&amp;usecase=immobilienkaufvertrag/i);
  assert.match(german, /freigegebener Arbeits- und Prüfablauf, nur ohne Mandatsdaten/i);

  assert.match(english, /Matter overview/i);
  assert.match(english, /View notariat8 process model \(BPMN\)/i);
  assert.match(english, /href="process-model\.html\?matter=immobilienkaufvertrag"/i);
  assert.match(english, /Selected matters/i);
  assert.match(english, /Approved work and review flow, only without client data/i);
  assert.match(english, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
  assert.match(english, /process-model\.html\?matter=immobilienkaufvertrag/i);
  assert.match(english, /View process model[\s\S]*Reference on GitHub[\s\S]*Test in app/i);
  assert.doesNotMatch(english, /Matter on GitHub/i);
  assert.doesNotMatch(english, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn">View process model/i);
});

test("public demo route makes the BPMN process model obvious without integration claims", () => {
  const germanHome = htmlToPublicText(readFileSync("index.html", "utf8"));
  const englishHome = htmlToPublicText(readFileSync("en/index.html", "utf8"));
  const germanProcessModel = htmlToPublicText(readFileSync("prozessmodell.html", "utf8"));
  const englishProcessModel = htmlToPublicText(readFileSync("en/process-model.html", "utf8"));
  const combined = [
    germanHome,
    englishHome,
    germanProcessModel,
    englishProcessModel,
  ].join(" ");

  assert.match(germanHome, /Notariat8 Prozessmodell \(BPMN\) ansehen/i);
  assert.match(readFileSync("index.html", "utf8"), /<a href="prozessmodell\.html\?vorgang=immobilienkaufvertrag">Prozessmodell \(BPMN\)<\/a>/i);
  assert.match(germanHome, /Direkt zur öffentlichen BPMN-Ansicht/i);
  assert.match(englishHome, /View notariat8 process model \(BPMN\)/i);
  assert.match(readFileSync("en/index.html", "utf8"), /<a href="process-model\.html\?matter=immobilienkaufvertrag">Process model \(BPMN\)<\/a>/i);
  assert.match(englishHome, /Go directly to the public BPMN view/i);
  assert.match(germanProcessModel, /Notariat8 Prozessmodell \(BPMN\)/i);
  assert.match(englishProcessModel, /notariat8 process model \(BPMN\)/i);
  assert.match(combined, /notariat8/i);

  assert.doesNotMatch(combined, /OCI|Oracle|Cloud Infrastructure|provider operation|Anbieterbetrieb/i);
  assert.match(germanHome, /XNP und Kartenleser als lokale Bereitschaftsgrenzen/i);
  assert.match(germanHome, /Register und Grundbuch als fachliche externe Zugriffspunkte/i);
  assert.match(englishHome, /XNP and card reader as local readiness boundaries/i);
  assert.match(englishHome, /registers and land register as professional external access points/i);
  assert.match(germanProcessModel, /XNP und Kartenleser bleiben sichtbar/i);
  assert.match(germanProcessModel, /Register- und Grundbuchzugänge bleiben sichtbar/i);
  assert.match(englishProcessModel, /XNP and card reader remain visible/i);
  assert.match(englishProcessModel, /register and land-register access points remain visible/i);

  assert.doesNotMatch(combined, /produktive XNP-Anbindung|production XNP integration|XNP operation with real filings|XNP-Betrieb mit echten Einreichungen/i);
  assert.doesNotMatch(combined, /echte Mandatsdaten|real client data/i);
});

test("public BPMN assets show external access points without internal operations", () => {
  const bpmnAssets = readdirSync("assets/bpmn")
    .filter((file) => file.endsWith(".svg"))
    .map((file) => [`assets/bpmn/${file}`, readFileSync(`assets/bpmn/${file}`, "utf8")]);
  const combined = bpmnAssets.map(([, svg]) => svg).join(" ");

  assert.match(combined, /XNP/i);
  assert.match(combined, /Kartenleser/i);
  assert.match(combined, /Grundbuch/i);
  assert.match(combined, /Register/i);

  for (const [file, svg] of bpmnAssets) {
    assert.doesNotMatch(svg, /xnp_local|IT-Betrieb|OCI|Oracle|produktive XNP-Anbindung|echter XNP-Betrieb|register_portal|land_register_portal|notary_app|paper_signature/i, file);
  }
});

test("public BPMN assets expose accessible titles and descriptions", () => {
  const bpmnAssets = readdirSync("assets/bpmn")
    .filter((file) => file.endsWith(".svg"))
    .map((file) => [`assets/bpmn/${file}`, readFileSync(`assets/bpmn/${file}`, "utf8")]);

  for (const [file, svg] of bpmnAssets) {
    assert.match(svg, /role="img"/i, file);
    assert.match(svg, /aria-label="[^"]+"/i, file);
    assert.match(svg, /<title>notariat8 Prozessmodell: [^<]+<\/title>/i, file);
    assert.match(
      svg,
      /<desc>Öffentliches BPMN-Demobild[^<]+ohne Mandatsdaten\.<\/desc>/i,
      file,
    );
  }
});

test("german home page makes the one-hour chamber demo path explicit", () => {
  const html = readFileSync("index.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.match(publicText, /Demo-Pfad für eine Stunde/i);
  assert.match(publicText, /1\. Einstieg über die Vorgangsübersicht/i);
  assert.match(publicText, /2\. BPMN-Ansicht im Browser erläutern/i);
  assert.match(publicText, /3\. Grenzen des öffentlichen Demo-Stands klären/i);
  assert.match(publicText, /4\. Übergang in die App ohne Mandatsdaten/i);
  assert.match(publicText, /Nicht gezeigt werden interne Betriebsdetails, Mandatsdaten, produktive Einreichungen oder echter XNP-Betrieb/i);
  assert.doesNotMatch(publicText, /produktive XNP-Anbindung ist vorhanden/i);
});

test("english home page makes the one-hour chamber demo path explicit", () => {
  const html = readFileSync("en/index.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.match(publicText, /Demo path for one hour/i);
  assert.match(publicText, /1\. Start with the matter overview/i);
  assert.match(publicText, /2\. Explain the BPMN view in the browser/i);
  assert.match(publicText, /3\. Clarify public demo boundaries/i);
  assert.match(publicText, /4\. Move into the app without client data/i);
  assert.match(publicText, /Not shown are internal operating details, client data, production filings or real XNP operation/i);
  assert.doesNotMatch(publicText, /production XNP integration is available/i);
});

test("home pages guide a 60-minute chamber demo with browser-first entry points", () => {
  const german = htmlToPublicText(readFileSync("index.html", "utf8"));
  const english = htmlToPublicText(readFileSync("en/index.html", "utf8"));

  assert.match(german, /60-Minuten-Ablauf/i);
  assert.match(german, /0-10 Minuten: Einstieg und Zielbild/i);
  assert.match(german, /10-30 Minuten: Vorgang und BPMN im Browser/i);
  assert.match(german, /30-45 Minuten: externe Zugriffspunkte und lokale Bereitschaft/i);
  assert.match(german, /45-60 Minuten: App-Übergang und Fragen/i);
  assert.match(german, /Einstieg 1: Vorgangsübersicht/i);
  assert.match(german, /Einstieg 2: Notariat8 Prozessmodell \(BPMN\)/i);
  assert.match(german, /GitHub bleibt Referenz, ist aber nicht die Vorführfläche/i);

  assert.match(english, /60-minute agenda/i);
  assert.match(english, /0-10 minutes: entry point and target picture/i);
  assert.match(english, /10-30 minutes: matter and BPMN in the browser/i);
  assert.match(english, /30-45 minutes: external access points and local readiness/i);
  assert.match(english, /45-60 minutes: app transition and questions/i);
  assert.match(english, /Entry 1: matter overview/i);
  assert.match(english, /Entry 2: notariat8 process model \(BPMN\)/i);
  assert.match(english, /GitHub remains the reference, but is not the presentation surface/i);
});

test("home pages describe XNP card reader registers and land register as guarded boundaries", () => {
  const german = htmlToPublicText(readFileSync("index.html", "utf8"));
  const english = htmlToPublicText(readFileSync("en/index.html", "utf8"));

  assert.match(german, /Externe Zugriffspunkte und lokale Bereitschaft/i);
  assert.match(german, /XNP und Kartenleser als lokale Bereitschaftsgrenzen/i);
  assert.match(german, /Register und Grundbuch als fachliche externe Zugriffspunkte/i);
  assert.match(german, /Notariat8 zeigt diese Grenzen im Ablauf, ohne internen Betrieb, produktive Kopplung oder echte Einreichung zu behaupten/i);
  assert.doesNotMatch(german, /Cloud|OCI|Oracle|Anbieterbetrieb/i);
  assert.doesNotMatch(german, /XNotar|XJustiz|Signaturpfad|Grundbuchdaten aus XNP/i);
  assert.doesNotMatch(german, /produktive XNP-Anbindung|XNP-Betrieb mit echten Einreichungen/i);

  assert.match(english, /External access points and local readiness/i);
  assert.match(english, /XNP and card reader as local readiness boundaries/i);
  assert.match(english, /registers and land register as professional external access points/i);
  assert.match(english, /Notariat8 shows these boundaries in the flow without claiming internal operation, production coupling or real filing/i);
  assert.doesNotMatch(english, /Cloud|OCI|Oracle|provider operation/i);
  assert.doesNotMatch(english, /XNotar|XJustiz|signature path|land register data from XNP/i);
  assert.doesNotMatch(english, /production XNP integration|XNP operation with real filings/i);
});

test("process model page frames the BPMN viewer as demo guidance, not a GitHub replacement", () => {
  const html = readFileSync("prozessmodell.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.match(publicText, /Notariat8 Prozessmodell \(BPMN\)/i);
  assert.match(publicText, /notariat8\.de ist die öffentliche Lesefläche für die Demo/i);
  assert.match(publicText, /Der freigegebene Referenzstand bleibt prüfbar, aber die Vorführung beginnt hier im Browser/i);
  assert.match(publicText, /Für die Demo genügt die Reihenfolge: Vorgang wählen, BPMN lesen, Grenzen benennen, App öffnen/i);
  assert.match(publicText, /BPMN im Browser verstehen/i);
  assert.doesNotMatch(publicText, /GitHub-Ersatz/i);
  assert.doesNotMatch(publicText, /Referenzdetails öffnen/i);
});

test("english process model page frames the BPMN viewer as demo guidance, not a GitHub replacement", () => {
  const html = readFileSync("en/process-model.html", "utf8");
  const publicText = htmlToPublicText(html);

  assert.match(publicText, /notariat8 process model \(BPMN\)/i);
  assert.match(publicText, /notariat8\.de is the public reading surface for the demo/i);
  assert.match(publicText, /The approved reference remains reviewable, but the presentation starts here in the browser/i);
  assert.match(publicText, /For the demo, the order is enough: choose matter, read BPMN, name boundaries, open app/i);
  assert.match(publicText, /Understand BPMN in the browser/i);
  assert.doesNotMatch(publicText, /GitHub replacement/i);
  assert.doesNotMatch(publicText, /Open reference details/i);
});

test("public process model pages render BPMN assets without making GitHub the viewer", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const script = readFileSync("assets/site.js", "utf8");

  assert.equal(existsSync("assets/bpmn/immobilienkaufvertrag.svg"), true);
  assert.match(german, /data-process-model-viewer/i);
  assert.match(german, /assets\/bpmn\/immobilienkaufvertrag\.svg/i);
  assert.match(german, /Demo-Einordnung auf notariat8\.de/i);
  assert.doesNotMatch(german, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn/i);
  assert.doesNotMatch(german, /href="https:\/\/github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/[^"]+">Prozessmodell ansehen/i);

  assert.match(english, /data-process-model-viewer/i);
  assert.match(english, /\.\.\/assets\/bpmn\/immobilienkaufvertrag\.svg/i);
  assert.match(english, /Demo context on notariat8\.de/i);
  assert.doesNotMatch(english, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn/i);
  assert.doesNotMatch(english, /href="https:\/\/github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/[^"]+">View process model/i);

  assert.doesNotMatch(script, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn/i);
  assert.doesNotMatch(script, /bpmnPath/i);
});

test("process model pages lead demos with local navigation and app transition", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const script = readFileSync("assets/site.js", "utf8");

  assert.match(german, /href="\.\/#ablauf">Zur Vorgangsübersicht/i);
  assert.match(german, /href="\.\/">Zur Startseite/i);
  assert.match(german, /<a class="button primary" href="https:\/\/app\.notariat8\.de\/login\?source=notariat8&amp;entry=usecase&amp;usecase=immobilienkaufvertrag" data-process-app>In der App testen<\/a>/i);
  assert.doesNotMatch(german, /class="button secondary" href="https:\/\/github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/[^"]+" data-process-reference>Technischen Referenzstand öffnen/i);

  assert.match(english, /href="\.\/#process">Back to matter overview/i);
  assert.match(english, /href="\.\/">Back to home/i);
  assert.match(english, /<a class="button primary" href="https:\/\/app\.notariat8\.de\/login\?source=notariat8&amp;entry=usecase&amp;usecase=immobilienkaufvertrag" data-process-app>Test in app<\/a>/i);
  assert.doesNotMatch(english, /class="button secondary" href="https:\/\/github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/[^"]+" data-process-reference>Open technical reference/i);

  assert.match(script, /new URL\("\/login", appBaseUrl\(\)\)/i);
  assert.doesNotMatch(script, /appLink\.href = `https:\/\/app\.notariat8\.de/i);
});

test("process model pages provide a complete non-JavaScript matter selector fallback", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const expected = [
    "immobilienkaufvertrag",
    "grundschuld-hypothekenbestellung",
    "online-gmbh-gruendung",
    "handelsregisteranmeldung",
    "unterschriftsbeglaubigung",
    "testament-erbvertrag",
    "erbscheinsantrag-nachlass",
    "vorsorgevollmacht-patientenverfuegung",
    "schenkungsvertrag-uebertragungsvertrag",
    "ehevertrag-scheidungsfolgenvereinbarung",
  ];

  for (const slug of expected) {
    assert.match(german, new RegExp(`prozessmodell\\.html\\?vorgang=${slug}`));
    assert.match(english, new RegExp(`process-model\\.html\\?matter=${slug}`));
  }
});

test("process model language links preserve the selected matter", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const script = readFileSync("assets/site.js", "utf8");

  assert.match(german, /class="language-link" href="en\/process-model\.html\?matter=immobilienkaufvertrag"/i);
  assert.match(english, /class="language-link" href="\.\.\/prozessmodell\.html\?vorgang=immobilienkaufvertrag"/i);
  assert.match(script, /data-process-language-link/i);
  assert.match(script, /languageLink\.href =/i);
});

test("process model pages explain duration, parallel work and critical path as planning values", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const script = readFileSync("assets/site.js", "utf8");
  const germanPublicText = htmlToPublicText(german);
  const englishPublicText = htmlToPublicText(english);

  assert.match(german, /Demo-Hinweis/i);
  assert.match(german, /Dauer und kritischer Pfad/i);
  assert.match(german, /Planwerte, keine amtlichen Durchschnittswerte/i);
  assert.match(germanPublicText, /Planwerte zeigen steuerbare Dauerklassen/i);
  assert.match(germanPublicText, /Kritischer Pfad zeigt wartende Abhängigkeiten/i);
  assert.match(germanPublicText, /Parallelität zeigt Schritte, die gleichzeitig anlaufen können/i);
  assert.match(german, /Parallel möglich/i);
  assert.match(german, /Blockiert den kritischen Pfad/i);
  assert.doesNotMatch(german, /Oracle|OCI|Cloud Infrastructure/i);

  assert.match(english, /Demo note/i);
  assert.match(english, /Duration and critical path/i);
  assert.match(english, /Planning values, not official averages/i);
  assert.match(englishPublicText, /Planning values show adjustable duration classes/i);
  assert.match(englishPublicText, /Critical path shows waiting dependencies/i);
  assert.match(englishPublicText, /Parallel work shows steps that can start at the same time/i);
  assert.match(english, /Can run in parallel/i);
  assert.match(english, /Blocks the critical path/i);
  assert.doesNotMatch(english, /Oracle|OCI|Cloud Infrastructure/i);

  assert.match(script, /defaultDurationBands/i);
  assert.match(script, /defaultCriticalPathNotes/i);
  assert.match(script, /durationBands/i);
  assert.match(script, /criticalPathNotes/i);
  assert.match(script, /standard_external/i);
});

test("process model pages keep external access points visible and non-operational", () => {
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");
  const germanPublicText = htmlToPublicText(german);
  const englishPublicText = htmlToPublicText(english);

  assert.match(germanPublicText, /XNP und Kartenleser bleiben sichtbar als lokale Bereitschaftsgrenze/i);
  assert.match(germanPublicText, /Register- und Grundbuchzugänge bleiben sichtbar als fachliche externe Zugriffspunkte/i);
  assert.match(germanPublicText, /Notariat8 zeigt Struktur und Prüfung im Prozessmodell und zeigt keine Mandatsdaten/i);
  assert.match(germanPublicText, /keine internen Betriebsdetails/i);
  assert.match(germanPublicText, /keine produktive Einreichung auf dieser Website/i);
  assert.match(germanPublicText, /kein echter XNP-Betrieb/i);
  assert.match(germanPublicText, /Notariat8 zeigt die öffentliche Prozesssicht mit externen Grenzen/i);
  assert.doesNotMatch(germanPublicText, /XNotar|XJustiz|Signaturpfad/i);
  assert.doesNotMatch(germanPublicText, /produktive XNP-Anbindung|XNP produktiv|produktiv an XNP/i);

  assert.match(englishPublicText, /XNP and card reader remain visible as a local readiness boundary/i);
  assert.match(englishPublicText, /register and land-register access points remain visible as professional external access points/i);
  assert.match(englishPublicText, /Notariat8 shows structure and review in the process model and shows no client data/i);
  assert.match(englishPublicText, /no internal operating details/i);
  assert.match(englishPublicText, /no production filing on this website/i);
  assert.match(englishPublicText, /no real XNP operation/i);
  assert.match(englishPublicText, /Notariat8 shows the public process view with external boundaries/i);
  assert.doesNotMatch(englishPublicText, /XNotar|XJustiz|signature path/i);
  assert.doesNotMatch(englishPublicText, /production XNP integration|XNP production|productive XNP/i);
});

test("process model pages provide a browser-first demo checklist for the chamber presentation", () => {
  const german = htmlToPublicText(readFileSync("prozessmodell.html", "utf8"));
  const english = htmlToPublicText(readFileSync("en/process-model.html", "utf8"));

  assert.match(german, /Demo-Stationen/i);
  assert.match(german, /Vorgang wählen/i);
  assert.match(german, /BPMN-Bild lesen/i);
  assert.match(german, /Dauer und kritischen Pfad erklären/i);
  assert.match(german, /XNP, Kartenleser, Register und Grundbuch als Grenzen benennen/i);
  assert.match(german, /App-Übergang nur ohne Mandatsdaten öffnen/i);
  assert.doesNotMatch(german, /produktive XNP-Anbindung|echte Registerabfrage|echte Grundbuchabfrage|Oracle|OCI|Cloud Infrastructure/i);

  assert.match(english, /Demo checkpoints/i);
  assert.match(english, /Choose matter/i);
  assert.match(english, /Read the BPMN picture/i);
  assert.match(english, /Explain duration and critical path/i);
  assert.match(english, /Name XNP, card reader, registers and land register as boundaries/i);
  assert.match(english, /Open the app transition only without client data/i);
  assert.doesNotMatch(english, /production XNP integration|real register query|real land-register query|Oracle|OCI|Cloud Infrastructure/i);
});

test("process model page keeps the BPMN canvas readable for live demo presentation", () => {
  const css = readFileSync("assets/site.css", "utf8");
  const german = readFileSync("prozessmodell.html", "utf8");
  const english = readFileSync("en/process-model.html", "utf8");

  assert.match(css, /\.process-model-hero\s*\{/);
  assert.match(css, /padding-top:\s*clamp\(2rem,\s*5vw,\s*4rem\)/);
  assert.match(css, /scroll-snap-type:\s*x proximity/);
  assert.match(css, /min-width:\s*980px/);
  assert.match(css, /width:\s*100%/);
  assert.match(css, /@media \(max-width: 520px\) \{[\s\S]*\.process-model-selector \{[\s\S]*flex-wrap: nowrap;/);
  assert.match(css, /@media \(max-width: 520px\) \{[\s\S]*\.process-model-scroll img \{[\s\S]*min-width:\s*980px/);

  assert.match(german, /20260622-process-model-fit-overview/);
  assert.match(english, /20260622-process-model-fit-overview/);
});

test("real estate process steps use review-oriented labels that fit the step tiles", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");
  const css = readFileSync("assets/site.css", "utf8");

  assert.doesNotMatch(german, />Grundbuchstand</i);
  assert.match(german, />Grundbuch prüfen</i);
  assert.match(english, />Land register review</i);

  assert.match(
    css,
    /\.process-steps \{[\s\S]*grid-template-columns: repeat\(auto-fit, minmax\(112px, 1fr\)\);/,
    "process step tiles must keep public labels wide enough to stay readable"
  );
  assert.match(
    css,
    /\.process-steps li \{[\s\S]*overflow-wrap: break-word;/,
    "process step tiles must still guard against unexpectedly long labels"
  );
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
  assert.match(html, /Änderungsvorschlag mit Prüfung und Freigabe/i);
  assert.match(html, /Software Bill of Materials \(SBOM\)/i);
  assert.match(html, /Software-Stückliste/i);
  assert.match(html, /Sie ersetzt keine eigene Sicherheits- oder Rechtsprüfung/i);
  assert.match(html, /Demo-Evidenz/i);
  assert.match(html, /geschützte Änderungsvorschläge/i);
  assert.match(html, /statische Dokumente/i);
  assert.match(html, /automatisierte Tests/i);
  assert.match(html, /keine Mandatsdaten/i);
  assert.match(html, /keine Cloud-Aktion/i);
});
