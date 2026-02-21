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

  if (!toggle || !links) return; // Important for dynamic load

  // Mobile toggle
  toggle.addEventListener("click", () => {
    links.classList.toggle("active"); // Use ONE class only
  });

  // Close menu when link clicked
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      links.classList.remove("active");
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

    if (linkPath === currentPath || currentSection === linkSection) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}
  
/* ==================================
   End navbar JS
================================== */
