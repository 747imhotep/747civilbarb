// =====================================================================
//  articles.js — main JS for "Nos articles" page
// =====================================================================

let articles = []; // global variable to hold all JSON articles
const category = "Afrique"; // optional: can be dynamic

// 1️⃣ Fetch JSON and render articles
fetch("/nosarticles/jsarticles/articles.json")
  .then(res => res.json())
  .then(data => {
    articles = data;

    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderArticles(articles);
  })
  .catch(err => {
    console.error("Erreur lors du chargement des articles :", err);
  });

// 2️⃣ Render function
function renderArticles(listToRender) {
  const list = document.querySelector('.article-list');
  const template = document.getElementById('article-template');
  if (!list || !template) return;

  list.innerHTML = ''; // clear existing articles

  listToRender.forEach(article => {
    const clone = template.content.cloneNode(true);

    // Populate fields
    const link = clone.querySelector('.pdf-link');
    link.textContent = article.title;
    link.href = article.pdf;

    clone.querySelector('.article-subtitle').textContent = article.subtitle;
    clone.querySelector('.article-abstract').innerHTML = article.abstract;
    const img = clone.querySelector('.article-hero-image');
    img.src = article.image;
    img.alt = article.imageAlt || '';

    clone.querySelector('.article-meta').textContent = article.meta;

    // Lazy PDF loading
    const viewer = clone.querySelector('.pdf-viewer');
    link.addEventListener('click', e => {
      e.preventDefault();
      const iframe = viewer.querySelector('iframe');
      iframe.src = article.pdf; // load iframe only on click
      viewer.style.display = 'block';
    });

    viewer.querySelector('.pdf-close-btn').addEventListener('click', () => {
      viewer.style.display = 'none';
      viewer.querySelector('iframe').src = ''; // clear iframe to save memory
    });

    list.appendChild(clone);
  });
}

// 3️⃣ Search/filter
const searchInput = document.getElementById('article-search');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    const query = e.target.value.toLowerCase();

    const filtered = articles.filter(a => 
      // category filter
      (!category || (a.tags && a.tags.includes(category))) &&
      // search filter
      (
        a.title.toLowerCase().includes(query) ||
        a.subtitle.toLowerCase().includes(query) ||
        (a.tags || []).some(tag => tag.toLowerCase().includes(query))
      )
    );

    renderArticles(filtered);
  });
}