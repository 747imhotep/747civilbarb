// =================================================
// REVIEWER MODULE - Reviewer panel logic
// reviewer.js
// Check if user is Reviewer and display appropriate controls
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// Updated: 2026-07-16 - Fixed duplicate function declaration
// - Removed duplicate showReviewerPanel() function
// - Added isReviewer() support for array of emails

import { draftsData, progressData, updateLocalDraftStatus } from './data.js';
import { getCurrentWriterEmail } from './auth.js';
import { REVIEWER_EMAIL } from './config.js';
import { updateDraftStatusOnServer } from './api.js';
import { getRefColorClass, getStatusClass, escapeHtml } from './utils.js';
import { displayAllDocuments } from './ui.js';

/**
 * Check if current user is a reviewer
 * Supports both single email (string) and multiple emails (array)
 * @returns {boolean}
 */
export function isReviewer() {
    const currentEmail = getCurrentWriterEmail();
    
    // If REVIEWER_EMAIL is an array, check if current email is in it
    if (Array.isArray(REVIEWER_EMAIL)) {
        return REVIEWER_EMAIL.includes(currentEmail);
    }
    
    // If REVIEWER_EMAIL is a string, compare directly
    return currentEmail === REVIEWER_EMAIL;
}

/**
 * Show or hide reviewer panel based on user role
 */
export async function showReviewerPanel() {
    console.log('🔍 showReviewerPanel() called');
    const panel = document.getElementById('reviewerPanel');
    
    if (!isReviewer() || !panel) {
        console.log('❌ Reviewer panel hidden: isReviewer=' + isReviewer() + ', panel=' + !!panel);
        if (panel) panel.style.display = 'none';
        return;
    }
    
    console.log('✅ Reviewer panel showing');
    panel.style.display = 'block';
    const container = document.getElementById('reviewerActionsContainer');
    if (!container) return;
    
    if (!draftsData || draftsData.length === 0) {
        container.innerHTML = '<p>Chargement des articles...</p>';
        return;
    }
    
    let html = '<div class="reviewer-table-wrapper"><table class="documents-table reviewer-table">';
    html += '<thead><tr>';
    html += '<th>REF</th>';
    html += '<th>Titre</th>';
    html += '<th>Statut actuel</th>';
    html += '<th>Rédacteur</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    let rowCount = 0;
    
    for (const draft of draftsData) {
        const progress = progressData.find(p => p.draft_id === draft.id);
        const writerName = progress ? progress.writer_pseudonym : '—';
        const currentStatus = draft.review_status || 'unlocked';
        
        // Only show documents that need reviewer attention
        if (currentStatus !== 'ready_for_review' && 
            currentStatus !== 'under_review' && 
            currentStatus !== 'in_progress' &&
            currentStatus !== 'locked_by_other') {
            continue; // Skip documents that don't need reviewer action
        }
        
        rowCount++;
        
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
    
    if (rowCount === 0) {
        html += `
            <tr>
                <td colspan="5" class="reviewer-empty">
                    <span class="reviewer-empty-icon">📭</span>
                    Aucun document en attente de relecture.
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table></div>';
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
        buttons.push(`<button class="reviewer-btn approve-btn" data-id="${draftId}" data-action="under_review">✅ Approuver</button>`);
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