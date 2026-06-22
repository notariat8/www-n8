const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const appUrlMeta = document.querySelector('meta[name="nac-app-url"]');
const transitionForms = document.querySelectorAll("[data-nac-transition]");

const appBaseUrl = () => {
  const appUrl = appUrlMeta?.getAttribute("content") || "https://app.notariat8.de";

  return new URL(appUrl, window.location.href);
};

const addTrimmedParam = (url, key, value) => {
  const hint = String(value || "").trim();

  if (hint) {
    url.searchParams.set(key, hint.slice(0, 120));
  }
};

const buildAppUrl = (form) => {
  const baseUrl = appBaseUrl();
  const formData = new FormData(form);
  const transitionType = form.dataset.nacTransition;

  if (transitionType === "prospect") {
    const url = new URL("/onboarding/readiness", baseUrl);

    url.searchParams.set("source", "notariat8");
    url.searchParams.set("audience", "customer");
    addTrimmedParam(url, "domain_hint", formData.get("domain_hint"));

    return url;
  }

  const url = new URL("/login", baseUrl);

  url.searchParams.set("source", "notariat8");
  url.searchParams.set("entry", transitionType || "customer");
  addTrimmedParam(url, "tenant_hint", formData.get("tenant_hint"));

  return url;
};

transitionForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.assign(buildAppUrl(form).toString());
  });
});

document.querySelectorAll("[data-usecase-viewer]").forEach((viewer) => {
  const tabs = Array.from(viewer.querySelectorAll("[data-usecase-tab]"));
  const panels = Array.from(viewer.querySelectorAll("[data-usecase-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.usecaseTab;

      tabs.forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle("is-active", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
      });

      panels.forEach((panel) => {
        const isSelected = panel.dataset.usecasePanel === target;
        panel.classList.toggle("is-active", isSelected);
        panel.hidden = !isSelected;
      });
    });
  });
});

const defaultDurationBands = {
  de: [
    { label: "Interne Prüfung", value: "Stunden bis Tage", kind: "same_day_or_internal" },
    { label: "Externe Rückläufe", value: "Wochen", kind: "standard_external" },
    { label: "Komplexe Abstimmung", value: "Wochen bis Monate", kind: "extended_external" },
  ],
  en: [
    { label: "Internal review", value: "hours to days", kind: "same_day_or_internal" },
    { label: "External responses", value: "weeks", kind: "standard_external" },
    { label: "Complex coordination", value: "weeks to months", kind: "extended_external" },
  ],
};

const defaultCriticalPathNotes = {
  de: [
    "Parallel möglich: vorbereitende Prüfungen, Rückfragen und Nachweise können je nach Vorgang gleichzeitig anlaufen.",
    "Blockiert den kritischen Pfad: der nächste Schritt wartet auf Freigaben, Rückläufe oder eine dokumentierte Prüfung.",
    "Planwerte, keine amtlichen Durchschnittswerte: Dauerklassen dienen der Demo und der Vorgangsplanung.",
  ],
  en: [
    "Can run in parallel: preparatory reviews, questions and evidence can start at the same time depending on the matter.",
    "Blocks the critical path: the next step waits for approvals, responses or documented review.",
    "Planning values, not official averages: duration classes support the demo and matter planning.",
  ],
};

