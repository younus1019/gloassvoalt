/* =========================================
   HOME 2 — INTERACTIVE FINISH SELECTOR
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".gv2-finish");

  if (!section || section.dataset.initialized === "true") return;
  section.dataset.initialized = "true";

  const options = section.querySelectorAll(".gv2-finish__option");
  const image = section.querySelector(".gv2-finish__image");
  const panel = section.querySelector(".gv2-finish__visual");
  const title = section.querySelector("[data-finish-title]");
  const description = section.querySelector("[data-finish-description]");
  const eyebrow = section.querySelector(".gv2-finish__eyebrow");
  const caption = section.querySelector("[data-finish-caption]");
  const index = section.querySelector(".gv2-finish__visual-index");

  const finishes = {
    restore: {
      image: "./images/home2-finish-restore.jpg",
      alt: "Paint correction on a luxury vehicle",
      eyebrow: "THE RESTORATION EDIT",
      title: "Bring Back<br>the Brilliance.",
      description:
        "Refine the paintwork, reduce visible imperfections and reveal a deeper, cleaner finish.",
      caption: "PAINT CORRECTION",
      index: "GV / 01",
    },
    protect: {
      image: "./images/home2-finish-protect.jpg",
      alt: "Protective film being carefully applied to a vehicle",
      eyebrow: "THE PROTECTION EDIT",
      title: "Preserve<br>Every Curve.",
      description:
        "Explore paint protection solutions designed to help defend your vehicle's finish against everyday wear.",
      caption: "PAINT PROTECTION",
      index: "GV / 02",
    },
    refine: {
      image: "./images/home2-finish-refine.jpg",
      alt: "Detailed luxury car interior with carefully finished surfaces",
      eyebrow: "THE DETAILING EDIT",
      title: "Perfect<br>Every Detail.",
      description:
        "Give exterior surfaces and interior details the considered care that makes the entire vehicle feel renewed.",
      caption: "PRECISION DETAILING",
      index: "GV / 03",
    },
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const selected = finishes[option.dataset.finish];
      if (!selected) return;

      options.forEach((item) => {
        const active = item === option;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      panel.style.opacity = "0.65";

      const nextImage = new Image();

      nextImage.onload = () => {
        image.src = selected.image;
        image.alt = selected.alt;
        title.innerHTML = selected.title;
        description.textContent = selected.description;
        eyebrow.textContent = selected.eyebrow;
        caption.textContent = selected.caption;
        index.textContent = selected.index;
        panel.style.opacity = "1";

        if (window.lucide) {
          window.lucide.createIcons();
        }
      };

      nextImage.onerror = () => {
        panel.style.opacity = "1";
        console.error(
          "GLOSSVAULT finish image could not be loaded:",
          selected.image,
        );
      };

      nextImage.src = selected.image;
    });
  });
});
