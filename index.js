"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const html = document.documentElement;

  const menuToggle = document.getElementById("gv-menu-toggle");
  const navigation = document.getElementById("gv-navigation");
  const overlay = document.getElementById("gv-overlay");

  const homeDropdown = document.querySelector(".gv-nav__item--dropdown");
  const dropdownTrigger = document.querySelector(".gv-nav__dropdown-trigger");

  const themeButton = document.getElementById("gv-theme-toggle");
  const rtlButton = document.getElementById("gv-rtl-toggle");

  const desktopMediaQuery = window.matchMedia(
    "(min-width: 1025px), (width: 1024px) and (height: 600px)",
  );

  /* STORAGE */

  function readPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Continue if browser storage is unavailable.
    }
  }

  /* LUCIDE ICONS */

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* DARK MODE */

  function updateThemeButton() {
    if (!themeButton) return;

    const isDark = body.classList.contains("dark-mode");

    themeButton.innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';

    themeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );

    themeButton.setAttribute("aria-pressed", String(isDark));

    refreshIcons();
  }

  function setTheme(isDark) {
    body.classList.toggle("dark-mode", isDark);
    savePreference("gv-theme", isDark ? "dark" : "light");
    updateThemeButton();
  }

  setTheme(readPreference("gv-theme", "light") === "dark");

  themeButton?.addEventListener("click", () => {
    setTheme(!body.classList.contains("dark-mode"));
  });

  /* RTL / LTR */

  function updateRTLButton() {
    if (!rtlButton) return;

    const isRTL = html.getAttribute("dir") === "rtl";

    rtlButton.innerHTML = '<i data-lucide="arrow-left-right"></i>';

    rtlButton.setAttribute(
      "aria-label",
      isRTL
        ? "Switch to left-to-right layout"
        : "Switch to right-to-left layout",
    );

    rtlButton.setAttribute("aria-pressed", String(isRTL));

    refreshIcons();
  }

  function setRTL(enabled) {
    html.setAttribute("dir", enabled ? "rtl" : "ltr");

    savePreference("gv-direction", enabled ? "rtl" : "ltr");

    updateRTLButton();
  }

  setRTL(readPreference("gv-direction", "ltr") === "rtl");

  rtlButton?.addEventListener("click", () => {
    setRTL(html.getAttribute("dir") !== "rtl");
  });

  /* MOBILE / TABLET NAVIGATION */

  function openMenu() {
    if (!menuToggle || !navigation || !overlay) return;

    navigation.classList.add("is-open");
    overlay.classList.add("is-visible");
    body.classList.add("gv-menu-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
    menuToggle.innerHTML = '<i data-lucide="x"></i>';

    refreshIcons();
  }

  function closeMenu() {
    navigation?.classList.remove("is-open");
    overlay?.classList.remove("is-visible");
    body.classList.remove("gv-menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    }

    refreshIcons();
  }

  if (menuToggle && navigation && overlay) {
    menuToggle.setAttribute("aria-controls", "gv-navigation");
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      if (navigation.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener("click", closeMenu);
  }

  /* HOME DROPDOWN */

  function closeDropdown() {
    homeDropdown?.classList.remove("is-open");
    dropdownTrigger?.setAttribute("aria-expanded", "false");
  }

  if (homeDropdown && dropdownTrigger) {
    dropdownTrigger.setAttribute("aria-expanded", "false");

    dropdownTrigger.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = homeDropdown.classList.toggle("is-open");

      dropdownTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!homeDropdown.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  /* ACTIVE NAVIGATION AND FOOTER LINKS */

  const currentPage =
    window.location.pathname.split("/").filter(Boolean).pop() || "index.html";

  const pageLinks = document.querySelectorAll(
    "#gv-navigation a[href], .gv-footer a[href]",
  );

  pageLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    let linkPage;

    try {
      const linkURL = new URL(href, window.location.href);
      linkPage =
        linkURL.pathname.split("/").filter(Boolean).pop() || "index.html";
    } catch {
      return;
    }

    const isCurrentPage = linkPage === currentPage;

    link.classList.toggle("is-active", isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  /* CLOSE MENU AFTER NAVIGATION */

  navigation?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* KEYBOARD ACCESSIBILITY */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeDropdown();
    }
  });

  /* RESPONSIVE NAVIGATION */

  function handleBreakpointChange(event) {
    if (event.matches) {
      closeMenu();
      closeDropdown();
    }
  }

  if (desktopMediaQuery.addEventListener) {
    desktopMediaQuery.addEventListener("change", handleBreakpointChange);
  } else {
    desktopMediaQuery.addListener(handleBreakpointChange);
  }

  /* FOOTER COPYRIGHT YEAR */

  const footerYear = document.getElementById("gv-footer-year");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* INITIALIZE ALL PAGE ICONS */

  refreshIcons();
});
