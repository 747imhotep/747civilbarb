// :::::::::::::::::::::::::::::::::::::::
// Lazy load Sender form on button click
// - Waits for DOMContentLoaded
// - Loads form only when user clicks button
// - Prevents unnecessary load on initial page load
// :::::::::::::::::::::::::::::::::::::::


document.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("openAccessForm");
  const container = document.getElementById("sender-form-container");

  if (!btn || !container) return;

  btn.addEventListener("click", function () {

    container.style.display = "block";
    container.scrollIntoView({ behavior: "smooth" });

    // Load Sender script ONLY once
    if (container.dataset.loaded === "true") return;
    container.dataset.loaded = "true";

    const script = document.createElement("script");
    script.src = "https://cdn.sender.net/YOUR_SENDER_SCRIPT.js";
    script.async = true;

    document.body.appendChild(script);
  });

});