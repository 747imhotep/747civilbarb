//================================================
// writer.js
// Main JavaScript for Writer's Workspace
//================================================  


// Writer's Workspace - Main Application

const API_BASE = '';
const lang = 'en'; // Interface language

// Detect which writer is using the page (based on URL or simple prompt)
let currentWriter = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Ask which writer is logging in
  currentWriter = prompt('Select your role:\n1 - French Writer\n2 - English Writer');
  if (currentWriter === '1') {
    currentWriter = 'french';
  } else if (currentWriter === '2') {
    currentWriter = 'english';
  } else {
    alert('Invalid selection. Please refresh and choose 1 or 2.');
    return;
  }
  
  console.log(`Logged in as: ${currentWriter}`);
  
  // Load everything
  await loadProgress();
  await loadFileLists();
  populateArticleSelects();
});

// Load progress data
async function loadProgress() {
  try {
    const response = await fetch('/api/writer/progress');
    if (!response.ok) throw new Error('Failed to load progress');
    const data = await response.json();
    renderProgressTable(data.articles);
  } catch (error) {
    console.error('Error loading progress:', error);
    document.getElementById('progress-tbody').innerHTML = '<tr><td colspan="3">Error loading progress</td></tr>';
  }
}

// Render progress table with sliders
function renderProgressTable(articles) {
  const tbody = document.getElementById('progress-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  articles.forEach(article => {
    const row = document.createElement('tr');
    
    // Article title
    const titleCell = document.createElement('td');
    titleCell.className = 'article-title';
    titleCell.textContent = article.title;
    row.appendChild(titleCell);
    
    // French progress (editable only by French writer)
    const frenchCell = document.createElement('td');
    frenchCell.innerHTML = `
      <div class="progress-slider-container">
        <input type="range" min="0" max="12" value="${article.frenchProgress}" class="progress-slider" 
               data-article="${article.id}" data-writer="french" ${currentWriter !== 'french' ? 'disabled' : ''}>
        <span class="progress-value">${article.frenchProgress}/12</span>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${(article.frenchProgress / 12) * 100}%"></div>
        </div>
      </div>
    `;
    row.appendChild(frenchCell);
    
    // English progress (editable only by English writer)
    const englishCell = document.createElement('td');
    englishCell.innerHTML = `
      <div class="progress-slider-container">
        <input type="range" min="0" max="12" value="${article.englishProgress}" class="progress-slider" 
               data-article="${article.id}" data-writer="english" ${currentWriter !== 'english' ? 'disabled' : ''}>
        <span class="progress-value">${article.englishProgress}/12</span>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${(article.englishProgress / 12) * 100}%"></div>
        </div>
      </div>
    `;
    row.appendChild(englishCell);
    
    tbody.appendChild(row);
  });
  
  // Attach event listeners to sliders
  document.querySelectorAll('.progress-slider').forEach(slider => {
    slider.addEventListener('change', async (e) => {
      const articleId = slider.dataset.article;
      const writer = slider.dataset.writer;
      const newValue = parseInt(slider.value);
      
      await updateProgress(articleId, writer, newValue);
      
      // Update display
      const container = slider.parentElement;
      const valueSpan = container.querySelector('.progress-value');
      const fillBar = container.querySelector('.progress-bar-fill');
      
      if (valueSpan) valueSpan.textContent = `${newValue}/12`;
      if (fillBar) fillBar.style.width = `${(newValue / 12) * 100}%`;
    });
  });
}

// Update progress via API
async function updateProgress(articleId, writer, value) {
  try {
    const response = await fetch('/api/writer/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, writer, value })
    });
    
    if (!response.ok) throw new Error('Failed to update progress');
    
    // Show notification (would trigger Sender.net email to you)
    showNotification(`${writer} updated ${articleId} to ${value}/12`);
    
  } catch (error) {
    console.error('Error updating progress:', error);
    alert('Failed to save progress. Please try again.');
  }
}

// Load file lists for download
async function loadFileLists() {
  try {
    const response = await fetch('/api/writer/files');
    if (!response.ok) throw new Error('Failed to load files');
    const data = await response.json();
    
    // Render French files
    const frenchList = document.getElementById('french-files');
    if (frenchList && data.french && data.french.length > 0) {
      frenchList.innerHTML = data.french.map(file => `
        <li>
          <a href="${file.url}" download>${file.name}</a>
          <span class="file-date">${file.date}</span>
        </li>
      `).join('');
    } else if (frenchList) {
      frenchList.innerHTML = '<li>No files yet</li>';
    }
    
    // Render English files
    const englishList = document.getElementById('english-files');
    if (englishList && data.english && data.english.length > 0) {
      englishList.innerHTML = data.english.map(file => `
        <li>
          <a href="${file.url}" download>${file.name}</a>
          <span class="file-date">${file.date}</span>
        </li>
      `).join('');
    } else if (englishList) {
      englishList.innerHTML = '<li>No files yet</li>';
    }
    
  } catch (error) {
    console.error('Error loading files:', error);
  }
}

// Populate article selects in upload forms
function populateArticleSelects() {
  // This would fetch article titles from catalog.json
  // For now, we'll use a static list or fetch from API
  fetch('/fr/library/catalog.json')
    .then(res => res.json())
    .then(data => {
      const articles = data.articles;
      const selects = document.querySelectorAll('select[name="article_id"]');
      selects.forEach(select => {
        select.innerHTML = '<option value="">Select article</option>' + 
          articles.map(a => `<option value="${a.id}">${a.title}</option>`).join('');
      });
    })
    .catch(err => console.error('Error loading articles:', err));
}

// Show temporary notification
function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// Handle Formspree redirect (file upload completed)
// Formspree will redirect back to this page
if (window.location.search.includes('?success')) {
  showNotification('✅ File uploaded successfully!');
  loadFileLists(); // Refresh file lists
}