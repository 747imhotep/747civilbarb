// ---------------------------
// SUBSCRIBE PAGE JS
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const checkoutButton = document.getElementById('checkout-button');

  // Example: fetch entitlement for a test email
  const email = "test@example.com"; // replace with logged-in user

  try {
    const res = await fetch(`/entitlement?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    console.log("Entitlement data:", data);

    if (data.entitled) {
      checkoutButton.disabled = false;
      checkoutButton.style.cursor = "pointer";
      checkoutButton.textContent = "Vous êtes déjà abonné !";
    } else {
      checkoutButton.disabled = false; // allow checkout
      checkoutButton.style.cursor = "pointer";
      checkoutButton.textContent = "S’abonner";
    }

    checkoutButton.addEventListener('click', async () => {
      if (!data.entitled) {
        // Redirect to Stripe checkout
        const sessionRes = await fetch('/create-checkout-session', { method: 'POST' });
        const session = await sessionRes.json();
        const stripe = Stripe('pk_test_51SmCfbDvGU56HDp7HNPUi8zQym7NgUbY4z4zVb4nqRcn0wMMWAgMx9Q4byfxS60TyF0DyYLMgF8MpCKBlOiovTuE00WUkvFpMI');
        stripe.redirectToCheckout({ sessionId: session.id });
      }
    });

  } catch (err) {
    console.error("❌ Error fetching entitlement:", err);
  }
});

