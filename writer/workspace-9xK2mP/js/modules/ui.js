// =================================================
// UI MODULE - DOM updates and display functions
// manage articles display and user interactions
// ui.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 453 lines created on 2026-06-08 at 14h14


// Updated: 2026-07-08 - Fixed displayAllDocuments() function
// - Added fallback for refColorClass (ref-gray)
// - Added escapeHtml() around statusText
// - Added check for !draft.id to skip invalid drafts
// - Added missing CSS classes for REF colors

import { draftsData, progressData, getProgress, getFrenchDrafts, getEnglishDrafts, getDraftById, updateLocalDraftStatus, refreshDrafts } from './data.js';
import { getCurrentWriterEmail, getCurrentWriterPseudonym } from './auth.js';
import { getRefColorClass, getStatusClass, getStatusText, calculatePercentComplete, formatDate, createProgressBar, escapeHtml } from './utils.js';
import { saveUploadRecord, getUploadRecords } from './storage.js';
import { updateDraftStatusOnServer } from './api.js';
import { getDocumentRefColor, getDocumentStatusText, isLockedByOther } from './references-manager.js';
import { moveDocument } from './file-scanner.js';

// =================================================
// STATE
// =================================================

// Current selected draft IDs
let currentFrenchDraftId = null;
let currentEnglishDraftId = null;

// Storage folders mapping
const STORAGE_FOLDERS = {
    AVAILABLE: 'step1-available',
    IN_PROGRESS: 'step2-in-progress',
    TO_REVIEW: 'step3-to-review'
};

// =================================================
// DROPDOWN FUNCTIONS
// =================================================

/**
 * Populate French dropdown with available articles
 */
export async function populateFrenchDropdown() {
    const select = document.getElementById('frenchArticleSelect');
    if (!select) {
        console.error('❌ French select not found');
        return;
    }
    
    // Refresh drafts before populating
    await refreshDrafts();
    
    const frenchDrafts = getFrenchDrafts();
    console.log('🇫🇷 French drafts found:', frenchDrafts.length);
    
    select.innerHTML = '<option value="">-- Sélectionner --</option>';
    
    frenchDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_fr || draft.filename || draft.id;
        select.appendChild(option);
    });
}

/**
 * Populate English dropdown with available articles
 */
export async function populateEnglishDropdown() {
    const select = document.getElementById('englishArticleSelect');
    if (!select) {
        console.error('❌ English select not found');
        return;
    }
    
    // Refresh drafts before populating
    await refreshDrafts();
    
    const englishDrafts = getEnglishDrafts();
    console.log('🇬🇧 English drafts found:', englishDrafts.length);
    
    select.innerHTML = '<option value="">-- Select --</option>';
    
    englishDrafts.forEach(draft => {
        const option = document.createElement('option');
        option.value = draft.id;
        option.textContent = draft.title_en || draft.filename || draft.id;
        select.appendChild(option);
    });
}

// =================================================
// ARTICLE INFO FUNCTIONS
// =================================================

/**
 * Show French article information
 * @param {string} draftId - Draft identifier
 */
