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

test("repository governance page documents every notariat8 repository", () => {
  const html = readFileSync("repo-governance.html", "utf8");

  for (const repo of ["NaC", "www-n8", "demo8notariat", "oci-landing-zone"]) {
    assert.match(html, new RegExp(repo.replace("-", "\\-")), repo);
  }

  assert.match(html, /Force-Push/i);
  assert.match(html, /Löschen/i);
  assert.match(html, /GitHub Pro oder öffentliches Repository/i);
});
