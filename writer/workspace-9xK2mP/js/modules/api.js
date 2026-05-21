// =================================================
// API MODULE - All Server Calls
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

import { ENDPOINTS } from './config.js';

/**
 * Update draft status on server
 * @param {string} draftId - Draft identifier
 * @param {string} status - New status (in_progress, ready_for_review, under_review, etc.)
 * @param {string} writerEmail - Current writer's email
 * @returns {Promise<boolean>} - Success status
 */
export async function updateDraftStatusOnServer(draftId, status, writerEmail) {
    try {
        const response = await fetch(ENDPOINTS.updateDraftStatus, {
            method: 'POST',
            headers: { 'Content-Type': application/json },
            body: JSON.stringify({
                draft_id: draftId,
                status: status,
                writer_email: writerEmail,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log(`✅ Status saved to server: ${draftId} -> ${status}`);
            return true;
        } else {
            console.warn(`⚠️ Server returned ${response.status} for status update`);
            return false;
        }
    } catch (error) {
        console.error('❌ Could not reach server for status update:', error);
        return false;
    }
}

/**
 * Save progress to server
 * @param {Object} progressData - Progress object
 * @returns {Promise<boolean>} - Success status
 */
export async function saveProgressOnServer(progressData) {
    try {
        const response = await fetch(ENDPOINTS.saveProgress, {
            method: 'POST',
            headers: { 'Content-Type': application/json },
            body: JSON.stringify(progressData)
        });
        
        if (response.ok) {
            console.log('✅ Progress saved to server');
            return true;
        } else {
            console.warn(`⚠️ Server returned ${response.status} for progress save`);
            return false;
        }
    } catch (error) {
        console.error('❌ Could not reach server for progress save:', error);
        return false;
    }
}

/**
 * Notify reviewer that an article is ready
 * @param {string} draftId - Draft identifier
 * @param {string} title - Article title
 * @param {string} writerPseudonym - Writer's pseudonym
 * @returns {Promise<boolean>} - Success status
 */
export async function notifyReviewerOnServer(draftId, title, writerPseudonym) {
    try {
        const response = await fetch(ENDPOINTS.notifyReviewer, {
            method: 'POST',
            headers: { 'Content-Type': application/json },
            body: JSON.stringify({
                draft_id: draftId,
                title: title,
                writer: writerPseudonym,
                message: `L'article "${title}" est prêt pour relecture.`,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log('✅ Notification sent to reviewer');
            return true;
        } else {
            console.warn(`⚠️ Server returned ${response.status} for notification`);
            return false;
        }
    } catch (error) {
        console.error('❌ Could not send notification:', error);
        return false;
    }
}

/**
 * Upload revision file to server
 * @param {File} file - The file to upload
 * @param {string} draftId - Draft identifier
 * @param {string} writerEmail - Current writer's email
 * @param {string} writerPseudonym - Writer's pseudonym
 * @param {string} language - 'fr' or 'en'
 * @returns {Promise<boolean>} - Success status
 */
export async function uploadRevisionOnServer(file, draftId, writerEmail, writerPseudonym, language) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('draft_id', draftId);
    formData.append('writer_email', writerEmail);
    formData.append('writer_pseudonym', writerPseudonym);
    formData.append('language', language);
    
    try {
        const response = await fetch(ENDPOINTS.uploadRevision, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            console.log('✅ File uploaded to server:', file.name);
            return true;
        } else {
            console.warn(`⚠️ Server returned ${response.status} for file upload`);
            return false;
        }
    } catch (error) {
        console.error('❌ Could not upload file to server:', error);
        return false;
    }
}