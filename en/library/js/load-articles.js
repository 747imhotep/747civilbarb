//:::::::::::::::::::::::::::::::::::::::::::::::::::
// EN - load-articles.js
// Compact library with expand/collapse
//:::::::::::::::::::::::::::::::::::::::::::::::::::

let articlesData = [];

// Load articles from catalog.json
async function loadArticles() {
  try {
    // Detect language from path
    const lang = window.location.pathname.startsWith('/en/') ? 'en' : 'fr';
    const response = await fetch(`/${lang}/library/catalog.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    articlesData = await response.json();
    renderLibrary();
  } catch (error) {
    console.error('Error loading articles:', error);
    const container = document.getElementById('library-container');
    if (container) {
      container.innerHTML = '<p>Error loading library. Please refresh the page.</p>';
    }
  }
}

// Generate serial numbers based on content type
function getSerialNumber(index, type) {
  const prefixes = {
    'free': 'LIB',
    'premium': 'PREM',
    'non-editing': 'NED'
  };
  const prefix = prefixes[type] || 'DOC';
  const num = String(index + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get language for button texts
function getLang() {
  return window.location.pathname.startsWith('/en/') ? 'en' : 'fr';
}

// Render the library with compact rows
function renderLibrary() {
  const container = document.getElementById('library-container');
  if (!container) return;

  if (!articlesData.articles || articlesData.articles.length === 0) {
    container.innerHTML = '<p>No articles found.</p>';
    return;
  }

  const lang = getLang();
  let html = '<div class="compact-library-container">';

  articlesData.articles.forEach((article, index) => {
    // Generate serial number
    const serialNumber = getSerialNumber(index, article.type);
    
    // Badge configuration
    let badgeIcon = '';
    let badgeText = '';
    let linkText = '';
    
    if (article.type === 'free') {
      badgeIcon = lang === 'fr' ? '🔑' : '🔑';
      badgeText = lang === 'fr' ? 'Accès libre' : 'Free access';
      linkText = lang === 'fr' ? 'Consulter →' : 'Browse →';
    } else if (article.type === 'premium') {
      badgeIcon = '🔒';
      badgeText = lang === 'fr' ? 'Contenu premium' : 'Premium content';
      linkText = lang === 'fr' ? 'S\'abonner pour lire →' : 'Subscribe to read →';
    } else if (article.type === 'non-editing') {
      badgeIcon = '✍🏾';
      badgeText = lang === 'fr' ? 'À venir' : 'Coming soon';
      linkText = lang === 'fr' ? 'Aperçu →' : 'Preview →';
    }
    
    const badgeClass = article.type;
    const subtitle = article.subtitle || '';
    
    // Thumbnail for expanded view
    let thumbnailHtml = '';
    if (article.hasImage && article.imagePath) {
      thumbnailHtml = `<img src="${article.imagePath}" alt="${article.title}" class="expanded-thumbnail" loading="lazy">`;
    } else {
      thumbnailHtml = `<div class="expanded-thumbnail placeholder">📄</div>`;
    }

    // Determine target link based on article type
    let targetLink = '';
    if (article.type === 'free') {
      targetLink = article.path;
    } else if (article.type === 'premium') {
      targetLink = `/${lang}/premium/?article=${article.id}`;
    } else if (article.type === 'non-editing') {
      targetLink = '#'; // No link, just preview
    }

    html += `
      <article class="library-compact ${badgeClass}" data-article-id="${article.id}">
        <div class="compact-row">
          <span class="serial">${serialNumber}</span>
          <span class="badge ${badgeClass}">${badgeIcon}</span>
          <h3 class="compact-title">${escapeHtml(article.title)}</h3>
          <button class="toggle-btn">${lang === 'fr' ? 'Consulter →' : 'Browse →'}</button>
        </div>
        <div class="expanded-details" style="display: none;">
          <div class="expanded-inner">
            ${thumbnailHtml}
            <div class="expanded-content">
              ${subtitle ? `<h4 class="expanded-subtitle">${escapeHtml(subtitle)}</h4>` : ''}
              <p class="expanded-abstract">${escapeHtml(article.abstract)}</p>
              <p class="expanded-meta">${article.fileType || 'PDF'} — ${article.pages} pages</p>
              ${article.type === 'non-editing' ? 
                `<p class="coming-soon-note">${lang === 'fr' ? '📝 Texte en cours de rédaction. Version complète à venir.' : '📝 Text being written. Full version coming soon.'}</p>` : 
                `<a href="${targetLink}" class="read-link">${linkText}</a>`
              }
            </div>
          </div>
        </div>
      </article>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
  
  // Attach toggle listeners after DOM is updated
  attachToggleListeners();
}

// Attach click listeners for expand/collapse
function attachToggleListeners() {
  const allItems = document.querySelectorAll('.library-compact');
  
  allItems.forEach(item => {
    const row = item.querySelector('.compact-row');
    const btn = item.querySelector('.toggle-btn');
    const details = item.querySelector('.expanded-details');

    function toggle() {
      const isOpen = details.style.display === 'block';
      
      // Auto-close ALL other expanded vignettes
      if (!isOpen) {
        allItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherDetails = otherItem.querySelector('.expanded-details');
            const otherBtn = otherItem.querySelector('.toggle-btn');
            if (otherDetails && otherDetails.style.display === 'block') {
              otherDetails.style.display = 'none';
              if (otherBtn) otherBtn.textContent = getLang() === 'fr' ? 'Consulter →' : 'Browse →';
            }
          }
        });
      }
      
      // Toggle current
      details.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? (getLang() === 'fr' ? 'Consulter →' : 'Browse →') : (getLang() === 'fr' ? 'Réduire ↑' : 'Collapse ↑');
    }

    // Click on row (but not on the button itself or links)
    row.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        toggle();
      }
    });
    
    // Click on button
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
  });
}

// Start everything when page is ready
document.addEventListener('DOMContentLoaded', loadArticles);