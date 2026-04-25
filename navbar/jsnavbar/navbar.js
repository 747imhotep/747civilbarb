/* ==================================
   Navbar JS (FINAL — robust version)
   - mobile toggle
   - active page highlight (exact + section fallback)
   - multilingual support (/fr/, /en/)
   - safe for dynamically loaded navbar
================================== */

(function() {
  let attempts = 0;
  const maxAttempts = 20;
  
  function initNavbar() {
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    
    if (!toggle || !navLinks) {
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Waiting for navbar elements (attempt ${attempts})...`);
        setTimeout(initNavbar, 100);
      }
      return;
    }
    
    console.log("Navbar found, attaching event listeners");
    
    // Remove existing listeners by cloning
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
    
    newToggle.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      navLinks.classList.toggle("show");
    });
    
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => {
      link.addEventListener("click", function() {
        navLinks.classList.remove("show");
      });
    });
  }
  
  // Start after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
  } else {
    initNavbar();
  }
})();

/* ==================================
   End Navbar JS
================================== */