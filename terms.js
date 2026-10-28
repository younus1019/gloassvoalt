document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const body = document.body;

  const themeToggle = document.getElementById("themeToggle");
  const rtlToggle = document.getElementById("rtlToggle");
  const currentYear = document.getElementById("currentYear");

  const navLinks = document.querySelectorAll(".legal-nav a[href^='#']");

  // Local storage helpers
  function getPreference(key) {
    try {
      return localStorage.getItem(`gv-${key}`);
    } catch {
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(`gv-${key}`, value);
    } catch {
      // Continue if browser storage is unavailable.
    }
  }

  // Lucide icons
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    } else {
      console.warn(
        "Lucide did not load. Check your internet connection and script URL.",
      );
    }
  }

  // Dark and light mode
  function setTheme(theme) {
    const isDark = theme === "dark";

    body.classList.toggle("dark-mode", isDark);
    html.setAttribute("data-theme", theme);

    if (themeToggle) {
      themeToggle.innerHTML = isDark
        ? '<i data-lucide="sun" aria-hidden="true"></i>'
        : '<i data-lucide="moon" aria-hidden="true"></i>';

      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );

      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.title = isDark ? "Light mode" : "Dark mode";
    }

    savePreference("theme", theme);
    renderIcons();
  }

  themeToggle?.addEventListener("click", () => {
    const isDark = body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
  });

  setTheme(getPreference("theme") === "dark" ? "dark" : "light");

  // RTL and LTR direction
  function setDirection(direction) {
    const isRTL = direction === "rtl";

    html.setAttribute("dir", isRTL ? "rtl" : "ltr");

    if (rtlToggle) {
      rtlToggle.innerHTML =
        '<i data-lucide="arrow-left-right" aria-hidden="true"></i>';

      rtlToggle.setAttribute(
        "aria-label",
        isRTL
          ? "Switch to left-to-right layout"
          : "Switch to right-to-left layout",
      );

      rtlToggle.setAttribute("aria-pressed", String(isRTL));
      rtlToggle.title = isRTL ? "Switch to LTR" : "Switch to RTL";
    }

    savePreference("direction", direction);
    renderIcons();
  }

  rtlToggle?.addEventListener("click", () => {
    const isRTL = html.getAttribute("dir") === "rtl";
    setDirection(isRTL ? "ltr" : "rtl");
  });

  setDirection(getPreference("direction") === "rtl" ? "rtl" : "ltr");

  // Footer year
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Sidebar active navigation
  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const sectionId = link.getAttribute("href").slice(1);
      const section = document.getElementById(sectionId);

      if (section) {
        event.preventDefault();

        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        history.replaceState(null, "", `#${sectionId}`);
        setActiveLink(sectionId);
      }
    });
  });

  // Update active section while scrolling
  const sections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length) {
          setActiveLink(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Back to top
  const backToTop = document.querySelector(
    "#backToTop, [data-back-to-top], .back-to-top",
  );

  function updateBackToTop() {
    if (backToTop) {
      backToTop.hidden = window.scrollY < 400;
    }
  }

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", updateBackToTop, {
    passive: true,
  });

  updateBackToTop();

  // Render icons after page initialization
  renderIcons();
});
