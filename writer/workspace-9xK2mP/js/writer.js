// =================================================
// Civilisation ou Barbarie - Writer Dashboard JS
// Complete version with two-column layout
// =================================================

// Global variables
let currentWriterEmail = null;
let currentWriterPseudonym = null;
let currentFrenchDraft = null;
let currentEnglishDraft = null;
let draftsData = [];
let progressData = [];

// =================================================
// 1. GET WRITER IDENTITY from Cloudflare
// =================================================
async function getWriterIdentity() {
    try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
            credentials: 'include'
        });
        if (response.ok) {
            const identity = await response.json();
            currentWriterEmail = identity.email;
            // Try to get pseudonym from localStorage
            currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || identity.email.split('@')[0];
            return identity.email;
        }
    } catch (error) {
        console.log('Could not fetch Cloudflare identity');
    }
    return null;
}

// =================================================
// 2. LOAD DATA from JSON files
// =================================================
async function loadDrafts() {
    try {
        const response = await fetch('/writer/workspace-9xK2mP/drafts.json');
        if (response.ok) {
            const data = await response.json();
            draftsData = data.drafts;
            return draftsData;
        }
    } catch (error) {
        console.error('Error loading drafts:', error);
    }
    return [];
}

async function loadProgress() {
    try {
        const response = await fetch('/writer/workspace-9xK2mP/data/progress.json');
        if (response.ok) {
            const data = await response.json();
            progressData = data.progress;
            return progressData;
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
    return [];
}

// =================================================
// 3. SAVE PROGRESS (simulated - replace with actual endpoint)
// =================================================
async function saveProgressToServer(draftId, wordsWritten, comment) {
    // In a real implementation, this would POST to an endpoint
    // that writes to progress.json
    console.log('Saving progress:', { draftId, wordsWritten, comment, writer: currentWriterEmail });
    
    // Update local progressData
    const existingIndex = progressData.findIndex(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    
    if (existingIndex >= 0) {
        progressData[existingIndex].words_written = wordsWritten;
        progressData[existingIndex].last_update = new Date().toISOString();
        if (comment) progressData[existingIndex].comment = comment;
    } else {
        progressData.push({
            writer_email: currentWriterEmail,
            writer_pseudonym: currentWriterPseudonym,
            draft_id: draftId,
            words_written: wordsWritten,
            last_update: new Date().toISOString(),
            comment: comment || null,
            status: 'in_progress'
        });
    }
    
    // TODO: Replace with actual fetch POST to your backend
    // await fetch('/api/save-progress', { method: 'POST', body: JSON.stringify(progressData) });
    
    return true;
}

// =================================================
// 4. POPULATE FRENCH DROPDOWN
// =================================================
function populateFrenchDropdown(drafts) {
    const select = document.getElementById('frenchArticleSelect');
    if (!select) return;
    
    // Filter drafts that have French content
    const frenchDrafts = drafts.filter(d => d.title_fr && d.status === 'unlocked');
    
    select.innerHTML = '<option value="">-- Sélectionner un article --</option>';
    
    frenchDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_fr;
        select.appendChild(option);
    });
    
    // Add change event listener
    select.addEventListener('change', (e) => {
        const draftId = e.target.value;
        if (draftId) {
            loadFrenchArticleProgress(draftId);
        } else {
            clearFrenchProgress();
        }
    });
}

// =================================================
// 5. POPULATE ENGLISH DROPDOWN
// =================================================
function populateEnglishDropdown(drafts) {
    const select = document.getElementById('englishArticleSelect');
    if (!select) return;
    
    // Filter drafts that have English content
    const englishDrafts = drafts.filter(d => d.title_en && d.status === 'unlocked');
    
    select.innerHTML = '<option value="">-- Select an article --</option>';
    
    englishDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_en;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        const draftId = e.target.value;
        if (draftId) {
            loadEnglishArticleProgress(draftId);
        } else {
            clearEnglishProgress();
        }
    });
}

