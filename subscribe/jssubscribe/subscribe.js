// ---------------------------
// SUBSCRIBE PAGE JS (SESSION AUTH + EMAIL INPUT)
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
  if (!document.getElementById('userEmail')) {
    const emailInput = document.createElement('input');
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

  const emailInput = document.getElementById('userEmail');

  // ---------------------------
  // 2️⃣ Initialize Stripe
  // ---------------------------
  const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4nqRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');

  // ---------------------------
  // 3️⃣ Check entitlement
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
  // 4️⃣ Checkout button click handler
  // ---------------------------
  checkoutButton.addEventListener('click', async () => {

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
    // 5️⃣ Create Stripe Checkout session
    // ---------------------------
    try {
      const sessionRes = await fetch(
        'https://api.deadanglesinstitute.org/create-checkout-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ plan: checkoutButton.dataset.plan, email })
        }
      );

      if (!sessionRes.ok) throw new Error("Erreur création session Stripe.");

      const session = await sessionRes.json();

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) alert(error.message);

    } catch (err) {
      console.error('❌ Stripe Checkout Error:', err);
      alert("Impossible de lancer le paiement.");
      checkoutButton.disabled = false;
      checkoutButton.textContent = "S’abonner";
    }
  });

});
