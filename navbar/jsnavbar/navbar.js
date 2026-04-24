/* ==================================
   Navbar JS (FINAL — robust version)
   - mobile toggle
   - active page highlight (exact + section fallback)
   - multilingual support (/fr/, /en/)
   - safe for dynamically loaded navbar
================================== */

function initNavbar() {
  const toggle = document.querySelector(".nav-toggle");
  const linksContainer = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-link");

  if (!toggle || !linksContainer || links.length === 0) return;

  // Mobile toggle — add/remove "show" class
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    linksContainer.classList.toggle("show");
  });

  // Close menu when link is clicked (mobile UX)
  links.forEach(link => {
    link.addEventListener("click", () => {
      linksContainer.classList.remove("show");
    });
  });

  function normalizePath(path) {
    const url = new URL(path, window.location.origin);
    return url.pathname.replace(/\/$/, "") || "/";
  }

  const currentPath = normalizePath(window.location.pathname);
  const pathParts = currentPath.split("/");
  const currentLang = pathParts[1] || "";
  const currentSection = pathParts[2] || "";

  links.forEach(link => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");

    const linkPath = normalizePath(link.pathname);
    const linkParts = linkPath.split("/");
    const linkLang = linkParts[1] || "";
    const linkSection = linkParts[2] || "";

    const isSameLang = linkLang === currentLang;
    const isExactMatch = linkPath === currentPath;
    const isSectionMatch = isSameLang && linkSection && linkSection === currentSection;

    if (isExactMatch || isSectionMatch) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

// Auto-initialize when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}

/* ==================================
   End Navbar JS
================================== */