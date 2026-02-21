/* ==================================
   navbar JS
   - mobile toggle
   - active page highlight
   - works with dynamically loaded navbar
================================== */

function initNavbar() {
  // ---------------------------
  // Mobile menu toggle
  // ---------------------------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  toggle.addEventListener('click', () => {
  links.classList.toggle('active');
});

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("show");
    });
  }

  // ---------------------------
  // Close mobile menu when a link is clicked
  // ---------------------------
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      if (links.classList.contains("show")) links.classList.remove("show");
    });
  });

  // ---------------------------
  // Active link detection
  // ---------------------------
  function normalizePath(path) {
    const a = document.createElement("a");
    a.href = path;
    return a.pathname.replace(/\/$/, "") || "/";
  }

  const currentPath = normalizePath(window.location.href);
  const currentSection = currentPath.split("/")[1];

  document.querySelectorAll(".nav-link").forEach(link => {
    const linkPath = normalizePath(link.href);
    const linkSection = linkPath.split("/")[1];

    // Exact match
    if (linkPath === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
      return;
    }

    // Parent section highlight (for subpages)
    if (currentSection && linkSection && currentSection === linkSection) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ==================================
   End navbar JS
================================== */
