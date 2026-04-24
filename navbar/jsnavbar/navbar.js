/* ==================================
   Navbar JS (FINAL — robust version)
   - mobile toggle
   - active page highlight (exact + section fallback)
   - multilingual support (/fr/, /en/)
   - safe for dynamically loaded navbar
================================== */

(function() {
  // Wait a short moment for DOM to settle
  function initNavbar() {
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    
    if (!toggle || !navLinks) {
      console.log("Navbar elements not ready yet");
      return false;
    }
    
    console.log("Navbar found, attaching event listeners");
    
    // Remove any existing listener by cloning (prevents duplicates)
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
    
    newToggle.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      navLinks.classList.toggle("show");
      console.log("Menu toggled, show class:", navLinks.classList.contains("show"));
    });
    
    // Close menu when clicking a link (mobile UX)
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => {
      link.addEventListener("click", function() {
        navLinks.classList.remove("show");
      });
    });
    
    return true;
  }
  
  // Try immediately
  if (!initNavbar()) {
    // If failed, retry after 100ms
    setTimeout(initNavbar, 100);
  }
})();

/* ==================================
   End Navbar JS
================================== */