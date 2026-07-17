// ---------------------------
// premium-entitlement.js
// ---------------------------

(async function checkEntitlement() {
  try {
    const email = "stripe@example.com"; // TEMP test

    const res = await fetch(`/api/me?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    const buttons = document.querySelectorAll(".subscribe-button");

    buttons.forEach(btn => {
      const filename = btn.dataset.premiumFile;

      if (!data.entitled) {
        // Not entitled → send to subscribe
        btn.onclick = () => {
          window.location.href = "/subscribe/";
        };
      } else {
        // Entitled → open protected file
        btn.onclick = () => {
          window.location.href =
            `/premium/files/${filename}?email=${encodeURIComponent(email)}`;
        };
      }
    });

  } catch (err) {
    console.error("❌ Error fetching /api/me:", err);
  }
})();
