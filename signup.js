"use strict";

// =========================================
// GLOSSVAULT SIGNUP — ELEMENTS
// =========================================

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

const signupThemeButton = document.getElementById("signupThemeToggle");
const signupRtlButton = document.getElementById("signupRtlToggle");

const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");

const SIGNUP_THEME_KEY = "gv-theme";
const SIGNUP_DIRECTION_KEY = "gv-direction";

// =========================================
// SAFE STORAGE
// =========================================

function readSignupPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function saveSignupPreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Continue if browser storage is unavailable.
  }
}

// =========================================
// LUCIDE ICONS
// =========================================

function refreshSignupIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// =========================================
// DARK MODE
// =========================================

function applySignupTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);

  if (signupThemeButton) {
    signupThemeButton.innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';

    signupThemeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );

    signupThemeButton.setAttribute("aria-pressed", String(isDark));
    signupThemeButton.removeAttribute("title");
  }

  refreshSignupIcons();
}

signupThemeButton?.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode")
    ? "light"
    : "dark";

  saveSignupPreference(SIGNUP_THEME_KEY, nextTheme);
  applySignupTheme(nextTheme);
});

// =========================================
// RTL / LTR DIRECTION
// =========================================

function applySignupDirection(direction) {
  const nextDirection = direction === "rtl" ? "rtl" : "ltr";

  document.documentElement.dir = nextDirection;

  if (signupRtlButton) {
    signupRtlButton.innerHTML = '<i data-lucide="arrow-left-right"></i>';

    signupRtlButton.setAttribute(
      "aria-label",
      nextDirection === "rtl"
        ? "Switch to left-to-right layout"
        : "Switch to right-to-left layout",
    );

    signupRtlButton.setAttribute(
      "aria-pressed",
      String(nextDirection === "rtl"),
    );

    signupRtlButton.removeAttribute("title");
  }

  refreshSignupIcons();
}

signupRtlButton?.addEventListener("click", () => {
  const nextDirection = document.documentElement.dir === "rtl" ? "ltr" : "rtl";

  saveSignupPreference(SIGNUP_DIRECTION_KEY, nextDirection);
  applySignupDirection(nextDirection);
});

// =========================================
// SYNCHRONIZE OTHER OPEN TABS
// =========================================

window.addEventListener("storage", (event) => {
  if (event.key === SIGNUP_THEME_KEY) {
    applySignupTheme(event.newValue === "dark" ? "dark" : "light");
  }

  if (event.key === SIGNUP_DIRECTION_KEY) {
    applySignupDirection(event.newValue === "rtl" ? "rtl" : "ltr");
  }
});

// =========================================
// SHOW / HIDE PASSWORDS
// =========================================

document.querySelectorAll(".signup-password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.passwordTarget;
    const input = document.getElementById(targetId);

    if (!input) return;

    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";

    button.innerHTML = showPassword
      ? '<i data-lucide="eye-off"></i>'
      : '<i data-lucide="eye"></i>';

    button.setAttribute(
      "aria-label",
      showPassword ? "Hide password" : "Show password",
    );

    button.setAttribute("aria-pressed", String(showPassword));

    refreshSignupIcons();
  });
});

// =========================================
// PASSWORD CONFIRMATION
// =========================================

function validateSignupPasswords() {
  if (!signupPassword || !confirmPassword) return;

  if (confirmPassword.value && signupPassword.value !== confirmPassword.value) {
    confirmPassword.setCustomValidity("Passwords do not match.");
  } else {
    confirmPassword.setCustomValidity("");
  }
}

confirmPassword?.addEventListener("input", validateSignupPasswords);
signupPassword?.addEventListener("input", validateSignupPasswords);

// =========================================
// SIGNUP FORM — FRONTEND DEMO ONLY
// =========================================

signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!signupForm.checkValidity()) {
    signupForm.reportValidity();
    return;
  }

  if (
    signupPassword &&
    confirmPassword &&
    signupPassword.value !== confirmPassword.value
  ) {
    confirmPassword.setCustomValidity("Passwords do not match.");
    confirmPassword.reportValidity();
    return;
  }

  confirmPassword?.setCustomValidity("");

  if (signupMessage) {
    signupMessage.textContent =
      "Registration is not connected yet. A secure backend is required to create an account.";
  }
});

// =========================================
// INITIALIZE PREFERENCES
// =========================================

applySignupTheme(readSignupPreference(SIGNUP_THEME_KEY, "light"));

applySignupDirection(readSignupPreference(SIGNUP_DIRECTION_KEY, "ltr"));

refreshSignupIcons();
