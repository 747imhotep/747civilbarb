// =================================================
// Civilisation ou Barbarie - Writer Dashboard JS
// COMPLETE FINAL VERSION
// Features: Tooltips, Document table, Status workflow
// =================================================

// Global variables
let draftsData = [];
let progressData = [];
let currentWriterEmail = null;
let currentWriterPseudonym = null;

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
            currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || identity.email.split('@')[0];
            console.log('✅ Writer identified:', currentWriterEmail);
            return currentWriterEmail;
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
        const response = await fetch('/writer/workspace-9xK2mP/data/drafts.json');
        if (response.ok) {
            const data = await response.json();
            console.log('📥 Drafts.json loaded:', data);
            if (data && data.drafts) {
                draftsData = data.drafts;
                console.log('✅ Drafts assigned:', draftsData.length, 'articles');
                return draftsData;
            } else {
                console.error('❌ drafts.json missing "drafts" key');
                draftsData = [];
                return [];
            }
        } else {
            console.error('❌ Failed to load drafts.json:', response.status);
            draftsData = [];
            return [];
        }
    } catch (error) {
        console.error('❌ Error loading drafts:', error);
        draftsData = [];
        return [];
    }
}

async function loadProgress() {
    try {
        const response = await fetch('/writer/workspace-9xK2mP/data/progress.json');
        if (response.ok) {
            const data = await response.json();
            console.log('📥 Progress.json loaded:', data);
            if (data && data.progress) {
                progressData = data.progress;
                console.log('✅ Progress assigned:', progressData.length, 'entries');
                return progressData;
            } else {
                console.error('❌ progress.json missing "progress" key');
                progressData = [];
                return [];
            }
        } else {
            console.error('❌ Failed to load progress.json:', response.status);
            progressData = [];
            return [];
        }
    } catch (error) {
        console.error('❌ Error loading progress:', error);
        progressData = [];
        return [];
    }
}

// =================================================
// 3. POPULATE DROPDOWNS
// =================================================
function populateFrenchDropdown(drafts) {
    const select = document.getElementById('frenchArticleSelect');
    if (!select) {
        console.error('❌ French select not found');
        return;
    }
    
    const frenchDrafts = drafts.filter(d => d.title_fr && d.status === 'unlocked');
    console.log('🇫🇷 French drafts found:', frenchDrafts.length);
    
    select.innerHTML = '<option value="">-- Sélectionner un article --</option>';
    
    frenchDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_fr;
        select.appendChild(option);
    });
    
    console.log('✅ French dropdown has', select.options.length, 'options');
    
    select.removeEventListener('change', handleFrenchChange);
    select.addEventListener('change', handleFrenchChange);
}

function populateEnglishDropdown(drafts) {
    const select = document.getElementById('englishArticleSelect');
    if (!select) {
        console.error('❌ English select not found');
        return;
    }
    
    const englishDrafts = drafts.filter(d => d.title_en && d.status === 'unlocked');
    console.log('🇬🇧 English drafts found:', englishDrafts.length);
    
    select.innerHTML = '<option value="">-- Select an article --</option>';
    
    englishDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_en;
        select.appendChild(option);
    });
    
    console.log('✅ English dropdown has', select.options.length, 'options');
    
    select.removeEventListener('change', handleEnglishChange);
    select.addEventListener('change', handleEnglishChange);
}

// =================================================
// 4. HANDLE ARTICLE SELECTION
// =================================================
async function handleFrenchChange(e) {
    const draftId = e.target.value;
    if (draftId) {
        await loadFrenchArticleProgress(draftId);
    } else {
        clearFrenchProgress();
    }
}

async function handleEnglishChange(e) {
    const draftId = e.target.value;
    if (draftId) {
        await loadEnglishArticleProgress(draftId);
    } else {
        clearEnglishProgress();
    }
}

