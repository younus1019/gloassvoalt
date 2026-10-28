/* GLOSSVAULT CUSTOMER PORTAL — FRONTEND DEMO ONLY */
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const KEY = "glossvaultPortalDemoV1";
  const THEME_KEY = "gv-theme";
  const DIRECTION_KEY = "gv-direction";

  const initial = {
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "+91 90000 00000",
    preference: "Email",
    points: 1250,
    completed: 8,
    theme: "light",
    nextId: 3,
    bookings: [
      {
        id: 1,
        service: "Ceramic Coating",
        vehicle: "Black luxury sedan",
        date: "2026-10-28",
        time: "10:30 AM",
        status: "Confirmed",
        notes: "",
      },
      {
        id: 2,
        service: "Interior Detailing",
        vehicle: "White SUV",
        date: "2026-09-18",
        time: "02:00 PM",
        status: "Completed",
        notes: "",
      },
    ],
    vehicles: [
      {
        id: 1,
        name: "Black Luxury Sedan",
        make: "Demo vehicle",
        colour: "Black",
        registration: "",
        primary: true,
      },
      {
        id: 2,
        name: "White SUV",
        make: "Demo vehicle",
        colour: "White",
        registration: "",
        primary: false,
      },
    ],
    history: [
      {
        activity: "Welcome balance (demo)",
        date: "23 Oct 2026",
        points: "+1,250",
        status: "Demo",
      },
    ],
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function readStorage(key, fallback = null) {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function load() {
    let saved = {};

    try {
      saved = JSON.parse(readStorage(KEY, "{}") || "{}");
    } catch {
      saved = {};
    }

    return {
      ...clone(initial),
      ...saved,
      theme: readStorage(THEME_KEY, "light") === "dark" ? "dark" : "light",
    };
  }

  let state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Continue if browser storage is unavailable.
    }
  }

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );

  const dateText = (value) => {
    if (!value) return "Not set";

    const date = new Date(value + "T12:00:00");

    return isNaN(date)
      ? value
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const upcoming = (booking) =>
    booking.status !== "Cancelled" &&
    booking.status !== "Completed" &&
    booking.date >= new Date().toISOString().slice(0, 10);

  const initials = (name) =>
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "GV";

  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // SHARED THEME

  function applyTheme(theme, persist = false) {
    const nextTheme = theme === "dark" ? "dark" : "light";

    state.theme = nextTheme;
    document.body.classList.toggle("dark-mode", nextTheme === "dark");

    if (persist) {
      writeStorage(THEME_KEY, nextTheme);
    }

    save();
  }

  function toggleTheme() {
    const nextTheme = document.body.classList.contains("dark-mode")
      ? "light"
      : "dark";

    applyTheme(nextTheme, true);
  }

  $("#themeToggle")?.addEventListener("click", toggleTheme);
  $("#settingsThemeBtn")?.addEventListener("click", toggleTheme);

  // SHARED RTL / LTR

  function applyDirection(direction, persist = false) {
    const nextDirection = direction === "rtl" ? "rtl" : "ltr";

    document.documentElement.setAttribute("dir", nextDirection);

    if (persist) {
      writeStorage(DIRECTION_KEY, nextDirection);
    }
  }

  $("#rtlToggle")?.addEventListener("click", () => {
    const nextDirection =
      document.documentElement.dir === "rtl" ? "ltr" : "rtl";

    applyDirection(nextDirection, true);
  });

  // Synchronize preferences when another page or tab changes them.
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY) {
      applyTheme(event.newValue === "dark" ? "dark" : "light");
    }

    if (event.key === DIRECTION_KEY) {
      applyDirection(event.newValue === "rtl" ? "rtl" : "ltr");
    }
  });

  // DASHBOARD PANEL NAVIGATION

  function panel(name) {
    const target = $("#panel-" + name);
    if (!target) return;

    $$(".dashboard-panel").forEach((item) => {
      item.classList.toggle("active", item === target);
    });

    $$(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.panel === name);
    });

    const nav = $(`.nav-item[data-panel="${name}"]`);
    const pageTitle = $("#pageTitle");

    if (pageTitle) {
      pageTitle.textContent = nav?.dataset.title || "Customer Portal";
    }

    $("#profileMenu")?.classList.remove("active");
    $("#sidebar")?.classList.remove("mobile-open");
    $("#sidebarOverlay")?.classList.remove("active");

    icons();
  }

  // CUSTOMER PROFILE

  function renderProfile() {
    const name = state.name || "Customer";

    $$(".sidebar-client-info h4, .profile-trigger > span").forEach(
      (element) => {
        element.textContent = name;
      },
    );

    $$(".sidebar-client-avatar span, .profile-avatar").forEach((element) => {
      element.textContent = initials(name);
    });

    if ($("#profileName")) $("#profileName").value = name;
    if ($("#profileEmail")) $("#profileEmail").value = state.email || "";
    if ($("#profilePhone")) $("#profilePhone").value = state.phone || "";

    if ($("#profilePreference")) {
      $("#profilePreference").value = state.preference || "Email";
    }
  }

  // BOOKINGS TABLE

  function renderBookings() {
    const tableBody = $("#bookingTableBody");
    if (!tableBody) return;

    const bookings = [...state.bookings].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    tableBody.innerHTML = bookings.length
      ? bookings
          .map(
            (booking) => `
              <tr>
                <td>${esc(booking.service)}</td>
                <td>${esc(booking.vehicle)}</td>
                <td>
                  ${esc(dateText(booking.date))}
                  <br>
                  <small>${esc(booking.time)}</small>
                </td>
                <td>
                  <span class="table-status ${
                    booking.status === "Completed"
                      ? "completed"
                      : booking.status === "Cancelled"
                        ? "cancelled"
                        : "confirmed"
                  }">
                    ${esc(booking.status)}
                  </span>
                </td>
                <td>
                  ${
                    booking.status === "Confirmed" && upcoming(booking)
                      ? `<button class="table-action" data-cancel="${booking.id}" type="button">Cancel</button>`
                      : `<button class="table-action" data-details="${booking.id}" type="button">Details</button>`
                  }
                </td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="5">No bookings yet. Create your first demo appointment.</td></tr>`;
  }

  // VEHICLE CARDS

  function renderVehicles() {
    const container = $("#vehicleCards");
    if (!container) return;

    container.innerHTML = state.vehicles
      .map(
        (vehicle) => `
          <article class="dashboard-card vehicle-card">
            <div class="card-header">
              <h3>${esc(vehicle.name)}</h3>
              <span class="status-badge ${vehicle.primary ? "confirmed-status" : ""}">
                ${vehicle.primary ? "Primary" : "Vehicle"}
              </span>
            </div>

            <div class="vehicle-illustration">
              <i data-lucide="car-front"></i>
            </div>

            <div class="detail-list">
              <div class="detail-row">
                <span>Make / model</span>
                <strong>${esc(vehicle.make || "Not provided")}</strong>
              </div>
              <div class="detail-row">
                <span>Colour</span>
                <strong>${esc(vehicle.colour || "Not provided")}</strong>
              </div>
              <div class="detail-row">
                <span>Registration</span>
                <strong>${esc(vehicle.registration || "Not provided")}</strong>
              </div>
            </div>

            <button
              class="secondary-btn"
              data-remove-vehicle="${vehicle.id}"
              type="button"
              style="margin-top:14px"
              ${vehicle.primary ? "disabled" : ""}
            >
              ${vehicle.primary ? "Primary Vehicle" : "Remove Demo Vehicle"}
            </button>
          </article>
        `,
      )
      .join("");

    icons();
  }

  // LOYALTY POINTS

  function renderPoints() {
    if ($("#statPoints")) {
      $("#statPoints").textContent = state.points.toLocaleString("en-IN");
    }

    if ($("#loyaltyPointsLarge")) {
      $("#loyaltyPointsLarge").textContent =
        state.points.toLocaleString("en-IN") + " Points";
    }

    const progress = Math.min(100, Math.round((state.points / 1500) * 100));

    if ($("#rewardProgressLabel")) {
      $("#rewardProgressLabel").textContent = progress + "%";
    }

    if ($("#rewardProgressFill")) {
      $("#rewardProgressFill").style.width = progress + "%";
    }

    if ($("#pointsHistoryBody")) {
      $("#pointsHistoryBody").innerHTML = state.history
        .map(
          (entry) => `
            <tr>
              <td>${esc(entry.activity)}</td>
              <td>${esc(entry.date)}</td>
              <td>${esc(entry.points)}</td>
              <td>
                <span class="table-status completed">
                  ${esc(entry.status)}
                </span>
              </td>
            </tr>
          `,
        )
        .join("");
    }
  }

  // RENDER DASHBOARD

  function render() {
    renderProfile();
    renderBookings();
    renderVehicles();
    renderPoints();

    const upcomingBookings = state.bookings.filter(upcoming);

    if ($("#statUpcoming")) {
      $("#statUpcoming").textContent = String(upcomingBookings.length).padStart(
        2,
        "0",
      );
    }

    if ($("#statActive")) {
      $("#statActive").textContent = state.bookings.some(
        (booking) => booking.status === "In Progress",
      )
        ? "01"
        : upcomingBookings.length
          ? "01"
          : "00";
    }

    if ($("#statCompleted")) {
      $("#statCompleted").textContent = String(
        state.bookings.filter((booking) => booking.status === "Completed")
          .length + Math.max(0, state.completed - 1),
      ).padStart(2, "0");
    }

    const next = upcomingBookings[0];

    if (next) {
      if ($("#nextServiceName"))
        $("#nextServiceName").textContent = next.service;
      if ($("#nextVehicleName")) {
        $("#nextVehicleName").textContent = "Vehicle: " + next.vehicle;
      }
      if ($("#nextBookingDate")) {
        $("#nextBookingDate").textContent = dateText(next.date);
      }
      if ($("#nextBookingTime")) $("#nextBookingTime").textContent = next.time;
      if ($("#trackingServiceName")) {
        $("#trackingServiceName").textContent = next.service + " Treatment";
      }
      if ($("#trackingVehicle")) {
        $("#trackingVehicle").textContent = next.vehicle + " · Sample record";
      }
      if ($("#trackingPackage")) {
        $("#trackingPackage").textContent = next.service;
      }
    } else {
      if ($("#nextServiceName")) {
        $("#nextServiceName").textContent = "No upcoming booking";
      }
      if ($("#nextVehicleName")) {
        $("#nextVehicleName").textContent = "Book your next detailing visit";
      }
      if ($("#nextBookingDate")) {
        $("#nextBookingDate").textContent = "Not scheduled";
      }
      if ($("#nextBookingTime")) $("#nextBookingTime").textContent = "—";
    }

    applyTheme(readStorage(THEME_KEY, "light"));
    icons();
  }

  // SIDEBAR NAVIGATION

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => panel(button.dataset.panel));
  });

  $$("[data-open-panel]").forEach((button) => {
    button.addEventListener("click", () => panel(button.dataset.openPanel));
  });

  $("#sidebarCollapseBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });

  $("#mobileMenuBtn")?.addEventListener("click", () => {
    $("#sidebar")?.classList.add("mobile-open");
    $("#sidebarOverlay")?.classList.add("active");
  });

  function closeSidebar() {
    $("#sidebar")?.classList.remove("mobile-open");
    $("#sidebarOverlay")?.classList.remove("active");
  }

  $("#sidebarClose")?.addEventListener("click", closeSidebar);
  $("#sidebarOverlay")?.addEventListener("click", closeSidebar);

  // PROFILE MENU

  $("#profileToggle")?.addEventListener("click", () => {
    $("#profileMenu")?.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".profile-dropdown")) {
      $("#profileMenu")?.classList.remove("active");
    }
  });

  $("#profileLink")?.addEventListener("click", () => panel("profile"));
  $("#dashboardLink")?.addEventListener("click", () => panel("dashboard"));

  // LOGOUT

  function logout() {
    window.location.href = "login.html";
  }

  $("#logoutBtn")?.addEventListener("click", logout);
  $("#profileLogout")?.addEventListener("click", logout);

  // NOTIFICATIONS

  $("#notificationBtn")?.addEventListener("click", () => {
    alert("You are all caught up in this demo portal.");
  });

  // DASHBOARD SEARCH

  $("#dashboardSearch")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const query = event.currentTarget.value.trim().toLowerCase();

    const found = $$(".dashboard-panel").find((item) =>
      item.innerText.toLowerCase().includes(query),
    );

    if (found) {
      panel(found.id.replace("panel-", ""));
    } else {
      alert("No matching content found in the demo portal.");
    }
  });

  // BOOKING DATE

  const dateInput = $("#bookingDate");

  if (dateInput) {
    const now = new Date();

    dateInput.min = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    if (!dateInput.value) dateInput.value = dateInput.min;
  }

  // CREATE BOOKING

  $("#bookingForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!dateInput) return;

    const booking = {
      id: state.nextId++,
      service: $("#bookingService")?.value || "",
      vehicle: $("#bookingVehicle")?.value || "",
      date: dateInput.value,
      time: $("#bookingTime")?.value || "",
      status: "Confirmed",
      notes: $("#bookingNotes")?.value.trim() || "",
    };

    state.bookings.push(booking);
    save();
    render();

    const feedback = $("#bookingFeedback");
    if (feedback) {
      feedback.textContent = `Demo booking saved for ${dateText(booking.date)} at ${booking.time}.`;
    }

    panel("bookings");
  });

  // CANCEL BOOKING / VIEW DETAILS

  $("#bookingTableBody")?.addEventListener("click", (event) => {
    const cancelButton = event.target.closest("[data-cancel]");
    const detailsButton = event.target.closest("[data-details]");

    if (cancelButton) {
      const booking = state.bookings.find(
        (item) => item.id === Number(cancelButton.dataset.cancel),
      );

      if (booking && confirm(`Cancel demo booking for ${booking.service}?`)) {
        booking.status = "Cancelled";
        save();
        render();
      }
    }

    if (detailsButton) {
      const booking = state.bookings.find(
        (item) => item.id === Number(detailsButton.dataset.details),
      );

      if (booking) {
        alert(
          `${booking.service}\nVehicle: ${booking.vehicle}\nDate: ${dateText(booking.date)}\nTime: ${booking.time}\nStatus: ${booking.status}`,
        );
      }
    }
  });

  // REDEEM LOYALTY POINTS

  $("#claimRewardBtn")?.addEventListener("click", () => {
    if (state.points < 500) {
      const feedback = $("#rewardFeedback");
      if (feedback) {
        feedback.textContent =
          "You need at least 500 demo points to try this reward.";
      }
      return;
    }

    state.points -= 500;

    state.history.unshift({
      activity: "Demo reward redemption",
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      points: "-500",
      status: "Demo",
    });

    save();
    render();

    const feedback = $("#rewardFeedback");
    if (feedback) {
      feedback.textContent =
        "Demo reward redeemed. 500 points deducted locally.";
    }
  });

  // ADD VEHICLE

  $("#addVehicleBtn")?.addEventListener("click", () => {
    const name = prompt("Vehicle nickname (e.g. Silver Hatchback):");

    if (!name?.trim()) return;

    state.vehicles.push({
      id: Date.now(),
      name: name.trim(),
      make: prompt("Make / model:", "Demo vehicle") || "Demo vehicle",
      colour: prompt("Vehicle colour:", "Silver") || "Not provided",
      registration: prompt("Registration (optional):", "") || "",
      primary: false,
    });

    save();
    renderVehicles();
  });

  // REMOVE VEHICLE

  $("#vehicleCards")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-vehicle]");
    if (!button) return;

    const id = Number(button.dataset.removeVehicle);
    const vehicle = state.vehicles.find((item) => item.id === id);

    if (
      vehicle &&
      !vehicle.primary &&
      confirm(`Remove ${vehicle.name} from demo vehicles?`)
    ) {
      state.vehicles = state.vehicles.filter((item) => item.id !== id);
      save();
      renderVehicles();
    }
  });

  // SAVE PROFILE

  $("#profileForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    state.name = $("#profileName")?.value.trim() || "Customer";
    state.email = $("#profileEmail")?.value.trim() || "";
    state.phone = $("#profilePhone")?.value.trim() || "";
    state.preference = $("#profilePreference")?.value || "Email";

    save();
    renderProfile();

    const feedback = $("#profileFeedback");
    if (feedback) {
      feedback.textContent = "Demo profile saved in this browser.";
    }
  });

  // RESET DEMO

  $("#resetDemoBtn")?.addEventListener("click", () => {
    if (
      !confirm(
        "Reset all GLOSSVAULT demo bookings, vehicles, profile edits and points?",
      )
    ) {
      return;
    }

    const currentTheme = readStorage(THEME_KEY, "light");
    const currentDirection = readStorage(DIRECTION_KEY, "ltr");

    state = clone(initial);
    state.theme = currentTheme;

    save();
    applyTheme(currentTheme);
    applyDirection(currentDirection);
    render();
    panel("dashboard");

    alert("Demo data reset in this browser.");
  });

  // INITIALIZE DASHBOARD

  applyTheme(readStorage(THEME_KEY, "light"));
  applyDirection(readStorage(DIRECTION_KEY, "ltr"));
  render();

  const hash = window.location.hash.slice(1);

  if (hash && $("#panel-" + hash)) {
    panel(hash);
  }
})();
