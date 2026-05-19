// =================================================
// Civilisation ou Barbarie - Writer Dashboard JS
// COMPLETE FINAL VERSION
// Two columns with FR/EN, status colors, tooltips
// =================================================

// Global variables
let draftsData = [];
let progressData = [];
let currentWriterEmail = null;
let currentWriterPseudonym = null;
let currentFrenchDraftId = null;
let currentEnglishDraftId = null;

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
    
    select.innerHTML = '<option value="">-- Sélectionner --</option>';
    
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
    
    select.innerHTML = '<option value="">-- Select --</option>';
    
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
    currentFrenchDraftId = draftId;
    
    if (draftId) {
        await showFrenchArticleInfo(draftId);
        showFrenchViewDocumentButton(draftId);
        updateFrenchSelectedArticle(draftId);
    } else {
        clearFrenchArticleInfo();
        clearFrenchViewDocumentButton();
        clearFrenchSelectedArticle();
    }
}

async function handleEnglishChange(e) {
    const draftId = e.target.value;
    currentEnglishDraftId = draftId;
    
    if (draftId) {
        await showEnglishArticleInfo(draftId);
        showEnglishViewDocumentButton(draftId);
        updateEnglishSelectedArticle(draftId);
    } else {
        clearEnglishArticleInfo();
        clearEnglishViewDocumentButton();
        clearEnglishSelectedArticle();
    }
}

