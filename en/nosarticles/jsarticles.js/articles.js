// =====================================================================
//  articles.js — main JS for "Nos articles" page
// articles.js
// =====================================================================

let articles = []; // global variable to hold all JSON articles

// 1️⃣ Fetch JSON and render articles
fetch("/nosarticles/jsarticles/articles.json")
  .then(res => res.json())
  .then(data => {
    articles = data; // store globally

    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderArticles(articles);
  });

// 2️⃣ Render function
function renderArticles(listToRender) {
  const list = document.querySelector('.article-list');
  const template = document.getElementById('article-template');

  list.innerHTML = ''; // clear existing articles

  listToRender.forEach(article => {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.pdf-link').textContent = article.title;
    clone.querySelector('.pdf-link').href = article.pdf;
    clone.querySelector('.article-subtitle').textContent = article.subtitle;
    clone.querySelector('.article-abstract').innerHTML = article.abstract;
    clone.querySelector('.article-hero-image').src = article.image;
    clone.querySelector('.article-meta').textContent = article.meta;

    // Lazy PDF loading
    const viewer = clone.querySelector('.pdf-viewer');
    const link = clone.querySelector('.pdf-link');
    link.addEventListener('click', e => {
      e.preventDefault();
      const iframe = viewer.querySelector('iframe');
      iframe.src = article.pdf;
      viewer.style.display = 'block';
    });

    viewer.querySelector('.pdf-close-btn').addEventListener('click', () => {
      viewer.style.display = 'none';
    });

    list.appendChild(clone);
  });
}

constcategory = "Afrique"; // optional: can be dynamic

// 3️⃣ Search/filter — put this **after renderArticles is defined**
document.getElementById('article-search').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();

  // Filter by search and category (if category is set)
  const filtered = articles.filter(a => 
  (!category || (a.tags && a.tags.includes(category))) && // category filter
    a.title.toLowerCase().includes(query) || 
    a.subtitle.toLowerCase().includes(query) ||
    (a.tags || []).some(tag => tag.toLowerCase().includes(query))
  );
  renderArticles(filtered);
});