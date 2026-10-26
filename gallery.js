document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gv-gallery-collection");

  if (!gallery || gallery.dataset.filtersInitialized === "true") return;

  gallery.dataset.filtersInitialized = "true";

  const buttons = gallery.querySelectorAll(".gv-gallery-filter");
  const items = gallery.querySelectorAll(".gv-gallery-item");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      buttons.forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      items.forEach((item) => {
        const matches =
          selectedFilter === "all" || item.dataset.category === selectedFilter;

        item.hidden = !matches;
      });
    });
  });
});