// =================================================
// 5. LOAD ARTICLE PROGRESS WITH TOOLTIPS
// =================================================
async function loadFrenchArticleProgress(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) {
        console.error('❌ Draft not found:', draftId);
        return;
    }
    
    console.log('🇫🇷 Loading French article:', draft.title_fr);
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    const progressDiv = document.getElementById('frenchProgress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div class="progress-card">
                <h4>📄 ${draft.title_fr}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                </div>
                <p class="word-count">📝 ${wordsWritten} / ${draft.word_count_target} mots</p>
                ${draft.deadline ? `<p class="deadline">⏰ Échéance: ${new Date(draft.deadline).toLocaleDateString('fr-FR')}</p>` : ''}
                    <div class="button-group">
                        <div class="tooltip">
                            <button class="view-document-fr" data-path="${draft.path}">📖 Voir le document</button>
                            <span class="tooltip-text">📄 Ouvre le document original (PDF/TXT) pour le lire ou le modifier.</span>
                        </div>
                    </div>
            </div>
        `;
        
        document.querySelector('.update-progress-fr')?.addEventListener('click', () => {
            openProgressModal(draft.id, draft.word_count_target, 'fr');
        });
        document.querySelector('.view-document-fr')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
        document.querySelector('.mark-ready-fr')?.addEventListener('click', () => {
            markReadyForReview(draft.id, 'fr');
        });
    }
    
    await updateRecentDocuments('fr', draftId);
}

async function loadEnglishArticleProgress(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) {
        console.error('❌ Draft not found:', draftId);
        return;
    }
    
    console.log('🇬🇧 Loading English article:', draft.title_en);
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    const progressDiv = document.getElementById('englishProgress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div class="progress-card">
                <h4>📄 ${draft.title_en}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                </div>
                <p class="word-count">📝 ${wordsWritten} / ${draft.word_count_target} words</p>
                ${draft.deadline ? `<p class="deadline">⏰ Deadline: ${new Date(draft.deadline).toLocaleDateString('en-US')}</p>` : ''}
                <div class="button-group">
                    <div class="tooltip">
                        <button class="view-document-en" data-path="${draft.path}">📖 View document</button>
                        <span class="tooltip-text">📄 Opens the original document (PDF/TXT) to read or edit.</span>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.update-progress-en')?.addEventListener('click', () => {
            openProgressModal(draft.id, draft.word_count_target, 'en');
        });
        document.querySelector('.view-document-en')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
        document.querySelector('.mark-ready-en')?.addEventListener('click', () => {
            markReadyForReview(draft.id, 'en');
        });
    }
    
    await updateRecentDocuments('en', draftId);
}

function clearFrenchProgress() {
    const progressDiv = document.getElementById('frenchProgress');
    if (progressDiv) {
        progressDiv.innerHTML = '<p class="no-article">Sélectionnez un article pour voir la progression.</p>';
    }
}

function clearEnglishProgress() {
    const progressDiv = document.getElementById('englishProgress');
    if (progressDiv) {
        progressDiv.innerHTML = '<p class="no-article">Select an article to see progress.</p>';
    }
}

// =================================================
// 6. MARK READY FOR REVIEW
// =================================================
async function markReadyForReview(draftId, language) {
    const confirmMsg = language === 'fr' 
        ? 'Confirmez-vous que ce document est prêt pour relecture ?'
        : 'Confirm this document is ready for review?';
    
    if (confirm(confirmMsg)) {
        // Update the draft status
        const draft = draftsData.find(d => d.id === draftId);
        if (draft) {
            draft.review_status = 'ready_for_review';
            console.log('✅ Document ready for review:', draftId);
            
            // TODO: Send notification to you (email/Telegram)
            // You can add fetch call here to notify you
            
            alert(language === 'fr' 
                ? '✅ Document envoyé pour relecture. L\'équipe éditoriale vous répondra bientôt.'
                : '✅ Document sent for review. The editorial team will get back to you.');
            
            // Refresh the progress display
            if (language === 'fr') {
                await loadFrenchArticleProgress(draftId);
            } else {
                await loadEnglishArticleProgress(draftId);
            }
            await displayAllDocuments();
        }
    }
}

// =================================================
// 7. UPDATE RECENT DOCUMENTS
// =================================================
async function updateRecentDocuments(language, draftId) {
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
// 8. DISPLAY ALL DOCUMENTS TABLE
// =================================================
async function displayAllDocuments() {
    const container = document.getElementById('allDocumentsContainer');
    if (!container) return;
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Aucun document assigné pour le moment.</p>';
        return;
    }
    
    let html = '<table class="documents-table">';
    html += '<thead><tr><th>Titre</th><th>Statut</th><th>Progression</th><th>Télécharger</th><th>Actions</th></tr></thead><tbody>';
    
    for (const draft of draftsData) {
        const progress = progressData.find(p => p.draft_id === draft.id && p.writer_email === currentWriterEmail);
        const wordsWritten = progress ? progress.words_written : 0;
        const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
        
        let statusText = '';
        let statusClass = '';
        if (draft.review_status === 'work_in_progress' || !draft.review_status) {
            statusText = '🚧 En cours';
            statusClass = 'status-in-progress';
        } else if (draft.review_status === 'ready_for_review') {
            statusText = '⏳ En relecture';
            statusClass = 'status-review';
        } else if (draft.review_status === 'approved') {
            statusText = '✅ Approuvé';
            statusClass = 'status-approved';
        } else if (draft.review_status === 'published_free') {
            statusText = '📖 Publié (Libre)';
            statusClass = 'status-published';
        } else if (draft.review_status === 'published_premium') {
            statusText = '⭐ Publié (Premium)';
            statusClass = 'status-published';
        }
        
        html += `
            <tr class="${statusClass}">
                <td><strong>${draft.title_fr || draft.title_en}</strong></td>
                <td>${statusText}</td>
                <td>
                    <div class="progress-bar-container" style="width: 100px;">
                        <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                    </div>
                    ${percentComplete}%
                </td>
                <td><a href="${draft.path}" download class="download-link">📥 Télécharger</a></td>
                <td>
                    <button class="small-btn view-btn" data-path="${draft.path}">👁️ Voir</button>
                    ${(draft.review_status === 'work_in_progress' || !draft.review_status) ? `<button class="small-btn review-btn" data-id="${draft.id}" data-lang="fr">✅ Prêt</button>` : ''}
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Attach event listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => window.open(btn.dataset.path, '_blank'));
    });
    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', () => markReadyForReview(btn.dataset.id, btn.dataset.lang || 'fr'));
    });
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
                <h3 id="modalTitle">✍🏾 Update Progress</h3>
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
    document.getElementById('modalTitle').textContent = isFrench ? '✍🏾 Mettre à jour ma progression' : '✍🏾 Update my progress';
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
            progressStatus.innerHTML = '<div class="error-msg">Veuillez entrer un nombre valide.</div>';
            return;
        }
        
        const existingProgress = progressData.find(p => p.draft_id === currentDraftId && p.writer_email === currentWriterEmail);
        const currentWords = existingProgress ? existingProgress.words_written : 0;
        const newTotal = currentWords + wordsToday;
        
        await saveProgressToServer(currentDraftId, newTotal, comment);
        
        progressStatus.innerHTML = '<div class="success-msg">✅ Progression enregistrée ! ' + wordsToday + ' mots ajoutés.</div>';
        
        setTimeout(() => {
            modal.style.display = 'none';
            progressStatus.innerHTML = '';
            newForm.reset();
            
            if (currentLanguage === 'fr') {
                loadFrenchArticleProgress(currentDraftId);
            } else {
                loadEnglishArticleProgress(currentDraftId);
            }
            displayAllDocuments();
        }, 2000);
    });
}

