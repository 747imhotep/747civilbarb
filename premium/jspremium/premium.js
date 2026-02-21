// ============================
// PREMIUM PAGE JS (with entitlement check)
// ============================

document.addEventListener('DOMContentLoaded', async () => {

  const API_BASE = 'https://api.deadanglesinstitute.org';

  // Retrieve email stored from subscribe page
  const userEmail = sessionStorage.getItem('userEmail');

  // ---------------------------
  // 1️⃣ Check user entitlement
  // ---------------------------
  async function checkEntitlement(email) {
    if (!email) return { entitled: false };

    try {
      const res = await fetch(`${API_BASE}/api/me?email=${encodeURIComponent(email)}`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Impossible de récupérer les droits de l'utilisateur.");

      return await res.json();
    } catch (err) {
      console.error('❌ Error fetching /api/me:', err);
      return { entitled: false };
    }
  }

  const entitlement = await checkEntitlement(userEmail);
  console.log('User entitlement:', entitlement);

  // ---------------------------
  // 2️⃣ Hero Section Fade-In
  // ---------------------------
  const hero = document.getElementById('hero-premium');
  if (hero) {
    hero.style.opacity = 0;
    hero.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => { hero.style.opacity = 1; }, 100);
  }

  // ---------------------------
  // 3️⃣ Premium Articles Staggered Animation
  // ---------------------------
  const premiumArticles = document.querySelectorAll('.premium-item');
  premiumArticles.forEach((article, index) => {
    article.style.opacity = 0;
    article.style.transform = 'translateY(20px)';
    article.style.transition = `opacity 0.6s ease ${(index + 1) * 0.2}s, transform 0.6s ease ${(index + 1) * 0.2}s`;
    setTimeout(() => {
      article.style.opacity = 1;
      article.style.transform = 'translateY(0)';
    }, 100);
  });

  // ---------------------------
  // 4️⃣ Track clicks on "Accéder" buttons
  // ---------------------------
  document.querySelectorAll('.subscribe-button').forEach(btn => {
    btn.addEventListener('click', (e) => {

      if (!entitlement.entitled) {
        // Show a small inline message above the button instead of alert
        let msg = btn.parentNode.querySelector('.access-warning');
        if (!msg) {
          msg = document.createElement('div');
          msg.className = 'access-warning';
          msg.textContent = "⚠️ Vous devez être abonné pour accéder à ce contenu.";
          msg.style.color = '#d30b83';
          msg.style.fontWeight = 'bold';
          msg.style.marginBottom = '10px';
          btn.parentNode.insertBefore(msg, btn);
        }
        return;
      }

      console.log('Accéder clicked:', e.currentTarget);
      // Optional: add analytics or tracking here
    });
  });

});
