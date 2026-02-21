// ---------------------------
// SUBSCRIBE PAGE JS (SESSION AUTH + EMAIL INPUT + STYLED MESSAGES)
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {

  const checkoutButton = document.getElementById('checkout-button');
  const messageEl = document.getElementById('subscribe-message');

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

    checkoutButton.parentNode.insertBefore(emailLabel, checkoutButton);
    checkoutButton.parentNode.insertBefore(emailInput, checkoutButton);
  }

  // ---------------------------
  // 2️⃣ Initialize Stripe
  // ---------------------------
  const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4nqRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');

  // ---------------------------
  // 3️⃣ Message helper
  // ---------------------------
  function showMessage(text, type = 'error') {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'subscribe-message show';
    messageEl.classList.remove('error', 'success', 'info');
    messageEl.classList.add(type);
  }

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

    const email = emailInput.value.trim();
    if (!email) {
      showMessage('Veuillez saisir votre email.', 'error');
      return;
    }

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Vérification en cours…";
    showMessage('Vérification des droits en cours...', 'info');

    const entitlement = await checkEntitlement(email);

    if (entitlement.entitled) {
      checkoutButton.textContent = "Vous êtes déjà abonné !";
      checkoutButton.style.cursor = "not-allowed";
      showMessage('Vous êtes déjà abonné à ce plan.', 'success');
      return;
    }

    checkoutButton.textContent = "Création de session…";
    showMessage('Création de session Stripe...', 'info');

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
      if (error) showMessage(error.message, 'error');

    } catch (err) {
      console.error('❌ Stripe Checkout Error:', err);
      showMessage("Impossible de lancer le paiement.", 'error');
      checkoutButton.disabled = false;
      checkoutButton.textContent = "S’abonner";
    }
  });

});
