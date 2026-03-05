// ==================================
//   Civilisation ou Barbarie
//   shared/gdpr.js
//   RGPD-strict consent logic + slide-in + fade-out
// ==================================

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("gdpr-banner");
  const acceptBtn = document.getElementById("gdpr-accept");
  const refuseBtn = document.getElementById("gdpr-refuse");

  if (!banner || !acceptBtn || !refuseBtn) {
    console.warn("GDPR banner elements not found.");
    return;
  }

  const consent = localStorage.getItem("gdprConsent");

  // If already decided, hide banner
  if (consent === "accepted" || consent === "refused") {
    banner.remove();
    return;
  }

  // ---------- Slide-in animation ----------
  setTimeout(() => {
    banner.classList.add("active");
  }, 300); // léger délai pour smooth

  // ---------- Fade-out function ----------
  function fadeOutBanner() {
    banner.style.transition = "opacity 10s ease, transform 1s ease";
    banner.style.opacity = "0";
    banner.style.transform = "translateX(-50%) translateY(50px)";
    setTimeout(() => {
      banner.style.display = "none";
    }, 7000); // correspond à 10s fade-out
  }

  // ---------- Click handlers ----------
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("gdprConsent", "accepted");

    fadeOutBanner();

    // 👉 Enable optional services here
    // enableAnalytics();
    // enableThirdPartyEmbeds();
  });

  refuseBtn.addEventListener("click", () => {
    localStorage.setItem("gdprConsent", "refused");

    fadeOutBanner();

    // 👉 Make sure optional services stay OFF
  });
});