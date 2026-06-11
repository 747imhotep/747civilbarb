// ---------------------------
// premium/endpoint/endpoint.js
// ---------------------------

// STEP 7.3.2 Frontend entitlement check — Premium Page
// ---------------------------

(async function checkEntitlement() {
  try {
    const email = "stripe@example.com"; // TODO: replace with actual logged-in user

    const res = await fetch(`/api/me?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    console.log("🚀 /api/me response:", data);

    const buttons = document.querySelectorAll(".subscribe-button");

    if (data.entitled) {
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.cursor = "pointer";
      });
    } else {
      buttons.forEach(btn => {
        btn.disabled = false; // keep clickable
        btn.textContent = "Abonnement requis";
        btn.classList.add("disabled-button"); // define in CSS
        btn.addEventListener('click', () => {
          window.location.href = '/subscribe/';
        });
      });
    }
  } catch (err) {
    console.error("❌ Error fetching /api/me:", err);
  }
})();

