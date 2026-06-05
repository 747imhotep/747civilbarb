// =================================================
// UI MODULE - DOM updates and display functions
// manage articles display and user interactions
// ui.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 381 lines - Last edited: 2026-06-05 23h57


import { draftsData, progressData, getProgress, getFrenchDrafts, getEnglishDrafts, getDraftById, updateLocalDraftStatus } from './data.js';
import { getCurrentWriterEmail, getCurrentWriterPseudonym } from './auth.js';
import { getRefColorClass, getStatusClass, getStatusText, calculatePercentComplete, formatDate, createProgressBar, escapeHtml } from './utils.js';
import { saveUploadRecord, getUploadRecords } from './storage.js';
import { updateDraftStatusOnServer } from './api.js';

// Current selected draft IDs
let currentFrenchDraftId = null;
let currentEnglishDraftId = null;

/**
 * Populate French dropdown with available articles
 */
export function populateFrenchDropdown() {
    const select = document.getElementById('frenchArticleSelect');
    if (!select) {
        console.error('❌ French select not found');
        return;
    }
    
    const frenchDrafts = getFrenchDrafts();
    console.log('🇫🇷 French drafts found:', frenchDrafts.length);
    
    select.innerHTML = '<option value="">-- Sélectionner --</option>';
    
    frenchDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_fr;
        select.appendChild(option);
    });
}

/**
 * Populate English dropdown with available articles
 */
export function populateEnglishDropdown() {
    const select = document.getElementById('englishArticleSelect');
    if (!select) {
        console.error('❌ English select not found');
        return;
    }
    
    const englishDrafts = getEnglishDrafts();
    console.log('🇬🇧 English drafts found:', englishDrafts.length);
    
    select.innerHTML = '<option value="">-- Select --</option>';
    
    englishDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_en;
        select.appendChild(option);
    });
}

/**
 * Show French article information
 * @param {string} draftId - Draft identifier
 */
