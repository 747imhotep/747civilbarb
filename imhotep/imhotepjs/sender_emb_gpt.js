// ======================================
// civilisationoubarbarie.org
// sender_emb.js
// Dead Angle Institute
// Comment Modal + Sender API integration
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("cmt-modal");
  const openBtn = document.getElementById("open-cmt-modal");
  const closeBtn = document.getElementById("cmt-close");
  const form = document.getElementById("cmtForm");

  const cleInput = document.getElementById("cle");
  const honey = document.querySelector("input[name='_honey']");

  const API_URL = "https://api.sender.net/v2/subscribers";
  const API_TOKEN = "YOUR_SENDER_API_TOKEN"; // ⚠️ replace later with backend

  // ==============================
  //      1️⃣  OPEN MODAL
  // ==============================

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.add("active");

      // dynamic clé if available
      if (window.currentKeyId) {
        cleInput.value = window.currentKeyId;
      }
    });
  }

  // ==============================
  //   2️⃣  CLOSE MODAL
  // ==============================

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // ==============================
  //   3️⃣ SUBMIT FORM
  // ==============================

  if (form) {

    form.addEventListener("submit", async (e) => {

      e.preventDefault();

      // honeypot spam protection
      if (honey && honey.value !== "") {
        console.warn("Spam detected (honeypot)");
        return;
      }

      const formData = new FormData(form);

      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");
      const cle = formData.get("cle");

      const payload = {
        email: email,
        firstname: name,
        fields: {
          imhotep_key: cle,
          comment: message,
          source_page: window.location.href
        }
      };

      try {

        const response = await fetch(API_URL, {

          method: "POST",

          headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)

        });

        if (!response.ok) {
          throw new Error("Sender API error");
        }

        alert("Merci ! Votre message a été envoyé.");

        form.reset();
        modal.classList.remove("active");

      } catch (error) {

        console.error("Submission error:", error);
        alert("Erreur lors de l'envoi. Veuillez réessayer.");

      }

    });

  }

});
  // ==== 4️⃣ END ====