const processModels = [
  {
    slug: "immobilienkaufvertrag",
    de: {
      title: "Immobilienkaufvertrag",
      summary:
        "Der Ablauf zeigt, welche Arbeiten parallel laufen können, welche externen Rückläufe den Vollzug typischerweise blockieren und wo XNP, Register und Grundbuch als Zugangspunkte berührt werden.",
      steps: ["Aufnahme", "Grundbuch prüfen", "Entwurf", "Beurkundung", "Vollzug"],
      durationBands: [
        { label: "Interne Prüfung", value: "Stunden bis Tage", kind: "same_day_or_internal" },
        { label: "Externe Rückläufe", value: "Wochen", kind: "standard_external" },
        { label: "Komplexer Vollzug", value: "Wochen bis Monate", kind: "extended_external" },
      ],
      criticalPathNotes: [
        "Parallel möglich: Finanzamt, Gemeinde, Vormerkung, Finanzierung und Löschungsunterlagen können nach Beurkundung gleichzeitig anlaufen.",
        "Blockiert den kritischen Pfad: Kaufpreisfälligkeit erst nach den relevanten Freigaben, Rückläufen und Rangprüfungen.",
        "Planwerte, keine amtlichen Durchschnittswerte: Dauerklassen sind editierbare Parameter für die Vorgangsplanung.",
      ],
    },
    en: {
      title: "Real estate purchase agreement",
      summary:
        "The flow shows which work can run in parallel, which external responses typically block completion and where XNP, registers and the land register are touched as access points.",
      steps: ["Intake", "Land register review", "Draft", "Notarization", "Completion"],
      durationBands: [
        { label: "Internal review", value: "hours to days", kind: "same_day_or_internal" },
        { label: "External responses", value: "weeks", kind: "standard_external" },
        { label: "Complex execution", value: "weeks to months", kind: "extended_external" },
      ],
      criticalPathNotes: [
        "Can run in parallel: tax office, municipality, priority notice, financing and release documents can start after notarization.",
        "Blocks the critical path: purchase-price maturity waits for the relevant approvals, responses and rank checks.",
        "Planning values, not official averages: duration classes are editable parameters for matter planning.",
      ],
    },
  },
  {
    slug: "grundschuld-hypothekenbestellung",
    de: {
      title: "Grundschuld / Hypothekenbestellung",
      summary:
        "Der Ablauf bündelt Grundbuchbezug, Gläubigervorgaben, Entwurf, Beurkundung und Einreichung in einem prüfbaren Ablauf.",
      steps: ["Aufnahme", "Gläubigervorgaben", "Entwurf", "Beurkundung", "Einreichung"],
    },
    en: {
      title: "Land charge / mortgage order",
      summary:
        "The flow combines land register context, lender requirements, draft, notarization and filing in one reviewable sequence.",
      steps: ["Intake", "Lender terms", "Draft", "Notarization", "Filing"],
    },
  },
  {
    slug: "online-gmbh-gruendung",
    de: {
      title: "GmbH-/UG-Gründung",
      summary:
        "Der Ablauf zeigt die digitale Gründung mit Beteiligtenaufnahme, Satzung, Beurkundung, Registeranmeldung und Nachweisführung.",
      steps: ["Beteiligte", "Satzung", "Beurkundung", "Register", "Nachweise"],
    },
    en: {
      title: "GmbH-/UG formation",
      summary:
        "The flow shows digital company formation with party intake, articles, notarization, register filing and evidence.",
      steps: ["Parties", "Articles", "Notarization", "Register", "Evidence"],
    },
  },
  {
    slug: "handelsregisteranmeldung",
    de: {
      title: "Handelsregisteranmeldung",
      summary:
        "Der Ablauf verbindet Beschluss- oder Anmeldungsgrundlage, Vertretungsprüfung, Entwurf, Signatur und Registereinreichung.",
      steps: ["Anlass", "Vertretung", "Entwurf", "Signatur", "Register"],
    },
    en: {
      title: "Commercial register filing",
      summary:
        "The flow connects the filing basis, representation review, draft, signature and register submission.",
      steps: ["Trigger", "Representation", "Draft", "Signature", "Register"],
    },
  },
  {
    slug: "unterschriftsbeglaubigung",
    de: {
      title: "Beglaubigung von Unterschriften",
      summary:
        "Der Ablauf hält Identität, Vertretung, Dokumentprüfung, Beglaubigung und Ausfertigung als geschlossenen Ablauf zusammen.",
      steps: ["Identität", "Vertretung", "Dokument", "Beglaubigung", "Ausfertigung"],
    },
    en: {
      title: "Signature certification",
      summary:
        "The flow keeps identity, representation, document review, certification and issued copy together as one closed process.",
      steps: ["Identity", "Representation", "Document", "Certification", "Issued copy"],
    },
  },
  {
    slug: "testament-erbvertrag",
    de: {
      title: "Testament / Erbvertrag",
      summary:
        "Der Ablauf zeigt Beratung, Entwurf, Beurkundung, Verwahrung und Registerbezug ohne echte persönliche Daten.",
      steps: ["Beratung", "Entwurf", "Beurkundung", "Verwahrung", "Nachweis"],
    },
    en: {
      title: "Will / inheritance contract",
      summary:
        "The flow shows consultation, draft, notarization, custody and register reference without personal data.",
      steps: ["Consultation", "Draft", "Notarization", "Custody", "Evidence"],
    },
  },
  {
    slug: "erbscheinsantrag-nachlass",
    de: {
      title: "Erbscheinsantrag / Nachlass",
      summary:
        "Der Ablauf führt Erbfolge, Urkundenlage, Antrag, Versicherung, Beurkundung und Nachlassgericht-Bezug geordnet zusammen.",
      steps: ["Erbfolge", "Urkunden", "Antrag", "Beurkundung", "Gericht"],
    },
    en: {
      title: "Certificate of inheritance / estate",
      summary:
        "The flow organizes succession, civil status documents, application, sworn statement, notarization and court reference.",
      steps: ["Succession", "Documents", "Application", "Notarization", "Court"],
    },
  },
  {
    slug: "vorsorgevollmacht-patientenverfuegung",
    de: {
      title: "Vorsorgevollmacht und Patientenverfügung",
      summary:
        "Der Ablauf macht Beteiligte, Reichweite, Identität, Beurkundung oder Beglaubigung, Registrierung und Ausfertigung sichtbar.",
      steps: ["Beteiligte", "Reichweite", "Identität", "Urkunde", "Register"],
    },
    en: {
      title: "Power of attorney and advance directive",
      summary:
        "The flow makes parties, scope, identity, notarization or certification, registration and issued copies visible.",
      steps: ["Parties", "Scope", "Identity", "Deed", "Register"],
    },
  },
  {
    slug: "schenkungsvertrag-uebertragungsvertrag",
    de: {
      title: "Schenkungsvertrag / Übertragungsvertrag",
      summary:
        "Der Ablauf führt Beteiligte, Gegenstand, Grundbuch- oder Registerbezug, Entwurf, Beurkundung und Vollzug kontrolliert zusammen.",
      steps: ["Beteiligte", "Gegenstand", "Entwurf", "Beurkundung", "Vollzug"],
    },
    en: {
      title: "Gift / transfer agreement",
      summary:
        "The flow brings parties, object, land register or register context, draft, notarization and completion together.",
      steps: ["Parties", "Object", "Draft", "Notarization", "Completion"],
    },
  },
  {
    slug: "ehevertrag-scheidungsfolgenvereinbarung",
    de: {
      title: "Ehevertrag / Scheidungsfolgenvereinbarung",
      summary:
        "Der Ablauf strukturiert Beteiligte, Regelungsbereiche, Entwurf, Beurkundung, Ausfertigung und spätere Nachvollziehbarkeit.",
      steps: ["Beteiligte", "Regelungen", "Entwurf", "Beurkundung", "Ausfertigung"],
    },
    en: {
      title: "Marriage contract / divorce settlement",
      summary:
        "The flow structures parties, regulated areas, draft, notarization, issued copy and later traceability.",
      steps: ["Parties", "Terms", "Draft", "Notarization", "Issued copy"],
    },
  },
];

