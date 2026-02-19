// ============================
// PREMIUM PAGE JS
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------
  // Hero Section Fade-In
  // ---------------------------
  const hero = document.getElementById('hero-premium');
  if (hero) {
    hero.style.opacity = 0;
    hero.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => { hero.style.opacity = 1; }, 100);
  }

  // ---------------------------
  // Premium Articles Staggered Animation
  // ---------------------------
  const premiumArticles = document.querySelectorAll('.premium-item'); // updated
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
  // Track clicks on "Accéder" buttons
  // ---------------------------
  document.querySelectorAll('.subscribe-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('Accéder clicked:', e.currentTarget);
      // Optional: add analytics or tracking here
    });
  });

});
