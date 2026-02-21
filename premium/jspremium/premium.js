// ============================
// PREMIUM PAGE JS (with entitlement check)
// ============================

document.addEventListener('DOMContentLoaded', async () => {

  const API_BASE = 'https://api.deadanglesinstitute.org'; // your API base URL
  const userEmail = sessionStorage.getItem('userEmail');  // or get it from login/session

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

  // Optional: hide premium items if not entitled
  if (!entitlement.entitled) {
    document.querySelectorAll('.premium-item').forEach(item => {
      item.style.opacity = 0.3;  // visually de-emphasize
      item.style.pointerEvents = 'none';
    });
  }

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
      console.log('Accéder clicked:', e.currentTarget);

      if (!entitlement.entitled) {
        alert("⚠️ Vous devez être abonné pour accéder à ce contenu.");
        return;
      }

      // Optional: add analytics or tracking here
    });
  });

});