export async function showFrenchArticleInfo(draftId) {
    const draft = getDraftById(draftId);
    if (!draft) return;
    
    const writerEmail = getCurrentWriterEmail();
    const progress = getProgress(draftId, writerEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target);
    
    let isReadyForReview = false;
    if (draft.review_status === 'ready_for_review' || draft.review_status === 'under_review') {
        isReadyForReview = true;
    }
    
    const readyCheckbox = document.getElementById('frenchReadyForReview');
    if (readyCheckbox) {
        readyCheckbox.checked = isReadyForReview;
    }
    
    const statusText = getStatusText(draft.review_status, true, 'fr');
    const statusClass = getStatusClass(draft.review_status);
    
    const infoDiv = document.getElementById('frenchArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${escapeHtml(draft.title_fr)}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target} mots (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Échéance: ${formatDate(draft.deadline, 'fr')}</p>` : ''}
            <p>Statut: <span class="${statusClass}">${statusText}</span></p>
            ${createProgressBar(percentComplete)}
        `;
    }
}

/**
 * Show English article information
 * @param {string} draftId - Draft identifier
 */
export async function showEnglishArticleInfo(draftId) {
    const draft = getDraftById(draftId);
    if (!draft) return;
    
    const writerEmail = getCurrentWriterEmail();
    const progress = getProgress(draftId, writerEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target);
    
    let isReadyForReview = false;
    if (draft.review_status === 'ready_for_review' || draft.review_status === 'under_review') {
        isReadyForReview = true;
    }
    
    const readyCheckbox = document.getElementById('englishReadyForReview');
    if (readyCheckbox) {
        readyCheckbox.checked = isReadyForReview;
    }
    
    const statusText = getStatusText(draft.review_status, true, 'en');
    const statusClass = getStatusClass(draft.review_status);
    
    const infoDiv = document.getElementById('englishArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${escapeHtml(draft.title_en)}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target} words (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Deadline: ${formatDate(draft.deadline, 'en')}</p>` : ''}
            <p>Status: <span class="${statusClass}">${statusText}</span></p>
            ${createProgressBar(percentComplete)}
        `;
    }
}

/**
 * Show French view document button
 * @param {string} draftId - Draft identifier
 * @param {Function} onViewCallback - Callback when view is clicked
 */
export function showFrenchViewDocumentButton(draftId, onViewCallback) {
    const draft = getDraftById(draftId);
    if (!draft) return;
    
    const container = document.getElementById('frenchViewDocument');
    if (container) {
        container.innerHTML = `
            <div class="tooltip">
                <button class="view-doc-btn" data-path="${draft.path}">📖 Voir le document</button>
                <span class="tooltip-text">Ouvre le document original à lire ou modifier (verrouille l'article)</span>
            </div>
        `;
        
        const viewBtn = container.querySelector('.view-doc-btn');
        viewBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (onViewCallback) await onViewCallback(draftId, draft);
            window.open(draft.path, '_blank');
        });
    }
}

/**
 * Show English view document button
 * @param {string} draftId - Draft identifier
 * @param {Function} onViewCallback - Callback when view is clicked
 */
export function showEnglishViewDocumentButton(draftId, onViewCallback) {
    const draft = getDraftById(draftId);
    if (!draft) return;
    
    const container = document.getElementById('englishViewDocument');
    if (container) {
        container.innerHTML = `
            <div class="tooltip">
                <button class="view-doc-btn" data-path="${draft.path}">📖 View document</button>
                <span class="tooltip-text">Opens the original document to read or edit (locks the article)</span>
            </div>
        `;
        
        const viewBtn = container.querySelector('.view-doc-btn');
        viewBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (onViewCallback) await onViewCallback(draftId, draft);
            window.open(draft.path, '_blank');
        });
    }
}

/**
 * Clear French view document button
 */
export function clearFrenchViewDocumentButton() {
    const container = document.getElementById('frenchViewDocument');
    if (container) container.innerHTML = '';
}

/**
 * Clear English view document button
 */
export function clearEnglishViewDocumentButton() {
    const container = document.getElementById('englishViewDocument');
    if (container) container.innerHTML = '';
}

/**
 * Update recent documents display
 * @param {string} language - 'fr' or 'en'
 * @param {string} draftId - Draft identifier
 */
export async function updateRecentDocuments(language, draftId) {
    const uploads = getUploadRecords(draftId, language);
    const containerId = language === 'fr' ? 'frenchRecentDocuments' : 'englishRecentDocuments';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (!uploads || uploads.length === 0) {
        container.innerHTML = '<p class="no-documents">Aucun document récent</p>';
        return;
    }
    
    let html = '<ul class="recent-docs-list">';
    uploads.slice(0, 5).forEach(upload => {
        html += `
            <li>
                <span>📄 ${escapeHtml(upload.filename)}</span>
                <span class="upload-date">${formatDate(upload.date, language)}</span>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

/**
 * Display all documents table
 */
export async function displayAllDocuments() {
    const container = document.getElementById('allDocumentsContainer');
    if (!container) return;
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Chargement / Loading...</p>';
        return;
    }
    
    const writerEmail = getCurrentWriterEmail();
    
    let html = '<table class="documents-table">';
    html += '<thead><tr>';
    html += '<th>REF</th>';
    html += '<th>Titre / Title</th>';
    html += '<th>Statut / Status</th>';
    html += '<th>Progression / Progress</th>';
    html += '<th>Fichier</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    for (const draft of draftsData) {
        const progress = getProgress(draft.id, writerEmail);
        const isCurrentWriterWorking = progress && progress.writer_email === writerEmail;
        const wordsWritten = progress ? progress.words_written : 0;
        const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target);
        
        let statusClass = getStatusClass(draft.review_status);
        let statusText = getStatusText(draft.review_status, isCurrentWriterWorking, 'fr');
        let refColorClass = getRefColorClass(draft.review_status);
        
        html += `
            <tr>
                <td class="${refColorClass}"><strong>${escapeHtml(draft.id || '—')}</strong></td>
                <td>
                    <strong>${escapeHtml(draft.title_fr || draft.title_en)}</strong><br>
                    <small>${escapeHtml(draft.title_en || draft.title_fr)}</small>
                </td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    ${createProgressBar(percentComplete, 100)}
                </td>
                <td><a href="${draft.path}" download class="download-link" title="Télécharger l'original">📥 Original</a></td>
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

/**
 * Clear French article info
 */
export function clearFrenchArticleInfo() {
    const infoDiv = document.getElementById('frenchArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = '<p>Aucun article sélectionné</p>';
    }
}

/**
 * Clear English article info
 */
export function clearEnglishArticleInfo() {
    const infoDiv = document.getElementById('englishArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = '<p>No article selected</p>';
    }
}

/**
 * Update selected article hidden fields
 * @param {string} draftId - Draft identifier
 * @param {string} language - 'fr' or 'en'
 */
export function updateSelectedArticle(draftId, language) {
    const draft = getDraftById(draftId);
    const inputId = language === 'fr' ? 'frenchSelectedArticle' : 'englishSelectedArticle';
    const input = document.getElementById(inputId);
    if (input && draft) {
        const title = language === 'fr' ? draft.title_fr : draft.title_en;
        input.value = title || 'No title';
    }
}

/**
 * Clear selected article hidden fields
 * @param {string} language - 'fr' or 'en'
 */
export function clearSelectedArticle(language) {
    const inputId = language === 'fr' ? 'frenchSelectedArticle' : 'englishSelectedArticle';
    const input = document.getElementById(inputId);
    if (input) {
        input.value = language === 'fr' ? 'Aucun article sélectionné' : 'No article selected';
    }
}

/**
 * Get current French draft ID
 * @returns {string|null}
 */
export function getCurrentFrenchDraftId() {
    return currentFrenchDraftId;
}

/**
 * Get current English draft ID
 * @returns {string|null}
 */
export function getCurrentEnglishDraftId() {
    return currentEnglishDraftId;
}

/**
 * Set current French draft ID
 * @param {string|null} id
 */
export function setCurrentFrenchDraftId(id) {
    currentFrenchDraftId = id;
}

/**
 * Set current English draft ID
 * @param {string|null} id
 */
export function setCurrentEnglishDraftId(id) {
    currentEnglishDraftId = id;
}


