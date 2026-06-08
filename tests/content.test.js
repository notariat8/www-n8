const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const pages = [
  ["German home page", "index.html"],
  ["English home page", "en/index.html"],
];

test("home pages do not expose roadmap-style next-step CTA copy", () => {
  for (const [label, file] of pages) {
    const html = readFileSync(file, "utf8");

    assert.doesNotMatch(html, /Nächster Schritt|Referenzstand prüfen/i, label);
    assert.doesNotMatch(html, /Next step|Review the reference state/i, label);
  }
});

test("home pages use the canonical Notariat8 brand asset", () => {
  for (const [label, file] of pages) {
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

test("home pages position use cases as bounded template workflows with GitHub as reference", () => {
  const german = readFileSync("index.html", "utf8");
  const english = readFileSync("en/index.html", "utf8");

  assert.match(german, /Use Cases als Muster-Workflows/i);
  assert.match(german, /GitHub als Referenzstand/i);
  assert.match(german, /Abweichungen begründen/i);
  assert.match(german, /standardisierter und besser/i);
  assert.doesNotMatch(german, /Gemeinsam betrachten wir/i);
  assert.doesNotMatch(german, /Geeignete digitale Unterstützung/i);

  assert.match(english, /Use cases as template workflows/i);
  assert.match(english, /GitHub as the reference/i);
  assert.match(english, /justify deviations/i);
  assert.match(english, /more standardized and better/i);
  assert.doesNotMatch(english, /We look together/i);
  assert.doesNotMatch(english, /Suitable digital support/i);
});

test("customer homepage styling does not use internal control-plane artwork", () => {
  const css = readFileSync("assets/site.css", "utf8");

  assert.doesNotMatch(css, /nac-control-plane\.svg/i);
});

test("repository governance page documents every notariat8 repository", () => {
  const html = readFileSync("repo-governance.html", "utf8");

  for (const repo of ["NaC", "www-n8", "demo8notariat", "oci-landing-zone"]) {
    assert.match(html, new RegExp(repo.replace("-", "\\-")), repo);
  }

  assert.match(html, /Force-Push/i);
  assert.match(html, /Löschen/i);
  assert.match(html, /GitHub Pro oder öffentliches Repository/i);
});
