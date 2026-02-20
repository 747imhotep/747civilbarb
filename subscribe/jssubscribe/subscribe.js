// ---------------------------
// SUBSCRIBE PAGE JS (SESSION AUTH)
// TEST MODE - USES TEST STRIPE KEY
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {

  const checkoutButton = document.getElementById('checkout-button');

  if (!checkoutButton) {
    console.error("❌ Checkout button not found.");
    return;
  }

  // Initialize Stripe (test key for now)
  const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4nqRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');

  try {
    // Call API to check entitlement via session cookie
    const res = await fetch(
      'https://api.deadanglesinstitute.org/api/me',
      { credentials: 'include' }
    );

    if (!res.ok) {
      throw new Error("Impossible de récupérer les droits de l'utilisateur.");
    }

    const data = await res.json();

    if (data.entitled) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = "Vous êtes déjà abonné !";
      checkoutButton.style.cursor = "not-allowed";
    } else {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "S’abonner";
      checkoutButton.style.cursor = "pointer";

      checkoutButton.addEventListener('click', async () => {
        try {
          const sessionRes = await fetch(
            'https://api.deadanglesinstitute.org/create-checkout-session',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',      // send session cookie
              body: JSON.stringify({ plan: checkoutButton.dataset.plan })
            }
          );

          if (!sessionRes.ok) {
            throw new Error("Erreur création session Stripe.");
          }

          const session = await sessionRes.json();

          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
          });

          if (error) {
            alert(error.message);
          }

        } catch (err) {
          console.error('❌ Stripe Checkout Error:', err);
          alert("Impossible de lancer le paiement.");
        }
      });
    }

  } catch (err) {
    console.error('❌ Error fetching entitlement:', err);

    // Safe fallback
    checkoutButton.disabled = false;
    checkoutButton.textContent = "S’abonner";
  }

});