// =================================================
// 6. LOAD FRENCH ARTICLE PROGRESS
// =================================================
async function loadFrenchArticleProgress(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    currentFrenchDraft = draft;
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    // Update progress display
    const progressDiv = document.getElementById('frenchProgress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div class="progress-card">
                <h4>${draft.title_fr}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                </div>
                <p class="word-count">📝 ${wordsWritten} / ${draft.word_count_target} mots</p>
                ${draft.deadline ? `<p class="deadline">⏰ Échéance: ${new Date(draft.deadline).toLocaleDateString('fr-FR')}</p>` : ''}
                <button class="update-progress-fr" data-id="${draft.id}" data-target="${draft.word_count_target}">✍️ Mettre à jour ma progression</button>
                <button class="view-document-fr" data-path="${draft.path}">📖 Voir le document</button>
            </div>
        `;
        
        // Add event listeners
        document.querySelector('.update-progress-fr')?.addEventListener('click', () => {
            openProgressModal(draft.id, draft.word_count_target, 'fr');
        });
        document.querySelector('.view-document-fr')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
    }
    
    // Update recent documents list (French)
    await updateRecentDocuments('fr', draftId);
}

function clearFrenchProgress() {
    const progressDiv = document.getElementById('frenchProgress');
    if (progressDiv) {
        progressDiv.innerHTML = '<p class="no-article">Sélectionnez un article pour voir la progression.</p>';
    }
}

// =================================================
// 7. LOAD ENGLISH ARTICLE PROGRESS
// =================================================
async function loadEnglishArticleProgress(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    currentEnglishDraft = draft;
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    const progressDiv = document.getElementById('englishProgress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div class="progress-card">
                <h4>${draft.title_en}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                </div>
                <p class="word-count">📝 ${wordsWritten} / ${draft.word_count_target} words</p>
                ${draft.deadline ? `<p class="deadline">⏰ Deadline: ${new Date(draft.deadline).toLocaleDateString('en-US')}</p>` : ''}
                <button class="update-progress-en" data-id="${draft.id}" data-target="${draft.word_count_target}">✍️ Update my progress</button>
                <button class="view-document-en" data-path="${draft.path}">📖 View document</button>
            </div>
        `;
        
        document.querySelector('.update-progress-en')?.addEventListener('click', () => {
            openProgressModal(draft.id, draft.word_count_target, 'en');
        });
        document.querySelector('.view-document-en')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
    }
    
    await updateRecentDocuments('en', draftId);
}

function clearEnglishProgress() {
    const progressDiv = document.getElementById('englishProgress');
    if (progressDiv) {
        progressDiv.innerHTML = '<p class="no-article">Select an article to see progress.</p>';
    }
}

