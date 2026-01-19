// ---------------------------
// premium/endpoint/endpoint.js
// ---------------------------

// STEP 7.3.2 Frontend entitlement check — Premium Page
// ---------------------------

(async function checkEntitlement() {
  try {
    // TEMP: hardcoded email for testing
    const email = "stripe@example.com";

    // Call backend read-only endpoint
    const res = await fetch(`/entitlement?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    console.log("🚀 Entitlement check:", data);

    // Find all subscribe buttons on the page
    const buttons = document.querySelectorAll(".subscribe-button");

    if (data.entitled) {
      // User has premium access — optionally highlight buttons
      buttons.forEach(btn => btn.disabled = false);
    } else {
      // User does NOT have access — disable buttons and change text
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = "Abonnement requis";
        btn.style.backgroundColor = "#999";  // greyed-out
        btn.style.cursor = "not-allowed";
      });
    }
  } catch (err) {
    console.error("❌ Error fetching entitlement:", err);
  }
})();
