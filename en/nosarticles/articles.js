// =====================================================================
//  articles.js — main JS for "Nos articles" page
// =====================================================================

let articles = []; // global variable to hold all JSON articles
const category = null; // optional: can be dynamic

  let currentQuery = "";

// 1️⃣ Fetch JSON and render articles
fetch("/en/nosarticles/js/articles.json")
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

    function highlightText(text, query){

  if(!query) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

    // Populate fields
    const link = clone.querySelector('.pdf-link');
    link.innerHTML = highlightText(article.title, currentQuery);
    link.href = article.pdf;

    
    clone.querySelector('.article-subtitle').innerHTML = highlightText(article.subtitle, currentQuery);
    clone.querySelector('.article-abstract').innerHTML = highlightText(article.abstract, currentQuery);
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

    currentQuery = e.target.value.toLowerCase();
    const query = currentQuery;

    const filtered = articles.filter(a => {

      const title = (a.title || "").toLowerCase();
      const subtitle = (a.subtitle || "").toLowerCase();
      const abstract = (a.abstract || "").toLowerCase();
      const tags = (a.tags || []).map(tag => tag.toLowerCase());

      return (
        (!category || tags.includes(category.toLowerCase())) &&
        (
          title.includes(query) ||
          subtitle.includes(query) ||
          abstract.includes(query) ||
          tags.some(tag => tag.includes(query))
        )
      );

    });

    renderArticles(filtered);

  });

}