//=============================
// Contact form submission handling
//===============================



document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form form");
  const submitButton = form.querySelector("button");
  const note = form.querySelector(".contact-note");

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // prevent page reload

    // Disable button and show "Sending..."
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Envoi en cours…";

    // Prepare form data
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        submitButton.textContent = "Envoyé ✅";
        note.textContent = "Merci ! Nous avons reçu votre message et vous répondrons sous 48 heures.";
        form.reset();
      } else {
        throw new Error("Erreur réseau, veuillez réessayer.");
      }
    } catch (error) {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      note.textContent = "Oups… quelque chose a mal tourné. Veuillez réessayer.";
      console.error(error);
    }
  });
});