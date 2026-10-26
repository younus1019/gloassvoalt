/* GLOSSVAULT customer portal — frontend demo only. */
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const KEY = "glossvaultPortalDemoV1";

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

  const clone = (x) => JSON.parse(JSON.stringify(x));

  let state = load();

  function load() {
    try {
      return {
        ...clone(initial),
        ...JSON.parse(localStorage.getItem(KEY) || "{}"),
      };
    } catch {
      return clone(initial);
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const dateText = (s) => {
    if (!s) return "Not set";

    const d = new Date(s + "T12:00:00");

    return isNaN(d)
      ? s
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const upcoming = (b) =>
    b.status !== "Cancelled" &&
    b.status !== "Completed" &&
    b.date >= new Date().toISOString().slice(0, 10);

  const initials = (s) =>
    s
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0].toUpperCase())
      .join("") || "GV";

  function icons() {
    if (window.lucide) lucide.createIcons();
  }

  // Dashboard panel navigation
  function panel(name) {
    const target = $("#panel-" + name);
    if (!target) return;

    $$(".dashboard-panel").forEach((p) =>
      p.classList.toggle("active", p === target),
    );

    $$(".nav-item").forEach((n) =>
      n.classList.toggle("active", n.dataset.panel === name),
    );

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

  // Customer profile
  function renderProfile() {
    const name = state.name || "Customer";

    $$(".sidebar-client-info h4,.profile-trigger > span").forEach(
      (el) => (el.textContent = name),
    );

    $$(".sidebar-client-avatar span,.profile-avatar").forEach(
      (el) => (el.textContent = initials(name)),
    );

    if ($("#profileName")) $("#profileName").value = name;
    if ($("#profileEmail")) $("#profileEmail").value = state.email || "";
    if ($("#profilePhone")) $("#profilePhone").value = state.phone || "";
    if ($("#profilePreference")) {
      $("#profilePreference").value = state.preference || "Email";
    }
  }

  // Bookings table
  function renderBookings() {
    const body = $("#bookingTableBody");
    if (!body) return;

    const list = [...state.bookings].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    body.innerHTML = list.length
      ? list
          .map(
            (b) => `
        <tr>
          <td>${esc(b.service)}</td>
          <td>${esc(b.vehicle)}</td>
          <td>
            ${esc(dateText(b.date))}
            <br>
            <small>${esc(b.time)}</small>
          </td>
          <td>
            <span class="table-status ${
              b.status === "Completed"
                ? "completed"
                : b.status === "Cancelled"
                  ? "cancelled"
                  : "confirmed"
            }">
              ${esc(b.status)}
            </span>
          </td>
          <td>
            ${
              b.status === "Confirmed" && upcoming(b)
                ? `<button class="table-action"
                    data-cancel="${b.id}" type="button">
                    Cancel
                  </button>`
                : `<button class="table-action"
                    data-details="${b.id}" type="button">
                    Details
                  </button>`
            }
          </td>
        </tr>
      `,
          )
          .join("")
      : `<tr>
          <td colspan="5">
            No bookings yet. Create your first demo appointment.
          </td>
        </tr>`;
  }

  // Vehicle cards
  function renderVehicles() {
    const box = $("#vehicleCards");
    if (!box) return;

    box.innerHTML = state.vehicles
      .map(
        (v) => `
      <article class="dashboard-card vehicle-card">
        <div class="card-header">
          <h3>${esc(v.name)}</h3>
          <span class="status-badge ${v.primary ? "confirmed-status" : ""}">
            ${v.primary ? "Primary" : "Vehicle"}
          </span>
        </div>

        <div class="vehicle-illustration">
          <i data-lucide="car-front"></i>
        </div>

        <div class="detail-list">
          <div class="detail-row">
            <span>Make / model</span>
            <strong>${esc(v.make || "Not provided")}</strong>
          </div>
          <div class="detail-row">
            <span>Colour</span>
            <strong>${esc(v.colour || "Not provided")}</strong>
          </div>
          <div class="detail-row">
            <span>Registration</span>
            <strong>${esc(v.registration || "Not provided")}</strong>
          </div>
        </div>

        <button
          class="secondary-btn"
          data-remove-vehicle="${v.id}"
          type="button"
          style="margin-top:14px"
          ${v.primary ? "disabled" : ""}
        >
          ${v.primary ? "Primary Vehicle" : "Remove Demo Vehicle"}
        </button>
      </article>
    `,
      )
      .join("");

    icons();
  }

  // Loyalty points
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
          (h) => `
          <tr>
            <td>${esc(h.activity)}</td>
            <td>${esc(h.date)}</td>
            <td>${esc(h.points)}</td>
            <td>
              <span class="table-status completed">
                ${esc(h.status)}
              </span>
            </td>
          </tr>
        `,
        )
        .join("");
    }
  }

  // Render complete dashboard
  function render() {
    renderProfile();
    renderBookings();
    renderVehicles();
    renderPoints();

    const up = state.bookings.filter(upcoming);

    if ($("#statUpcoming")) {
      $("#statUpcoming").textContent = String(up.length).padStart(2, "0");
    }

    if ($("#statActive")) {
      $("#statActive").textContent = state.bookings.some(
        (b) => b.status === "In Progress",
      )
        ? "01"
        : up.length
          ? "01"
          : "00";
    }

    if ($("#statCompleted")) {
      $("#statCompleted").textContent = String(
        state.bookings.filter((b) => b.status === "Completed").length +
          Math.max(0, state.completed - 1),
      ).padStart(2, "0");
    }

    const next = up[0];

    if (next) {
      $("#nextServiceName").textContent = next.service;
      $("#nextVehicleName").textContent = "Vehicle: " + next.vehicle;
      $("#nextBookingDate").textContent = dateText(next.date);
      $("#nextBookingTime").textContent = next.time;
      $("#trackingServiceName").textContent = next.service + " Treatment";
      $("#trackingVehicle").textContent = next.vehicle + " · Sample record";
      $("#trackingPackage").textContent = next.service;
    } else {
      $("#nextServiceName").textContent = "No upcoming booking";
      $("#nextVehicleName").textContent = "Book your next detailing visit";
      $("#nextBookingDate").textContent = "Not scheduled";
      $("#nextBookingTime").textContent = "—";
    }

    document.body.classList.toggle("dark-mode", state.theme === "dark");

    icons();
  }

  // Sidebar navigation
  $$(".nav-item").forEach((b) =>
    b.addEventListener("click", () => panel(b.dataset.panel)),
  );

  $$("[data-open-panel]").forEach((b) =>
    b.addEventListener("click", () => panel(b.dataset.openPanel)),
  );

  $("#sidebarCollapseBtn")?.addEventListener("click", () =>
    document.body.classList.toggle("sidebar-collapsed"),
  );

  $("#mobileMenuBtn")?.addEventListener("click", () => {
    $("#sidebar").classList.add("mobile-open");
    $("#sidebarOverlay").classList.add("active");
  });

  function closeSidebar() {
    $("#sidebar")?.classList.remove("mobile-open");
    $("#sidebarOverlay")?.classList.remove("active");
  }

  $("#sidebarClose")?.addEventListener("click", closeSidebar);
  $("#sidebarOverlay")?.addEventListener("click", closeSidebar);

  // Dark mode
  function theme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    save();
    render();
  }

  $("#themeToggle")?.addEventListener("click", theme);
  $("#settingsThemeBtn")?.addEventListener("click", theme);

  // RTL mode
  $("#rtlToggle")?.addEventListener("click", () => {
    document.documentElement.dir =
      document.documentElement.dir === "rtl" ? "ltr" : "rtl";

    localStorage.setItem("gvPortalDir", document.documentElement.dir);
  });

  if (localStorage.getItem("gvPortalDir")) {
    document.documentElement.dir = localStorage.getItem("gvPortalDir");
  }

  // Profile menu
  $("#profileToggle")?.addEventListener("click", () =>
    $("#profileMenu")?.classList.toggle("active"),
  );

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-dropdown")) {
      $("#profileMenu")?.classList.remove("active");
    }
  });

  $("#profileLink")?.addEventListener("click", () => panel("profile"));

  $("#dashboardLink")?.addEventListener("click", () => panel("dashboard"));

  const logout = () =>
    alert(
      "Frontend demo only: secure sign-out requires authentication to be connected.",
    );

  $("#logoutBtn")?.addEventListener("click", logout);
  $("#profileLogout")?.addEventListener("click", logout);

  $("#notificationBtn")?.addEventListener("click", () =>
    alert("You are all caught up in this demo portal."),
  );

  // Dashboard search
  $("#dashboardSearch")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const q = e.currentTarget.value.trim().toLowerCase();

    const found = $$(".dashboard-panel").find((p) =>
      p.innerText.toLowerCase().includes(q),
    );

    if (found) {
      panel(found.id.replace("panel-", ""));
    } else {
      alert("No matching content found in the demo portal.");
    }
  });

  // Booking date
  const date = $("#bookingDate");

  if (date) {
    const now = new Date();

    date.min = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    if (!date.value) date.value = date.min;
  }

  // New booking
  $("#bookingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const booking = {
      id: state.nextId++,
      service: $("#bookingService").value,
      vehicle: $("#bookingVehicle").value,
      date: date.value,
      time: $("#bookingTime").value,
      status: "Confirmed",
      notes: $("#bookingNotes").value.trim(),
    };

    state.bookings.push(booking);
    save();
    render();

    $("#bookingFeedback").textContent =
      `Demo booking saved for ${dateText(booking.date)} at ${booking.time}.`;

    panel("bookings");
  });

  // Cancel booking / View details
  $("#bookingTableBody")?.addEventListener("click", (e) => {
    const cancel = e.target.closest("[data-cancel]");
    const details = e.target.closest("[data-details]");

    if (cancel) {
      const b = state.bookings.find(
        (x) => x.id === Number(cancel.dataset.cancel),
      );

      if (b && confirm(`Cancel demo booking for ${b.service}?`)) {
        b.status = "Cancelled";
        save();
        render();
      }
    }

    if (details) {
      const b = state.bookings.find(
        (x) => x.id === Number(details.dataset.details),
      );

      if (b) {
        alert(
          `${b.service}\nVehicle: ${b.vehicle}\nDate: ${dateText(b.date)}\nTime: ${b.time}\nStatus: ${b.status}`,
        );
      }
    }
  });

  // Redeem loyalty points
  $("#claimRewardBtn")?.addEventListener("click", () => {
    if (state.points < 500) {
      $("#rewardFeedback").textContent =
        "You need at least 500 demo points to try this reward.";
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

    $("#rewardFeedback").textContent =
      "Demo reward redeemed. 500 points deducted locally.";
  });

  // Add vehicle
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

  // Remove vehicle
  $("#vehicleCards")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-remove-vehicle]");
    if (!b) return;

    const id = Number(b.dataset.removeVehicle);
    const v = state.vehicles.find((x) => x.id === id);

    if (v && !v.primary && confirm(`Remove ${v.name} from demo vehicles?`)) {
      state.vehicles = state.vehicles.filter((x) => x.id !== id);
      save();
      renderVehicles();
    }
  });

  // Save profile
  $("#profileForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    state.name = $("#profileName").value.trim() || "Customer";
    state.email = $("#profileEmail").value.trim();
    state.phone = $("#profilePhone").value.trim();
    state.preference = $("#profilePreference").value;

    save();
    renderProfile();

    $("#profileFeedback").textContent = "Demo profile saved in this browser.";
  });

  // Reset demo
  $("#resetDemoBtn")?.addEventListener("click", () => {
    if (
      !confirm(
        "Reset all GLOSSVAULT demo bookings, vehicles, profile edits and points?",
      )
    )
      return;

    state = clone(initial);
    save();
    render();
    panel("dashboard");

    alert("Demo data reset in this browser.");
  });

  // Initialize dashboard
  render();

  const hash = location.hash.slice(1);

  if (hash && $("#panel-" + hash)) {
    panel(hash);
  }
})();