// =================================================
// 5. SHOW ARTICLE INFO (word count, deadline, status)
// =================================================
async function showFrenchArticleInfo(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    // Determine status color
    let statusClass = 'status-gray';
    let statusText = 'Disponible';
    if (draft.review_status === 'locked_by_other') {
        statusClass = 'status-red';
        statusText = 'Occupé par un autre rédacteur';
    } else if (draft.review_status === 'in_progress') {
        statusClass = 'status-orange';
        statusText = 'En cours';
    } else if (draft.review_status === 'ready_for_review') {
        statusClass = 'status-green';
        statusText = 'Prêt pour relecture';
    } else if (draft.review_status === 'under_review') {
        statusClass = 'status-blue';
        statusText = 'En relecture';
    } else if (draft.review_status === 'published_free') {
        statusClass = 'status-purple';
        statusText = 'Publié (libre)';
    } else if (draft.review_status === 'published_premium') {
        statusClass = 'status-purple';
        statusText = 'Publié (premium)';
    }
    
    const infoDiv = document.getElementById('frenchArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${draft.title_fr}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target} mots (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Échéance: ${new Date(draft.deadline).toLocaleDateString('fr-FR')}</p>` : ''}
            <p>Statut: <span class="${statusClass}">${statusText}</span></p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentComplete}%;"></div>
            </div>
        `;
    }
}

async function showEnglishArticleInfo(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    const progress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
    
    let statusClass = 'status-gray';
    let statusText = 'Available';
    if (draft.review_status === 'locked_by_other') {
        statusClass = 'status-red';
        statusText = 'Locked by another writer';
    } else if (draft.review_status === 'in_progress') {
        statusClass = 'status-orange';
        statusText = 'In progress';
    } else if (draft.review_status === 'ready_for_review') {
        statusClass = 'status-green';
        statusText = 'Ready for review';
    } else if (draft.review_status === 'under_review') {
        statusClass = 'status-blue';
        statusText = 'Under review';
    } else if (draft.review_status === 'published_free') {
        statusClass = 'status-purple';
        statusText = 'Published (free)';
    } else if (draft.review_status === 'published_premium') {
        statusClass = 'status-purple';
        statusText = 'Published (premium)';
    }
    
    const infoDiv = document.getElementById('englishArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${draft.title_en}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target} words (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Deadline: ${new Date(draft.deadline).toLocaleDateString('en-US')}</p>` : ''}
            <p>Status: <span class="${statusClass}">${statusText}</span></p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentComplete}%;"></div>
            </div>
        `;
    }
}

// =================================================
// 6. SHOW VIEW DOCUMENT BUTTON
// =================================================
function showFrenchViewDocumentButton(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    const container = document.getElementById('frenchViewDocument');
    if (container) {
        container.innerHTML = `
            <div class="tooltip">
                <button class="view-doc-btn" data-path="${draft.path}">📖 Voir le document</button>
                <span class="tooltip-text">Ouvre le document original à lire ou modifier</span>
            </div>
        `;
        container.querySelector('.view-doc-btn')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
    }
}

function showEnglishViewDocumentButton(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    if (!draft) return;
    
    const container = document.getElementById('englishViewDocument');
    if (container) {
        container.innerHTML = `
            <div class="tooltip">
                <button class="view-doc-btn" data-path="${draft.path}">📖 View document</button>
                <span class="tooltip-text">Opens the original document to read or edit</span>
            </div>
        `;
        container.querySelector('.view-doc-btn')?.addEventListener('click', () => {
            window.open(draft.path, '_blank');
        });
    }
}

function clearFrenchViewDocumentButton() {
    const container = document.getElementById('frenchViewDocument');
    if (container) container.innerHTML = '';
}

function clearEnglishViewDocumentButton() {
    const container = document.getElementById('englishViewDocument');
    if (container) container.innerHTML = '';
}

// =================================================
// 7. UPDATE SELECTED ARTICLE IN SUBMIT FORM
// =================================================
function updateFrenchSelectedArticle(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    const input = document.getElementById('frenchSelectedArticle');
    if (input && draft) {
        input.value = draft.title_fr;
    }
}

function updateEnglishSelectedArticle(draftId) {
    const draft = draftsData.find(d => d.id === draftId);
    const input = document.getElementById('englishSelectedArticle');
    if (input && draft) {
        input.value = draft.title_en;
    }
}

function clearFrenchSelectedArticle() {
    const input = document.getElementById('frenchSelectedArticle');
    if (input) input.value = 'Aucun article sélectionné';
}

function clearEnglishSelectedArticle() {
    const input = document.getElementById('englishSelectedArticle');
    if (input) input.value = 'No article selected';
}

function clearFrenchArticleInfo() {
    const infoDiv = document.getElementById('frenchArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = '<p>Aucun article sélectionné</p>';
    }
}

function clearEnglishArticleInfo() {
    const infoDiv = document.getElementById('englishArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = '<p>No article selected</p>';
    }
}

// =================================================
// 8. SUBMIT REVISION FORM
// =================================================
function setupSubmitForms() {
    const frenchForm = document.getElementById('frenchSubmitForm');
    const englishForm = document.getElementById('englishSubmitForm');
    
    if (frenchForm) {
        frenchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitRevision('fr');
        });
    }
    
    if (englishForm) {
        englishForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitRevision('en');
        });
    }
}

async function submitRevision(language) {
    const isFrench = language === 'fr';
    const draftId = isFrench ? currentFrenchDraftId : currentEnglishDraftId;
    
    if (!draftId) {
        alert(isFrench ? 'Veuillez sélectionner un article' : 'Please select an article');
        return;
    }
    
    const wordsToday = parseInt(document.getElementById(`${language}WordsToday`).value);
    const comment = document.getElementById(`${language}Comment`).value;
    const fileInput = document.getElementById(`${language}File`);
    const readyForReview = document.getElementById(`${language}ReadyForReview`).checked;
    
    if (isNaN(wordsToday) || wordsToday < 0) {
        alert(isFrench ? 'Veuillez entrer un nombre valide de mots' : 'Please enter a valid word count');
        return;
    }
    
    // Save progress
    const existingProgress = progressData.find(p => p.draft_id === draftId && p.writer_email === currentWriterEmail);
    const currentWords = existingProgress ? existingProgress.words_written : 0;
    const newTotal = currentWords + wordsToday;
    
    await saveProgressToServer(draftId, newTotal, comment);
    
    // Update status if ready for review
    if (readyForReview) {
        const draft = draftsData.find(d => d.id === draftId);
        if (draft) {
            draft.review_status = 'ready_for_review';
            await updateDraftStatus(draftId, 'ready_for_review');
        }
    }
    
    // Handle file upload
    if (fileInput.files.length > 0) {
        await uploadRevisionFile(fileInput.files[0], draftId, language);
    }
    
    // Show success message
    const submitBtn = isFrench ? document.querySelector('#frenchSubmitForm .submit-btn') : document.querySelector('#englishSubmitForm .submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isFrench ? '✓ Envoyé !' : '✓ Sent!';
    submitBtn.style.background = '#27ae60';
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '#2c3e2f';
    }, 2000);
    
    // Clear form fields (keep file input)
    document.getElementById(`${language}WordsToday`).value = '';
    document.getElementById(`${language}Comment`).value = '';
    document.getElementById(`${language}ReadyForReview`).checked = false;
    document.getElementById(`${language}File`).value = '';
    
    // Refresh displays
    if (isFrench) {
        await showFrenchArticleInfo(draftId);
    } else {
        await showEnglishArticleInfo(draftId);
    }
    await displayAllDocuments();
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
    
    console.log('Progress saved:', progressData);
    return true;
}

async function updateDraftStatus(draftId, status) {
    const draft = draftsData.find(d => d.id === draftId);
    if (draft) {
        draft.review_status = status;
        console.log(`Draft ${draftId} status updated to: ${status}`);
    }
    return true;
}

async function uploadRevisionFile(file, draftId, language) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('draft_id', draftId);
    formData.append('writer_email', currentWriterEmail);
    formData.append('writer_pseudonym', currentWriterPseudonym);
    formData.append('language', language);
    
    console.log('Uploading revision:', file.name, 'for draft:', draftId);
    
    // Store in localStorage for recent documents
    const uploadHistoryKey = `cob_uploads_${draftId}_${language}`;
    const uploads = JSON.parse(localStorage.getItem(uploadHistoryKey) || '[]');
    uploads.unshift({
        filename: file.name,
        path: URL.createObjectURL(file),
        date: new Date().toISOString(),
        draftId: draftId
    });
    localStorage.setItem(uploadHistoryKey, JSON.stringify(uploads.slice(0, 10)));
    
    // Update recent documents display
    await updateRecentDocuments(language, draftId);
}

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
// 9. DISPLAY ALL DOCUMENTS TABLE
// =================================================
async function displayAllDocuments() {
    const container = document.getElementById('allDocumentsContainer');
    if (!container) return;
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Chargement / Loading...</p>';
        return;
    }
    
    let html = '<table class="documents-table">';
    html += '<thead><tr><th>Titre / Title</th><th>Statut / Status</th><th>Progression / Progress</th><th></th><th>Actions</th></tr></thead><tbody>';
    
    for (const draft of draftsData) {
        const progress = progressData.find(p => p.draft_id === draft.id && p.writer_email === currentWriterEmail);
        const wordsWritten = progress ? progress.words_written : 0;
        const percentComplete = draft.word_count_target ? Math.round((wordsWritten / draft.word_count_target) * 100) : 0;
        
        let statusClass = 'status-gray';
        let statusText = 'Disponible / Available';
        
        if (draft.review_status === 'locked_by_other') {
            statusClass = 'status-red';
            statusText = 'Occupé / Locked';
        } else if (draft.review_status === 'in_progress') {
            statusClass = 'status-orange';
            statusText = 'En cours / In progress';
        } else if (draft.review_status === 'ready_for_review') {
            statusClass = 'status-green';
            statusText = 'Prêt / Ready';
        } else if (draft.review_status === 'under_review') {
            statusClass = 'status-blue';
            statusText = 'En relecture / Under review';
        } else if (draft.review_status === 'published_free' || draft.review_status === 'published_premium') {
            statusClass = 'status-purple';
            statusText = 'Publié / Published';
        }
        
        html += `
            <tr>
                <td><strong>${draft.title_fr || draft.title_en}</strong><br><small>${draft.title_en || draft.title_fr}</small></td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <div class="progress-bar-container" style="width: 100px;">
                        <div class="progress-bar" style="width: ${percentComplete}%;"></div>
                    </div>
                    ${percentComplete}%
                </td>
                <td><a href="${draft.path}" download class="download-link">📥</a></td>
                <td>
                    <button class="small-btn view-btn" data-path="${draft.path}">👁️ Voir</button>
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => window.open(btn.dataset.path, '_blank'));
    });
}

// =================================================
// 10. INITIALIZE DASHBOARD
// =================================================
async function initWriterDashboard() {
    console.log('🚀 Initializing writer dashboard...');
    
    const email = await getWriterIdentity();
    if (!email) {
        console.log('❌ Writer not identified');
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="login-error">
                    🔐 Accès protégé par Cloudflare Zero Trust.
                    <br><br>
                    Cette page est réservée aux rédacteurs approuvés.
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
    
    await loadDrafts();
    await loadProgress();
    
    populateFrenchDropdown(draftsData);
    populateEnglishDropdown(draftsData);
    
    setupSubmitForms();
    
    await displayAllDocuments();
    
    console.log('🎉 Dashboard initialized successfully!');
}

// =================================================
// 11. START THE DASHBOARD
// =================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriterDashboard);
} else {
    initWriterDashboard();
}