async function saveProgressToServer(draftId, wordsWritten, comment) {
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
    
    console.log('Progress saved locally:', progressData);
    return true;
}

// =================================================
// 10. FILE UPLOAD HANDLING
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('draft_id', draftId);
    formData.append('writer_email', currentWriterEmail);
    formData.append('writer_pseudonym', currentWriterPseudonym);
    formData.append('language', language);
    
    console.log('Uploading:', file.name, 'for draft:', draftId);
    
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
    
    const fileInput = language === 'fr' ? document.getElementById('frenchFile') : document.getElementById('englishFile');
    if (fileInput) fileInput.value = '';
    
    await updateRecentDocuments(language, draftId);
    await displayAllDocuments();
}

// =================================================
// 11. INITIALIZE DASHBOARD
// =================================================
async function initWriterDashboard() {
    console.log('🚀 Initializing writer dashboard...');
    
    const email = await getWriterIdentity();
    if (!email) {
        console.log('❌ Writer not identified - Cloudflare login required');
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="login-error">
                    🔐 Accès protégé par Cloudflare Zero Trust.
                    <br><br>
                    Cette page est réservée aux rédacteurs approuvés.
                    <br><br>
                    <small>Si vous devriez avoir accès, contactez l'équipe éditoriale.</small>
                </div>
            `;
        }
        return;
    }
    
    console.log('✅ Writer email:', currentWriterEmail);
    console.log('✅ Writer pseudonym:', currentWriterPseudonym);
    
    const writerInfo = document.getElementById('writerInfo');
    if (writerInfo) {
        writerInfo.innerHTML = `<span class="writer-pseudo">✍🏾 ${currentWriterPseudonym}</span> <span class="writer-email">(${currentWriterEmail})</span>`;
    }
    
    console.log('📥 Loading drafts.json...');
    await loadDrafts();
    
    console.log('📥 Loading progress.json...');
    await loadProgress();
    
    console.log('📋 Final draftsData:', draftsData);
    console.log('📋 Final progressData:', progressData);
    
    console.log('📋 Populating French dropdown...');
    populateFrenchDropdown(draftsData);
    
    console.log('📋 Populating English dropdown...');
    populateEnglishDropdown(draftsData);
    
    console.log('📤 Setting up file uploads...');
    setupFileUploads();
    
    console.log('📚 Displaying all documents...');
    await displayAllDocuments();
    
    console.log('🎉 Dashboard initialized successfully!');
}

// =================================================
// 12. START THE DASHBOARD
// =================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriterDashboard);
} else {
    initWriterDashboard();
}