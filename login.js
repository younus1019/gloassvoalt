"use strict";

// =========================================
// GLOSSVAULT LOGIN — ELEMENTS
// =========================================

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

const themeButton = document.getElementById("loginThemeToggle");
const rtlButton = document.getElementById("loginRtlToggle");

const THEME_KEY = "gvPortalTheme";
const DIRECTION_KEY = "gvPortalDir";

// =========================================
// SAFE STORAGE HELPERS
// =========================================

function getPreference(key, fallback) {
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

// =========================================
// REFRESH LUCIDE ICONS
// =========================================

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// =========================================
// DARK MODE
// =========================================

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);

  if (themeButton) {
    // Keep the button icon-only to prevent wrapping.
    themeButton.innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';

    themeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );

    themeButton.setAttribute("aria-pressed", String(isDark));

    // Do not set a title: native tooltips can wrap below the icon.
    themeButton.removeAttribute("title");
  }

  refreshIcons();
}

themeButton?.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";

  savePreference(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

// =========================================
// RTL / LTR DIRECTION
// =========================================

function applyDirection(direction) {
  const nextDirection = direction === "rtl" ? "rtl" : "ltr";

  document.documentElement.dir = nextDirection;

  if (rtlButton) {
    // Keep the button icon-only to prevent wrapping.
    rtlButton.innerHTML = '<i data-lucide="arrow-left-right"></i>';

    rtlButton.setAttribute(
      "aria-label",
      nextDirection === "rtl"
        ? "Switch to left-to-right layout"
        : "Switch to right-to-left layout",
    );

    rtlButton.setAttribute("aria-pressed", String(nextDirection === "rtl"));

    rtlButton.removeAttribute("title");
  }

  refreshIcons();
}

rtlButton?.addEventListener("click", () => {
  const nextDirection = document.documentElement.dir === "rtl" ? "ltr" : "rtl";

  savePreference(DIRECTION_KEY, nextDirection);
  applyDirection(nextDirection);
});

// =========================================
// SHOW / HIDE PASSWORD
// =========================================

function setPasswordVisibility(visible) {
  if (!passwordInput || !togglePassword) return;

  passwordInput.type = visible ? "text" : "password";

  togglePassword.innerHTML = visible
    ? '<i data-lucide="eye-off"></i>'
    : '<i data-lucide="eye"></i>';

  togglePassword.setAttribute(
    "aria-label",
    visible ? "Hide password" : "Show password",
  );

  togglePassword.setAttribute("aria-pressed", String(visible));

  refreshIcons();
}

togglePassword?.addEventListener("click", () => {
  if (!passwordInput) return;

  setPasswordVisibility(passwordInput.type === "password");
});

// =========================================
// LOGIN FORM — FRONTEND DEMO ONLY
// =========================================

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!loginForm.checkValidity()) {
    loginForm.reportValidity();
    return;
  }

  if (loginMessage) {
    loginMessage.textContent =
      "Login is not connected yet. A backend authentication service is required.";
  }
});

// =========================================
// INITIALIZE PREFERENCES
// =========================================

applyTheme(getPreference(THEME_KEY, "light"));
applyDirection(getPreference(DIRECTION_KEY, "ltr"));
setPasswordVisibility(false);
