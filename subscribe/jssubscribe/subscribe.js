// ---------------------------
// SUBSCRIBE PAGE JS
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const checkoutButton = document.getElementById('checkout-button');

  const email = "test@example.com"; // replace with logged-in user

  try {
    const res = await fetch(`/entitlement?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.entitled) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = "Vous êtes déjà abonné !";
    } else {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "S’abonner";

      checkoutButton.addEventListener('click', async () => {
        try {
          const sessionRes = await fetch('https://api.deadanglesinstitute.org/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: checkoutButton.dataset.plan })
          });
          const session = await sessionRes.json();
          const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4qRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (error) alert(error.message);
        } catch (err) {
          console.error('Stripe Checkout Error:', err);
        }
      });
    }

  } catch (err) {
    console.error('❌ Error fetching entitlement:', err);
    checkoutButton.disabled = false; // fallback
  }
});