const processModelBySlug = new Map(processModels.map((model) => [model.slug, model]));

document.querySelectorAll("[data-process-model-viewer]").forEach((viewer) => {
  const language = viewer.dataset.lang === "en" ? "en" : "de";
  const paramName = viewer.dataset.paramName || (language === "en" ? "matter" : "vorgang");
  const assetPrefix = viewer.dataset.assetPrefix || "assets/bpmn/";
  const labels =
    language === "en"
      ? {
          optionBase: "process-model.html?matter=",
          imageAlt: "BPMN process model",
          documentSuffix: " | Notariat8",
        }
      : {
          optionBase: "prozessmodell.html?vorgang=",
          imageAlt: "BPMN-Prozessmodell",
          documentSuffix: " | Notariat8",
        };
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get(paramName) || params.get("vorgang") || params.get("matter");
  const title = viewer.querySelector("[data-process-title]");
  const summary = viewer.querySelector("[data-process-summary]");
  const image = viewer.querySelector("[data-process-svg]");
  const appLink = viewer.querySelector("[data-process-app]");
  const languageLink = document.querySelector("[data-process-language-link]");
  const steps = viewer.querySelector("[data-process-steps]");
  const durationBands = viewer.querySelector("[data-process-duration-bands]");
  const criticalPathNotes = viewer.querySelector("[data-process-critical-path]");
  const options = viewer.querySelector("[data-process-model-options]");

  const render = (slug, replaceHistory = false) => {
    const model = processModelBySlug.get(slug) || processModels[0];
    const copy = model[language] || model.de;

    if (title) {
      title.textContent = copy.title;
    }

    if (summary) {
      summary.textContent = copy.summary;
    }

    if (image) {
      image.src = `${assetPrefix}${model.slug}.svg`;
      image.alt = `${labels.imageAlt} ${copy.title}`;
    }

    if (appLink) {
      const url = new URL("/login", appBaseUrl());
      url.searchParams.set("source", "notariat8");
      url.searchParams.set("entry", "usecase");
      url.searchParams.set("usecase", model.slug);
      appLink.href = url.toString();
    }

    if (languageLink) {
      const crossLanguagePath =
        language === "en" ? "../prozessmodell.html?vorgang=" : "en/process-model.html?matter=";
      languageLink.href = `${crossLanguagePath}${encodeURIComponent(model.slug)}`;
    }

    if (steps) {
      steps.replaceChildren(
        ...copy.steps.map((step) => {
          const item = document.createElement("li");
          item.textContent = step;
          return item;
        })
      );
    }

    if (durationBands) {
      const bands = copy.durationBands || defaultDurationBands[language];

      durationBands.replaceChildren(
        ...bands.map((band) => {
          const item = document.createElement("li");
          item.className = `process-duration-band ${band.kind || ""}`.trim();
          const label = document.createElement("span");
          label.textContent = band.label;
          const value = document.createElement("strong");
          value.textContent = band.value;
          item.append(label, value);
          return item;
        })
      );
    }

    if (criticalPathNotes) {
      const notes = copy.criticalPathNotes || defaultCriticalPathNotes[language];

      criticalPathNotes.replaceChildren(
        ...notes.map((note) => {
          const item = document.createElement("li");
          item.textContent = note;
          return item;
        })
      );
    }

    if (options) {
      options.querySelectorAll("[data-process-model-option]").forEach((option) => {
        option.classList.toggle("is-active", option.dataset.processModelOption === model.slug);
      });
    }

    document.title = `${copy.title}${labels.documentSuffix}`;

    if (replaceHistory && window.history?.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set(paramName, model.slug);
      window.history.pushState({}, "", url);
    }
  };

  if (options) {
    options.replaceChildren(
      ...processModels.map((model) => {
        const copy = model[language] || model.de;
        const link = document.createElement("a");
        link.href = `${labels.optionBase}${encodeURIComponent(model.slug)}`;
        link.dataset.processModelOption = model.slug;
        link.textContent = copy.title;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          render(model.slug, true);
        });
        return link;
      })
    );
  }

  render(requestedSlug || processModels[0].slug);
});