export async function showFrenchArticleInfo(draftId) {
    const draft = getDraftById(draftId);
    if (!draft) {
        console.error('Draft not found:', draftId);
        return;
    }
    
    const writerEmail = getCurrentWriterEmail();
    const progress = getProgress(draftId, writerEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target || 1500);
    
    let isReadyForReview = false;
    if (draft.review_status === 'ready_for_review' || draft.review_status === 'under_review') {
        isReadyForReview = true;
    }
    
    const readyCheckbox = document.getElementById('frenchReadyForReview');
    if (readyCheckbox) {
        readyCheckbox.checked = isReadyForReview;
    }
    
    const statusText = getDocumentStatusText(draftId, 'fr');
    const statusClass = getStatusClass(draft.review_status || 'available');
    
    const infoDiv = document.getElementById('frenchArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${escapeHtml(draft.title_fr || draft.filename || draft.id)}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target || 1500} mots (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Échéance: ${formatDate(draft.deadline, 'fr')}</p>` : ''}
            <p>Statut: <span class="${statusClass}">${escapeHtml(statusText)}</span></p>
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
    if (!draft) {
        console.error('Draft not found:', draftId);
        return;
    }
    
    const writerEmail = getCurrentWriterEmail();
    const progress = getProgress(draftId, writerEmail);
    const wordsWritten = progress ? progress.words_written : 0;
    const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target || 1500);
    
    let isReadyForReview = false;
    if (draft.review_status === 'ready_for_review' || draft.review_status === 'under_review') {
        isReadyForReview = true;
    }
    
    const readyCheckbox = document.getElementById('englishReadyForReview');
    if (readyCheckbox) {
        readyCheckbox.checked = isReadyForReview;
    }
    
    const statusText = getDocumentStatusText(draftId, 'en');
    const statusClass = getStatusClass(draft.review_status || 'available');
    
    const infoDiv = document.getElementById('englishArticleInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>${escapeHtml(draft.title_en || draft.filename || draft.id)}</strong></p>
            <p>📝 ${wordsWritten} / ${draft.word_count_target || 1500} words (${percentComplete}%)</p>
            ${draft.deadline ? `<p>⏰ Deadline: ${formatDate(draft.deadline, 'en')}</p>` : ''}
            <p>Status: <span class="${statusClass}">${escapeHtml(statusText)}</span></p>
            ${createProgressBar(percentComplete)}
        `;
    }
}

// =================================================
// VIEW DOCUMENT BUTTON FUNCTIONS
// =================================================

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
                <button class="view-doc-btn" data-path="${draft.url || draft.path}" data-draft-id="${draftId}">📖 Voir le document</button>
                <span class="tooltip-text">Ouvre le document original à lire ou modifier (verrouille l'article)</span>
            </div>
        `;
        
        const viewBtn = container.querySelector('.view-doc-btn');
        viewBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (onViewCallback) await onViewCallback(draftId, draft);
            window.open(draft.url || draft.path, '_blank');
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
                <button class="view-doc-btn" data-path="${draft.url || draft.path}" data-draft-id="${draftId}">📖 View document</button>
                <span class="tooltip-text">Opens the original document to read or edit (locks the article)</span>
            </div>
        `;
        
        const viewBtn = container.querySelector('.view-doc-btn');
        viewBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (onViewCallback) await onViewCallback(draftId, draft);
            window.open(draft.url || draft.path, '_blank');
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

// =================================================
// RECENT DOCUMENTS FUNCTIONS
// =================================================

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

// =================================================
// DISPLAY ALL DOCUMENTS TABLE (FIXED)
// =================================================

/**
 * Display all documents table
 */
export async function displayAllDocuments() {
    const container = document.getElementById('allDocumentsContainer');
    if (!container) {
        console.error('❌ Container #allDocumentsContainer not found');
        return;
    }
    
    // Refresh drafts to get latest from available folder
    await refreshDrafts();
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Aucun document disponible. Veuillez ajouter des fichiers dans le dossier step1-available.</p>';
        return;
    }
    
    const writerEmail = getCurrentWriterEmail();
    console.log('📊 Displaying', draftsData.length, 'documents in table');
    
    let html = '<table class="documents-table">';
    html += '<thead><tr>';
    html += '<th>REF</th>';
    html += '<th>Titre / Title</th>';
    html += '<th>Statut / Status</th>';
    html += '<th>Progression / Progress</th>';
    html += '<th>Fichier</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    let rowCount = 0;
    
    for (const draft of draftsData) {
        // Skip if no draft id
        if (!draft.id) {
            console.warn('⚠️ Skipping draft with no id:', draft);
            continue;
        }
        
        rowCount++;
        
        const progress = getProgress(draft.id, writerEmail);
        const isCurrentWriterWorking = progress && progress.writer_email === writerEmail;
        const wordsWritten = progress ? progress.words_written : 0;
        const percentComplete = calculatePercentComplete(wordsWritten, draft.word_count_target || 1500);
        
        // Get real-time status and color from references manager
        // FIX: Ensure refColorClass always has a value
        let refColorClass = await getDocumentRefColor(draft.id);
        if (!refColorClass || refColorClass === '') {
            refColorClass = 'ref-gray';
        }
        
        let statusText = getDocumentStatusText(draft.id, 'fr') || 'Disponible';
        
        // Determine if locked by another for special styling
        const lockedByOther = isLockedByOther(draft.id);
        let statusClass = lockedByOther ? 'status-red' : getStatusClass(draft.review_status || 'available');
        
        // Override status text if locked by another
        if (lockedByOther) {
            statusText = 'Occupé par un autre';
        }
        
        const displayTitle = draft.title_fr || draft.filename || draft.id;
        const displaySubtitle = draft.title_en || '';
        
        // Build file URL - prefer url over path
        const fileUrl = draft.url || draft.path || '#';
        
        html += `
            <tr data-draft-id="${escapeHtml(draft.id)}">
                <td class="${refColorClass}">
                    <span class="ref-indicator ${refColorClass}">●</span>
                    <strong>${escapeHtml(draft.id || '—')}</strong>
                </td>
                <td>
                    <strong>${escapeHtml(displayTitle)}</strong><br>
                    <small>${escapeHtml(displaySubtitle)}</small>
                </td>
                <td><span class="${statusClass}">${escapeHtml(statusText)}</span></td>
                <td>
                    ${createProgressBar(percentComplete, 100)}
                </td>
                <td><a href="${fileUrl}" download class="download-link" title="Télécharger l'original">📥 Original</a></td>
                <td>
                    <button class="small-btn view-btn" data-path="${fileUrl}" data-draft-id="${draft.id}">👁️ Voir</button>
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    console.log('✅ Rendered', rowCount, 'documents in table');
    
    // Attach view button event listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const draftId = btn.dataset.draftId;
            const draft = getDraftById(draftId);
            if (draft && window.onViewDocumentCallback) {
                await window.onViewDocumentCallback(draftId, draft);
            }
            window.open(btn.dataset.path, '_blank');
        });
    });
}

// =================================================
// SINGLE DOCUMENT UPDATE
// =================================================

/**
 * Update REF column color for a single document without re-rendering entire table
 * @param {string} draftId - Document ID
 */
export async function updateSingleDocumentRefColor(draftId) {
    const container = document.getElementById('allDocumentsContainer');
    if (!container) return;
    
    const row = container.querySelector(`tr[data-draft-id="${draftId}"]`);
    if (!row) return;
    
    const refCell = row.querySelector('td:first-child');
    if (refCell) {
        const newColor = await getDocumentRefColor(draftId) || 'ref-gray';
        // Remove existing color classes
        refCell.className = refCell.className.replace(/ref-\w+/g, '');
        refCell.classList.add(newColor);
        
        // Update the indicator span
        const indicator = refCell.querySelector('.ref-indicator');
        if (indicator) {
            indicator.className = `ref-indicator ${newColor}`;
        }
    }
}

// =================================================
// CLEAR FUNCTIONS
// =================================================

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
        const title = language === 'fr' ? (draft.title_fr || draft.filename) : (draft.title_en || draft.filename);
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

// =================================================
// GETTERS / SETTERS
// =================================================

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


