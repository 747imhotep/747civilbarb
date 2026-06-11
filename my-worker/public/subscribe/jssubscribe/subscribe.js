// ---------------------------
// SUBSCRIBE PAGE JS (SESSION AUTH + EMAIL INPUT + FINAL ERROR ABOVE BUTTON)
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {

  const checkoutButton = document.getElementById('checkout-button');

  if (!checkoutButton) {
    console.error("❌ Checkout button not found.");
    return;
  }

  // ---------------------------
  // 1️⃣ Add email input dynamically above checkout button
  // ---------------------------
  let emailInput = document.getElementById('userEmail');
  if (!emailInput) {
    emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'userEmail';
    emailInput.className = 'subscribe-email-input';
    emailInput.placeholder = 'Votre email';
    emailInput.required = true;

    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'userEmail';
    emailLabel.className = 'subscribe-email-label';
    emailLabel.textContent = 'Email pour votre abonnement :';

    // Insert above button
    checkoutButton.parentNode.insertBefore(emailLabel, checkoutButton);
    checkoutButton.parentNode.insertBefore(emailInput, checkoutButton);
  }

  // ---------------------------
  // 2️⃣ Add final error message div (hidden by default)
  // ---------------------------
  let messageDiv = document.getElementById('subscribe-final-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'subscribe-final-message';
    messageDiv.className = 'subscribe-final-message';
    messageDiv.style.display = 'none';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.color = '#d30b83'; // error color
    messageDiv.style.fontWeight = 'bold';
    checkoutButton.parentNode.insertBefore(messageDiv, checkoutButton);
  }

  // ---------------------------
  // 3️⃣ Initialize Stripe
  // ---------------------------
  const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4nqRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');

  // ---------------------------
  // 4️⃣ Check entitlement
  // ---------------------------
  async function checkEntitlement(email) {
    if (!email) return { entitled: false };
    try {
      const res = await fetch(`https://api.deadanglesinstitute.org/api/me?email=${encodeURIComponent(email)}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Impossible de récupérer les droits de l'utilisateur.");
      return await res.json();
    } catch (err) {
      console.error('❌ Error fetching entitlement:', err);
      return { entitled: false };
    }
  }

  // ---------------------------
  // 5️⃣ Checkout button click handler
  // ---------------------------
  checkoutButton.addEventListener('click', async () => {

    // Hide previous message
    messageDiv.style.display = 'none';
    messageDiv.textContent = '';

    const email = emailInput.value.trim();
    if (!email) {
      alert('Veuillez saisir votre email.');
      return;
    }

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Vérification en cours…";

    const entitlement = await checkEntitlement(email);

    if (entitlement.entitled) {
      checkoutButton.textContent = "Vous êtes déjà abonné !";
      checkoutButton.style.cursor = "not-allowed";
      return;
    }

    checkoutButton.textContent = "Création de session…";

    // ---------------------------
    // 6️⃣ Create Stripe Checkout session
    // ---------------------------
    try {
      const sessionRes = await fetch('https://api.deadanglesinstitute.org/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: checkoutButton.dataset.plan, email })
      });

      if (!sessionRes.ok) throw new Error("Erreur création session Stripe.");

      const session = await sessionRes.json();

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) {
        // Show final error above button
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }

    } catch (err) {
      console.error('❌ Stripe Checkout Error:', err);
      // Show final error above button
      messageDiv.textContent = "Impossible de lancer le paiement.";
      messageDiv.style.display = 'block';
      checkoutButton.disabled = false;
      checkoutButton.textContent = "S’abonner";
    }
  });

});
