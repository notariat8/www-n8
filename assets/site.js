const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const appUrlMeta = document.querySelector('meta[name="nac-app-url"]');
const transitionForms = document.querySelectorAll("[data-nac-transition]");

const buildAppUrl = (form) => {
  const appUrl = appUrlMeta?.getAttribute("content") || "https://app.notariat8.de/";
  const url = new URL(appUrl, window.location.href);
  const formData = new FormData(form);
  const transitionType = form.dataset.nacTransition;

  url.searchParams.set("source", "www-n8");

  if (transitionType) {
    url.searchParams.set("entry", transitionType);
  }

  for (const [key, value] of formData.entries()) {
    const hint = String(value).trim();

    if (hint) {
      url.searchParams.set(key, hint.slice(0, 120));
    }
  }

  return url;
};

transitionForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.assign(buildAppUrl(form).toString());
  });
});
