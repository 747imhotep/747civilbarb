// ============================
// PREMIUM PAGE JS (Dynamic + Entitlement)
// ============================

document.addEventListener('DOMContentLoaded', async () => {

  // Use relative path (same domain)
  const API_BASE = '';
  
  // Detect language from path
  const lang = window.location.pathname.startsWith('/en/') ? 'en' : 'fr';
  
  // Retrieve email stored from subscribe page
  const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

  // ---------------------------
  // 1️⃣ Check user entitlement
  // ---------------------------
  async function checkEntitlement(email) {
    if (!email) return { entitled: false };

    try {
      const res = await fetch(`/api/me?email=${encodeURIComponent(email)}`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Unable to fetch user rights.");

      return await res.json();
    } catch (err) {
      console.error('❌ Error fetching /api/me:', err);
      return { entitled: false };
    }
  }

  const entitlement = await checkEntitlement(userEmail);
  console.log('User entitlement:', entitlement);

  // ---------------------------
  // 2️⃣ Fetch and render premium articles from JSON
  // ---------------------------
  async function loadPremiumArticles() {
    const container = document.getElementById('premium-container');
    if (!container) return;

    try {
      const response = await fetch(`/${lang}/premium/premium.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      renderArticles(data.articles, container);
    } catch (error) {
      console.error('Error loading premium articles:', error);
      container.innerHTML = '<p>Unable to load premium articles. Please refresh the page.</p>';
    }
  }

  function renderArticles(articles, container) {
    if (!articles || articles.length === 0) {
      container.innerHTML = '<p>No premium articles available at this time.</p>';
      return;
    }

    let html = '';
    
    articles.forEach((article, index) => {
      const badgeText = lang === 'fr' ? 'Premium' : 'Premium';
      const buttonText = lang === 'fr' ? 'Accéder' : 'Access';
      
      html += `
        <article class="premium-item" data-index="${index}">
          <div class="premium-badge">${badgeText}</div>
          <h3 class="premium-title">${escapeHtml(article.title)}</h3>
          <h4 class="premium-subtitle">${escapeHtml(article.subtitle)}</h4>
          <p class="premium-abstract">${escapeHtml(article.abstract)}</p>
          <p class="premium-meta">${article.fileType} — ${article.pages} pages — ${badgeText}</p>
          <button type="button" class="subscribe-button" data-article="${article.id}">${buttonText}</button>
        </article>
      `;
    });
    
    container.innerHTML = html;
    
    // Apply staggered animation
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
    
    // Attach click handlers to buttons
    attachButtonListeners();
  }

  // ---------------------------
  // 3️⃣ Attach listeners to "Accéder/Access" buttons
  // ---------------------------
  function attachButtonListeners() {
    document.querySelectorAll('.subscribe-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        if (!entitlement.entitled) {
          // Show inline message
          let msg = btn.parentNode.querySelector('.access-warning');
          if (!msg) {
            msg = document.createElement('div');
            msg.className = 'access-warning';
            msg.textContent = lang === 'fr' 
              ? "⚠️ Vous devez être abonné pour accéder à ce contenu."
              : "⚠️ You must be subscribed to access this content.";
            msg.style.color = '#d30b83';
            msg.style.fontWeight = 'bold';
            msg.style.marginBottom = '10px';
            btn.parentNode.insertBefore(msg, btn);
          }
          return;
        }

        // If entitled, redirect to premium file via API
        const articleId = btn.dataset.article;
        if (articleId) {
          window.location.href = `/api/premium-file/${lang}/files/${articleId}.pdf`;
        } else {
          console.log('Access clicked:', e.currentTarget);
        }
      });
    });
  }

  // Helper function to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---------------------------
  // 4️⃣ Hero Section Fade-In
  // ---------------------------
  const hero = document.getElementById('hero-premium');
  if (hero) {
    hero.style.opacity = 0;
    hero.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => { hero.style.opacity = 1; }, 100);
  }

  // ---------------------------
  // 5️⃣ Load articles
  // ---------------------------
  await loadPremiumArticles();

});