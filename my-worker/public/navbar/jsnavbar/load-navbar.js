// ==================================
// load-navbar.js
// Dynamically loads navbar.html at top of <body>
// Then loads navbar.js (behavior)
// my-worker/public/navbar/jsnavbar/load-navbar.js
// ==================================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch navbar HTML
    const response = await fetch("/navbar/navbar.html");
    if (!response.ok) throw new Error("Navbar HTML not found");

    const navbarHTML = await response.text();

    // Insert at top of <body>
    const body = document.querySelector("body");
    if (!body) throw new Error("<body> not found");
    body.insertAdjacentHTML("afterbegin", navbarHTML);

    // Load navbar behavior script
    const script = document.createElement("script");
    script.src = "/navbar/jsnavbar/navbar.js";
    script.defer = true;
    document.body.appendChild(script);

  } catch (err) {
    console.error("❌ Failed to load navbar:", err);
  }
});
