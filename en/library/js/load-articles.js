//:::::::::::::::::::::::::::::::::::::::::::::::::::
// EN - load-articles.js
// Compact library with expand/collapse
//:::::::::::::::::::::::::::::::::::::::::::::::::::

let articlesData = [];

// Load articles from catalog.json
async function loadArticles() {
  try {
    const response = await fetch('/en/library/catalog.json');
    
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
    'premium': 'PREM'
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

// Render the library with compact rows
function renderLibrary() {
  const container = document.getElementById('library-container');
  if (!container) return;

  if (!articlesData.articles || articlesData.articles.length === 0) {
    container.innerHTML = '<p>No articles found.</p>';
    return;
  }

  let html = '<div class="compact-library-container">';

  articlesData.articles.forEach((article, index) => {
    // Generate serial number
    const serialNumber = getSerialNumber(index, article.type);
    
    // Badge configuration
    const isFree = article.type === 'free';
    const badgeIcon = isFree ? '🔑' : '🔒';
    const badgeClass = article.type;
    const linkText = isFree ? 'Learn more →' : 'Subscribe to read →';
    
    // Subtitle fallback
    const subtitle = article.subtitle || '';
    
    // Thumbnail for expanded view - SIMPLE VERSION
    let thumbnailHtml = '';
    if (article.hasImage && article.imagePath) {
      thumbnailHtml = `<img src="${article.imagePath}" alt="${article.title}" class="expanded-thumbnail" loading="lazy">`;
    } else {
      thumbnailHtml = `<div class="expanded-thumbnail placeholder">📄</div>`;
    }

    html += `
      <article class="library-compact ${badgeClass}" data-article-id="${article.id}">
        <div class="compact-row">
          <span class="serial">${serialNumber}</span>
          <span class="badge ${badgeClass}">${badgeIcon}</span>
          <h3 class="compact-title">${escapeHtml(article.title)}</h3>
          <button class="toggle-btn">View →</button>
        </div>
        <div class="expanded-details" style="display: none;">
          <div class="expanded-inner">
            ${thumbnailHtml}
            <div class="expanded-content">
              ${subtitle ? `<h4 class="expanded-subtitle">${escapeHtml(subtitle)}</h4>` : ''}
              <p class="expanded-abstract">${escapeHtml(article.abstract)}</p>
              <p class="expanded-meta">PDF — ${article.pages} pages</p>
              <a href="${article.path}" class="read-link" ${article.type === 'premium' ? 'target="_blank"' : ''}>${linkText}</a>
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
  document.querySelectorAll('.library-compact').forEach(item => {
    const row = item.querySelector('.compact-row');
    const btn = item.querySelector('.toggle-btn');
    const details = item.querySelector('.expanded-details');

    function toggle() {
      const isOpen = details.style.display === 'block';
      details.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? 'View →' : 'Collapse ↑';
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
              if (otherBtn) otherBtn.textContent = 'View →';
            }
          }
        });
      }
      
      // Toggle current
      details.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? 'View →' : 'Collapse ↑';
    }

    row.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        toggle();
      }
    });
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
  });
}

// Start everything when page is ready
document.addEventListener('DOMContentLoaded', loadArticles);