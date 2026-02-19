// ---------------------------
// SUBSCRIBE PAGE JS
// ---------------------------

// ---------------------------
// SUBSCRIBE PAGE JS
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {

  const checkoutButton = document.getElementById('checkout-button');

  if (!checkoutButton) {
    console.error("❌ Checkout button not found.");
    return;
  }

  // Initialize Stripe ONCE
  const stripe = Stripe('pk_live_51SmCfSDYXHnYU3nmXlzEgaVmXzXjGr4LvqhqJcgImNnNZubQpGsq9tUy8VgcQeNiJhSSaE9PHYIchyJuvchbd7nk002gEG6wTw');

  const email = "test@example.com"; // TODO: replace with real logged-in user

  try {

    // Call your production API
    const res = await fetch(
      `https://api.deadanglesinstitute.org/api/me?email=${encodeURIComponent(email)}`
    );

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

