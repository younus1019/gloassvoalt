"use strict";

/* =========================================
   GLOSSVAULT — GLOBAL INTERACTIONS
   Graphite Gray + Crimson Red
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     ELEMENTS
  ========================================= */

  const body = document.body;
  const html = document.documentElement;

  const menuToggle = document.getElementById("gv-menu-toggle");
  const navigation = document.getElementById("gv-navigation");
  const overlay = document.getElementById("gv-overlay");

  const homeDropdown = document.querySelector(".gv-nav__item--dropdown");
  const dropdownTrigger = document.querySelector(".gv-nav__dropdown-trigger");

  const themeButtons = [
    document.getElementById("gv-theme-toggle"),
    document.getElementById("gv-theme-toggle-mobile"),
  ].filter(Boolean);

  const rtlButtons = [
    document.getElementById("gv-rtl-toggle"),
    document.getElementById("gv-rtl-toggle-mobile"),
  ].filter(Boolean);

  const desktopMediaQuery = window.matchMedia("(min-width: 768px)");

  /* =========================================
     STORAGE HELPERS
  ========================================= */

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
      // The page remains usable without localStorage.
    }
  }

  /* =========================================
     LUCIDE ICONS
  ========================================= */

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* =========================================
     DARK MODE
  ========================================= */

  function updateThemeButtons() {
    const isDark = body.classList.contains("dark-mode");

    themeButtons.forEach((button) => {
      button.innerHTML = isDark
        ? '<i data-lucide="sun"></i>'
        : '<i data-lucide="moon"></i>';

      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );

      button.setAttribute("aria-pressed", String(isDark));
      button.removeAttribute("title");
    });

    refreshIcons();
  }

  function setTheme(isDark) {
    body.classList.toggle("dark-mode", isDark);

    savePreference("gv-theme", isDark ? "dark" : "light");

    updateThemeButtons();
  }

  setTheme(readPreference("gv-theme", "light") === "dark");

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(!body.classList.contains("dark-mode"));
    });
  });

  /* =========================================
     RTL / LTR DIRECTION
  ========================================= */

  function updateRTLButtons() {
    const isRTL = html.getAttribute("dir") === "rtl";

    rtlButtons.forEach((button) => {
      button.innerHTML = '<i data-lucide="arrow-left-right"></i>';

      button.setAttribute(
        "aria-label",
        isRTL
          ? "Switch to left-to-right layout"
          : "Switch to right-to-left layout",
      );

      button.setAttribute("aria-pressed", String(isRTL));
      button.removeAttribute("title");
    });

    refreshIcons();
  }

  function setRTL(enabled) {
    html.setAttribute("dir", enabled ? "rtl" : "ltr");

    savePreference("gv-direction", enabled ? "rtl" : "ltr");

    updateRTLButtons();
  }

  setRTL(readPreference("gv-direction", "ltr") === "rtl");

  rtlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setRTL(html.getAttribute("dir") !== "rtl");
    });
  });

  /* =========================================
     MOBILE NAVIGATION
  ========================================= */

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
    if (!menuToggle || !navigation || !overlay) return;

    navigation.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    body.classList.remove("gv-menu-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';

    refreshIcons();
  }

  if (menuToggle && navigation && overlay) {
    menuToggle.setAttribute("aria-controls", "gv-navigation");
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      navigation.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);
  }

  /* =========================================
     HOME DROPDOWN
  ========================================= */

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

  /* =========================================
     CLOSE MENU AFTER NAVIGATION
  ========================================= */

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* =========================================
     KEYBOARD SUPPORT
  ========================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeDropdown();
    }
  });

  /* =========================================
     RESPONSIVE NAVIGATION
  ========================================= */

  function handleBreakpointChange(event) {
    if (event.matches) {
      closeMenu();
    }
  }

  if (desktopMediaQuery.addEventListener) {
    desktopMediaQuery.addEventListener("change", handleBreakpointChange);
  } else {
    desktopMediaQuery.addListener(handleBreakpointChange);
  }

  /* =========================================
     FOOTER YEAR
  ========================================= */

  const footerYear = document.getElementById("gv-footer-year");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* =========================================
     INITIALIZE ALL PAGE ICONS
  ========================================= */

  refreshIcons();
});
