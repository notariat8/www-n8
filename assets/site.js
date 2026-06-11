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
