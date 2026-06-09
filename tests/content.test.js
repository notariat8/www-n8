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
  assert.match(publicText, /n8 zeigt Vorgänge\. Die App testet Abläufe\./i);
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
  assert.match(publicText, /n8 shows matters\. The app tests flows\./i);
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
    assert.match(html, /assets\/site\.css\?v=20260609-process-steps/i);
    assert.match(html, /assets\/site\.js\?v=20260608-usecase-viewer/i);
  }

  assert.match(german, /Vorgangsübersicht/i);
  assert.match(german, /Ausgewählte Vorgänge/i);
  assert.match(german, /Immobilienkaufvertrag/i);
  assert.match(german, /GmbH-\/UG-Gründung/i);
  assert.match(german, /Vorsorgevollmacht und Patientenverfügung/i);
  assert.match(german, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
  assert.match(german, /github\.com\/notariat8\/NaC\/blob\/main\/bpmn\/immobilienkaufvertrag\.bpmn/i);
  assert.match(german, /app\.notariat8\.de\/\?source=www-n8&amp;entry=usecase&amp;usecase=immobilienkaufvertrag/i);
  assert.match(german, /freigegebener Arbeits- und Prüfablauf, nur ohne Mandatsdaten/i);

  assert.match(english, /Matter overview/i);
  assert.match(english, /Selected matters/i);
  assert.match(english, /Approved work and review flow, only without client data/i);
  assert.match(english, /github\.com\/notariat8\/NaC\/tree\/main\/usecases\/immobilienkaufvertrag/i);
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
});
