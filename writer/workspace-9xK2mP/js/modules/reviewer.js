// =================================================
// REVIEWER MODULE - Reviewer panel logic
// reviewer.js
// Check if user is Reviewer and display appropriate controls
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 156 lines - Last edited: 2026-06-02


import { draftsData, progressData, updateLocalDraftStatus } from './data.js';
import { getCurrentWriterEmail } from './auth.js';
import { REVIEWER_EMAIL } from './config.js';
import { updateDraftStatusOnServer } from './api.js';
import { getRefColorClass, getStatusClass, escapeHtml } from './utils.js';
import { displayAllDocuments } from './ui.js';

/**
 * Check if current user is the reviewer
 * @returns {boolean}
 */
export function isReviewer() {
    const currentEmail = getCurrentWriterEmail();
    return currentEmail === REVIEWER_EMAIL;
}

/**
 * Show or hide reviewer panel based on user role
 */
export async function showReviewerPanel() {
    const panel = document.getElementById('reviewerPanel');
    
    if (!isReviewer() || !panel) {
        if (panel) panel.style.display = 'none';
        return;
    }
    
    panel.style.display = 'block';
    const container = document.getElementById('reviewerActionsContainer');
    if (!container) return;
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Chargement des articles...</p>';
        return;
    }
    
    let html = '<table class="documents-table">';
    html += '<thead><tr>';
    html += '<th>REF</th>';
    html += '<th>Titre</th>';
    html += '<th>Statut actuel</th>';
    html += '<th>Rédacteur</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    for (const draft of draftsData) {
        const progress = progressData.find(p => p.draft_id === draft.id);
        const writerName = progress ? progress.writer_pseudonym : '—';
        const currentStatus = draft.review_status || 'unlocked';
        
        html += `
            <tr>
                <td class="${getRefColorClass(currentStatus)}"><strong>${escapeHtml(draft.id)}</strong></td>
                <td>${escapeHtml(draft.title_fr)}<br><small>${escapeHtml(draft.title_en)}</small></td>
                <td><span class="${getStatusClass(currentStatus)}">${escapeHtml(currentStatus)}</span></td>
                <td>${escapeHtml(writerName)}</td>
                <td class="reviewer-actions-cell">
                    ${getReviewerButtons(draft.id, currentStatus)}
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Attach event listeners to buttons
    document.querySelectorAll('.reviewer-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const draftId = btn.dataset.id;
            const action = btn.dataset.action;
            
            if (action && draftId) {
                await handleReviewerAction(draftId, action);
            }
        });
    });
}

/**
 * Generate reviewer buttons based on current status
 * @param {string} draftId - Draft identifier
 * @param {string} currentStatus - Current review status
 * @returns {string} - HTML string of buttons
 */
function getReviewerButtons(draftId, currentStatus) {
    const buttons = [];
    
    if (currentStatus === 'ready_for_review') {
        buttons.push(`<button class="reviewer-btn approve-btn" data-id="${draftId}" data-action="under_review">✅ Approuver (relecture)</button>`);
    }
    
    if (currentStatus === 'under_review') {
        buttons.push(`<button class="reviewer-btn publish-free-btn" data-id="${draftId}" data-action="published_free">📢 Publier (gratuit)</button>`);
        buttons.push(`<button class="reviewer-btn publish-premium-btn" data-id="${draftId}" data-action="published_premium">⭐ Publier (premium)</button>`);
        buttons.push(`<button class="reviewer-btn sendback-btn" data-id="${draftId}" data-action="in_progress">↩️ Renvoyer</button>`);
    }
    
    if (currentStatus === 'in_progress') {
        buttons.push(`<button class="reviewer-btn unlock-btn" data-id="${draftId}" data-action="unlocked">🔓 Déverrouiller</button>`);
    }
    
    if (currentStatus === 'locked_by_other') {
        buttons.push(`<span class="status-red">🔒 Verrouillé</span>`);
    }
    
    if (buttons.length === 0) {
        buttons.push(`<span class="status-gray">—</span>`);
    }
    
    return buttons.join(' ');
}

/**
 * Handle reviewer action button click
 * @param {string} draftId - Draft identifier
 * @param {string} action - Action to perform
 */
async function handleReviewerAction(draftId, action) {
    const statusMap = {
        'under_review': 'under_review',
        'published_free': 'published_free',
        'published_premium': 'published_premium',
        'in_progress': 'in_progress',
        'unlocked': 'unlocked'
    };
    
    const newStatus = statusMap[action];
    if (!newStatus) return;
    
    console.log(`🔍 Reviewer action: ${action} on ${draftId} -> ${newStatus}`);
    
    // Update local
    updateLocalDraftStatus(draftId, newStatus);
    
    // Update server
    const writerEmail = getCurrentWriterEmail();
    await updateDraftStatusOnServer(draftId, newStatus, writerEmail);
    
    // Refresh displays
    await displayAllDocuments();
    await showReviewerPanel();
    
    console.log(`✅ Status updated to: ${newStatus}`);
}


