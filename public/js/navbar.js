/* ==================================
   navbar.js
   - mobile toggle
   - active page highlight
================================== */

function initNavbar() {
  // ---------------------------
  // Mobile menu toggle
  // ---------------------------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("show");
    });
  }

  // ---------------------------
  // Close mobile menu on link click
  // ---------------------------
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      links.classList.remove("show");
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

    if (linkPath === currentPath || (currentSection && currentSection === linkSection)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}