// =================================================
// 8. UPDATE RECENT DOCUMENTS
// =================================================
async function updateRecentDocuments(language, draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    // Get upload history for this draft (from localStorage or server)
    const uploadHistoryKey = `cob_uploads_${draftId}_${language}`;
    const uploads = JSON.parse(localStorage.getItem(uploadHistoryKey) || '[]');
    
    const containerId = language === 'fr' ? 'frenchRecentDocuments' : 'englishRecentDocuments';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (uploads.length === 0) {
        container.innerHTML = '<p class="no-documents">Aucun document disponible</p>';
        return;
    }
    
    let html = '<ul class="recent-docs-list">';
    uploads.slice(0, 5).forEach(upload => {
        html += `
            <li>
                <a href="${upload.path}" target="_blank">📄 ${upload.filename}</a>
                <span class="upload-date">${new Date(upload.date).toLocaleDateString()}</span>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// =================================================
// 9. PROGRESS MODAL
// =================================================
function openProgressModal(draftId, targetWords, language) {
    let modal = document.getElementById('progressModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'progressModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3 id="modalTitle">✍️ Update Progress</h3>
                <form id="progressForm">
                    <div class="form-group">
                        <label id="wordsLabel">Words written today</label>
                        <input type="number" id="wordsToday" min="0" required placeholder="ex: 350">
                    </div>
                    <div class="form-group">
                        <label id="commentLabel">Comment (optional)</label>
                        <textarea id="comment" rows="2" placeholder="Difficulties, questions..."></textarea>
                    </div>
                    <button type="submit" class="submit-progress">Save progress</button>
                </form>
                <div id="progressStatus"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.querySelector('#progressModal .close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    // Set language-specific text
    const isFrench = language === 'fr';
    document.getElementById('modalTitle').textContent = isFrench ? '✍️ Mettre à jour ma progression' : '✍️ Update my progress';
    document.getElementById('wordsLabel').textContent = isFrench ? 'Mots écrits aujourd\'hui' : 'Words written today';
    document.getElementById('commentLabel').textContent = isFrench ? 'Commentaire (optionnel)' : 'Comment (optional)';
    document.querySelector('.submit-progress').textContent = isFrench ? 'Enregistrer ma progression' : 'Save progress';
    
    modal.setAttribute('data-current-draft', draftId);
    modal.setAttribute('data-target', targetWords);
    modal.setAttribute('data-language', language);
    modal.style.display = 'flex';
    
    const progressForm = document.getElementById('progressForm');
    const progressStatus = document.getElementById('progressStatus');
    
    // Remove old listener
    const newForm = progressForm.cloneNode(true);
    progressForm.parentNode.replaceChild(newForm, progressForm);
    
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const wordsToday = parseInt(document.getElementById('wordsToday').value);
        const comment = document.getElementById('comment').value;
        const currentDraftId = modal.getAttribute('data-current-draft');
        const currentTarget = parseInt(modal.getAttribute('data-target'));
        const currentLanguage = modal.getAttribute('data-language');
        
        if (isNaN(wordsToday) || wordsToday < 0) {
            progressStatus.innerHTML = '<div class="error-msg">Please enter a valid number.</div>';
            return;
        }
        
        // Get current progress
        const existingProgress = progressData.find(p => p.draft_id === currentDraftId && p.writer_email === currentWriterEmail);
        const currentWords = existingProgress ? existingProgress.words_written : 0;
        const newTotal = currentWords + wordsToday;
        
        await saveProgressToServer(currentDraftId, newTotal, comment);
        
        progressStatus.innerHTML = '<div class="success-msg">✅ Progress saved! ' + wordsToday + ' words added.</div>';
        
        setTimeout(() => {
            modal.style.display = 'none';
            progressStatus.innerHTML = '';
            newForm.reset();
            
            // Refresh the progress display
            if (currentLanguage === 'fr') {
                loadFrenchArticleProgress(currentDraftId);
            } else {
                loadEnglishArticleProgress(currentDraftId);
            }
        }, 2000);
    });
}

// =================================================
// 10. FILE UPLOAD HANDLING (Formspree)
// =================================================
function setupFileUploads() {
    const frenchUploadForm = document.getElementById('frenchUploadForm');
    const englishUploadForm = document.getElementById('englishUploadForm');
    
    if (frenchUploadForm) {
        frenchUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('frenchFile');
            const articleSelect = document.getElementById('frenchArticleSelect');
            
            if (!fileInput.files.length) {
                alert('Veuillez sélectionner un fichier.');
                return;
            }
            if (!articleSelect.value) {
                alert('Veuillez sélectionner un article.');
                return;
            }
            
            await uploadFile(fileInput.files[0], articleSelect.value, 'fr');
        });
    }
    
    if (englishUploadForm) {
        englishUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('englishFile');
            const articleSelect = document.getElementById('englishArticleSelect');
            
            if (!fileInput.files.length) {
                alert('Please select a file.');
                return;
            }
            if (!articleSelect.value) {
                alert('Please select an article.');
                return;
            }
            
            await uploadFile(fileInput.files[0], articleSelect.value, 'en');
        });
    }
}

async function uploadFile(file, draftId, language) {
    // Formspree upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('draft_id', draftId);
    formData.append('writer_email', currentWriterEmail);
    formData.append('writer_pseudonym', currentWriterPseudonym);
    formData.append('language', language);
    
    // TODO: Replace with your actual Formspree endpoint
    // const response = await fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: formData });
    
    // Simulate success
    console.log('Uploading:', file.name, 'for draft:', draftId);
    
    // Save to localStorage for recent documents
    const uploadHistoryKey = `cob_uploads_${draftId}_${language}`;
    const uploads = JSON.parse(localStorage.getItem(uploadHistoryKey) || '[]');
    uploads.unshift({
        filename: file.name,
        path: URL.createObjectURL(file),
        date: new Date().toISOString(),
        draftId: draftId
    });
    localStorage.setItem(uploadHistoryKey, JSON.stringify(uploads.slice(0, 10)));
    
    alert(language === 'fr' ? 'Fichier envoyé avec succès !' : 'File uploaded successfully!');
    
    // Reset file input
    const fileInput = language === 'fr' ? document.getElementById('frenchFile') : document.getElementById('englishFile');
    if (fileInput) fileInput.value = '';
    
    // Refresh recent documents
    await updateRecentDocuments(language, draftId);
}

// =================================================
// 11. INITIALIZE DASHBOARD
// =================================================
// Replace the existing initWriterDashboard function with this:

async function initWriterDashboard() {
    const email = await getWriterIdentity();
    if (!email) {
        console.log('Writer not identified - Cloudflare login required');
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="login-error">
                    🔐 Veuillez vous connecter via Cloudflare pour accéder à ce tableau de bord.
                    <br><br>
                    🔐 Please log in via Cloudflare to access this dashboard.
                    <br><br>

                    <a href="https://www.deadanglesinstitute.org/cdn-cgi/access/login" class="login-btn">Accéder au tableau de bord</a>
                    <br><br>

                    <small>Si vous n'avez pas reçu d'invitation, contactez l'équipe éditoriale.</small>
                    <br><br>

                    <small>If you haven't received an invitation, please contact the editorial team.</small>
                </div>
            `;
        }
        return;
    }
    
    console.log('✅ Writer email:', email);
    
    // Display writer info
    const writerInfo = document.getElementById('writerInfo');
    if (writerInfo) {
        writerInfo.innerHTML = `<span class="writer-pseudo">✍️ ${currentWriterPseudonym}</span> <span class="writer-email">(${currentWriterEmail})</span>`;
    }
    
    // Load data
    console.log('📥 Loading drafts.json...');
    await loadDrafts();
    console.log('✅ Drafts loaded:', draftsData.length, 'drafts');
    
    console.log('📥 Loading progress.json...');
    await loadProgress();
    console.log('✅ Progress loaded:', progressData.length, 'entries');
    
    // Populate dropdowns
    console.log('📋 Populating French dropdown...');
    populateFrenchDropdown(draftsData);
    
    console.log('📋 Populating English dropdown...');
    populateEnglishDropdown(draftsData);
    
    // Setup file uploads
    setupFileUploads();
    
    console.log('🎉 Dashboard initialized successfully');
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriterDashboard);
} else {
    initWriterDashboard();
}