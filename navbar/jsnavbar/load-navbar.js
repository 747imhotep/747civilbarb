/* ==================================
   load-navbar.js
   - Dynamically load navbar (FR / EN)
   - Initialize navbar logic after load
================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    // 1️⃣ Detect language from URL
    const path = window.location.pathname;
    let navbarFile = "/navbar/navbar-en.html";

    if (path.startsWith("/fr/") || path === "/fr") {
      navbarFile = "/navbar/navbar-fr.html";
    }

    // 2️⃣ Fetch and insert correct navbar
    const response = await fetch(navbarFile);
    const navbarHTML = await response.text();
    placeholder.innerHTML = navbarHTML;

    // 3️⃣ Load navbar.js dynamically
    const script = document.createElement("script");
    script.src = "/navbar/jsnavbar/navbar.js";

    // 4️⃣ Initialize AFTER script loads
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