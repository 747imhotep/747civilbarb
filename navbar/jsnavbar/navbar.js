/* ==================================
   Navbar JS (FINAL — robust version)
   - mobile toggle
   - active page highlight (exact + section fallback)
   - multilingual support (/fr/, /en/)
   - safe for dynamically loaded navbar
================================== */

function initNavbar() {

  // ---------------------------
  // DOM references
  // ---------------------------
  const toggle = document.querySelector(".nav-toggle");
  const linksContainer = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-link");

  // If navbar not yet in DOM, stop safely
  if (!toggle || !linksContainer || links.length === 0) return;

  // ---------------------------
  // Mobile menu toggle
  // ---------------------------
  toggle.addEventListener("click", () => {
    linksContainer.classList.toggle("active");
  });

  // Close menu when any link is clicked (mobile UX)
  links.forEach(link => {
    link.addEventListener("click", () => {
      linksContainer.classList.remove("active");
    });
  });

  // ---------------------------
  // Helper: normalize paths
  // - removes trailing slash
  // - ensures consistent comparison
  // ---------------------------
  function normalizePath(path) {
    const url = new URL(path, window.location.origin);
    return url.pathname.replace(/\/$/, "") || "/";
  }

  // ---------------------------
  // Current page info
  // ---------------------------
  const currentPath = normalizePath(window.location.pathname);

  // Example:
  // "/fr/library/book1" → ["", "fr", "library", "book1"]
  const pathParts = currentPath.split("/");

  const currentLang = pathParts[1] || "";     // "fr" or "en"
  const currentSection = pathParts[2] || "";  // "library", "about", etc.

  // ---------------------------
  // Reset any previous active states
  // (important if navbar re-initializes)
  // ---------------------------
  links.forEach(link => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  // ---------------------------
  // Active link detection logic
  // Priority:
  // 1. Exact match (best)
  // 2. Section match within SAME language
  // ---------------------------
  links.forEach(link => {

    const linkPath = normalizePath(link.pathname);
    const linkParts = linkPath.split("/");

    const linkLang = linkParts[1] || "";
    const linkSection = linkParts[2] || "";

    const isSameLang = linkLang === currentLang;

    const isExactMatch = linkPath === currentPath;

    const isSectionMatch =
      isSameLang &&
      linkSection &&
      linkSection === currentSection;

    if (isExactMatch || isSectionMatch) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

  });
}

/* ==================================
   INIT HANDLING
================================== */

// Case 1: Static navbar (already in DOM)
document.addEventListener("DOMContentLoaded", initNavbar);

// Case 2: If you dynamically inject navbar,
// call initNavbar() manually AFTER insertion:
//
 fetch("/navbar.html")
   .then(res => res.text())
   .then(html => {
     document.body.insertAdjacentHTML("afterbegin", html);
     initNavbar(); // REQUIRED after injection
   });

/* ==================================
   End Navbar JS
================================== */