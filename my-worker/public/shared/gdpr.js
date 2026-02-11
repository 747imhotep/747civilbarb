// ==================================
//   Civilisation ou Barbarie
//   my-worker/shared/gdpr.js
//   RGPD-strict consent logic
// ==================================

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("gdpr-banner");
  const acceptBtn = document.getElementById("gdpr-accept");
  const refuseBtn = document.getElementById("gdpr-refuse");

  if (!banner || !acceptBtn || !refuseBtn) {
    console.warn("GDPR banner elements not found.");
    return;
  } else {
    const consent = localStorage.getItem("gdprConsent");

    // If already decided, hide banner
    if (consent === "accepted" || consent === "refused") {
      banner.remove();
      return;
    }

    acceptBtn.addEventListener("click", () => {
      localStorage.setItem("gdprConsent", "accepted");
      banner.remove();

      // 👉 Enable optional services here
      // enableAnalytics();
      // enableThirdPartyEmbeds();
    });

    refuseBtn.addEventListener("click", () => {
      localStorage.setItem("gdprConsent", "refused");
      banner.remove();

      // 👉 Make sure optional services stay OFF
    });
  }
});

// End of GDPR Banner Logic
