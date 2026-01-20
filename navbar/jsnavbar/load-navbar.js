/* ==================================
   load-navbar.js
   - Dynamically load navbar HTML
   - Initialize navbar logic after script is loaded
   - initNavbar() is only called after the script 
   is loaded, so the function exists.
================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    // 1️⃣ Fetch and insert navbar HTML
    const response = await fetch("/navbar/navbar.html");
    const navbarHTML = await response.text();
    placeholder.innerHTML = navbarHTML;

    // 2️⃣ Load navbar.js dynamically
    const script = document.createElement("script");
    script.src = "/navbar/jsnavbar/navbar.js";

    // 3️⃣ Initialize navbar AFTER script loads
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
