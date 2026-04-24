/* ==================================
   load-navbar.js
   - Dynamically load navbar (FR / EN)
   - Initialize navbar logic after load
================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    const path = window.location.pathname;
    let navbarFile = "/navbar/navbar-en.html";

    if (path.startsWith("/fr/") || path === "/fr") {
      navbarFile = "/navbar/navbar-fr.html";
    }

    const response = await fetch(navbarFile);
    const navbarHTML = await response.text();
    placeholder.innerHTML = navbarHTML;

    const script = document.createElement("script");
    script.src = "/navbar/jsnavbar/navbar.js";

    script.onload = () => {
      if (typeof initNavbar === "function") {
        initNavbar();
      }
    };

    document.body.appendChild(script);
  } catch (err) {
    console.error("Failed to load navbar:", err);
  }
});