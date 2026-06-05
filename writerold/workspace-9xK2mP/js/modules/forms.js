// =================================================
// FORMS MODULE - Form submission and toggle handling
// forms.js
// 
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 295 lines - IMPORTS - CORRECTED 2026-06-06 00h10




// Data functions
import { updateProgress, updateLocalDraftStatus, getDraftById, getProgress } from './data.js';

// Authentication functions
import { getCurrentWriterEmail, getCurrentWriterPseudonym } from './auth.js';

// API functions (server sync)
import { saveProgressOnServer, updateDraftStatusOnServer, notifyReviewerOnServer, uploadRevisionOnServer } from './api.js';

// Storage functions (local)
import { saveUploadRecord } from './storage.js';

// UI functions - IMPORTANT: from ui.js, NOT reviewer.js
import { showFrenchArticleInfo, showEnglishArticleInfo, displayAllDocuments, updateRecentDocuments } from './ui.js';

// Reviewer functions
import { showReviewerPanel } from './reviewer.js';

// Utility functions
import { showSuccessMessage, showLocalNotification } from './utils.js';


// =================================================
// STATE - Current draft IDs (set by main)
// =================================================
let getCurrentFrenchDraftId = null;
let getCurrentEnglishDraftId = null;


// =================================================
// PUBLIC: Set draft ID getter functions
// Called by writer-main.js during initialization
// @param {Function} getFrenchId - Returns current French draft ID
// @param {Function} getEnglishId - Returns current English draft ID
// =================================================
export function setDraftIdGetters(getFrenchId, getEnglishId) {
    getCurrentFrenchDraftId = getFrenchId;
    getCurrentEnglishDraftId = getEnglishId;
}


// =================================================
// PRIVATE: Update draft status (local + server)
// @param {string} draftId - Draft identifier
// @param {string} status - New status (in_progress, ready_for_review, etc.)
// =================================================
async function updateDraftStatus(draftId, status) {
    const writerEmail = getCurrentWriterEmail();
    
    // Update local data
    updateLocalDraftStatus(draftId, status);
    
    // Update server (fire and forget - don't block UI)
    await updateDraftStatusOnServer(draftId, status, writerEmail);
}


// =================================================
// PUBLIC: Setup toggle (Ready for Review) listeners
// Called by writer-main.js during initialization
// @param {HTMLElement} notificationContainer - Where to show local notifications
// =================================================
export function setupToggleListeners(notificationContainer) {
    const frenchToggle = document.getElementById('frenchReadyForReview');
    const englishToggle = document.getElementById('englishReadyForReview');
    
    // French toggle handler
    if (frenchToggle) {
        frenchToggle.addEventListener('change', async (e) => {
            const draftId = getCurrentFrenchDraftId ? getCurrentFrenchDraftId() : null;
            if (draftId) {
                const newStatus = e.target.checked ? 'ready_for_review' : 'in_progress';
                await updateDraftStatus(draftId, newStatus);
                await showFrenchArticleInfo(draftId);
                await displayAllDocuments();
                if (typeof showReviewerPanel === 'function') await showReviewerPanel();
                console.log(`📝 French article status updated to: ${newStatus}`);
            }
        });
    }
    
    // English toggle handler
    if (englishToggle) {
        englishToggle.addEventListener('change', async (e) => {
            const draftId = getCurrentEnglishDraftId ? getCurrentEnglishDraftId() : null;
            if (draftId) {
                const newStatus = e.target.checked ? 'ready_for_review' : 'in_progress';
                await updateDraftStatus(draftId, newStatus);
                await showEnglishArticleInfo(draftId);
                await displayAllDocuments();
                if (typeof showReviewerPanel === 'function') await showReviewerPanel();
                console.log(`📝 English article status updated to: ${newStatus}`);
            }
        });
    }
}


// =================================================
// PUBLIC: Setup form submission handlers
// Called by writer-main.js during initialization
// =================================================
export function setupSubmitForms() {
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


// =================================================
// PRIVATE: Save progress (local + server)
// @param {string} draftId - Draft identifier
// @param {number} wordsWritten - Total words written
// @param {string} comment - Optional comment
// @param {string} writerEmail - Writer's email
// @param {string} writerPseudonym - Writer's pseudonym
// @returns {Promise<boolean>}
// =================================================
async function saveProgress(draftId, wordsWritten, comment, writerEmail, writerPseudonym) {
    const progressEntry = {
        writer_email: writerEmail,
        writer_pseudonym: writerPseudonym,
        draft_id: draftId,
        words_written: wordsWritten,
        comment: comment || null,
        status: 'in_progress'
    };
    
    // Update local data
    updateProgress(progressEntry);
    
    // Update server (fire and forget)
    await saveProgressOnServer(progressEntry);
    
    return true;
}


// =================================================
// PRIVATE: Upload revision file (local + server)
// @param {File} file - The file to upload
// @param {string} draftId - Draft identifier
// @param {string} writerEmail - Writer's email
// @param {string} writerPseudonym - Writer's pseudonym
// @param {string} language - 'fr' or 'en'
// =================================================
async function uploadRevision(file, draftId, writerEmail, writerPseudonym, language) {
    // Save record locally (for recent documents list)
    saveUploadRecord(draftId, language, {
        filename: file.name,
        date: new Date().toISOString()
    });
    
    // Upload to server (fire and forget)
    await uploadRevisionOnServer(file, draftId, writerEmail, writerPseudonym, language);
}


// =================================================
// PRIVATE: Submit revision for an article
// @param {string} language - 'fr' or 'en'
// =================================================
async function submitRevision(language) {
    const isFrench = language === 'fr';
    const draftId = isFrench ? getCurrentFrenchDraftId() : getCurrentEnglishDraftId();
    
    // Validation: article selected
    if (!draftId) {
        alert(isFrench ? 'Veuillez sélectionner un article' : 'Please select an article');
        return;
    }
    
    // Get form values
    const wordsToday = parseInt(document.getElementById(`${language}WordsToday`).value);
    const comment = document.getElementById(`${language}Comment`).value;
    const fileInput = document.getElementById(`${language}File`);
    const readyForReview = document.getElementById(`${language}ReadyForReview`).checked;
    
    // Validation: valid word count
    if (isNaN(wordsToday) || wordsToday < 0) {
        alert(isFrench ? 'Veuillez entrer un nombre valide de mots' : 'Please enter a valid word count');
        return;
    }
    
    // Get writer info
    const writerEmail = getCurrentWriterEmail();
    const writerPseudonym = getCurrentWriterPseudonym();
    
    // Calculate new total words
    const existingProgress = getProgress(draftId, writerEmail);
    const currentWords = existingProgress ? existingProgress.words_written : 0;
    const newTotal = currentWords + wordsToday;
    
    // 1. Save progress
    const progressSaved = await saveProgress(draftId, newTotal, comment, writerEmail, writerPseudonym);
    if (!progressSaved) {
        alert(isFrench ? 'Erreur lors de la sauvegarde' : 'Error saving progress');
        return;
    }
    
    // 2. Handle "ready for review" toggle
    if (readyForReview) {
        const draft = getDraftById(draftId);
        if (draft && draft.review_status !== 'ready_for_review') {
            await updateDraftStatus(draftId, 'ready_for_review');
            
            // Send notification to reviewer
            const notified = await notifyReviewerOnServer(draftId, draft.title_fr || draft.title_en, writerPseudonym);
            if (!notified) {
                // Fallback to local notification
                const notificationContainer = document.getElementById('notificationArea');
                showLocalNotification(draft.title_fr || draft.title_en, writerPseudonym, notificationContainer);
            }
        }
    }
    
    // 3. Handle file upload (if any)
    if (fileInput.files.length > 0) {
        await uploadRevision(fileInput.files[0], draftId, writerEmail, writerPseudonym, language);
    }
    
    // 4. Show success feedback on button
    const submitBtn = isFrench 
        ? document.querySelector('#frenchSubmitForm .submit-btn') 
        : document.querySelector('#englishSubmitForm .submit-btn');
    const originalText = submitBtn.textContent;
    showSuccessMessage(submitBtn, originalText, isFrench ? '✓ Envoyé !' : '✓ Sent!');
    
    // 5. Clear form fields
    document.getElementById(`${language}WordsToday`).value = '';
    document.getElementById(`${language}Comment`).value = '';
    document.getElementById(`${language}File`).value = '';
    
    // 6. Refresh all displays
    if (isFrench) {
        await showFrenchArticleInfo(draftId);
        await updateRecentDocuments('fr', draftId);
    } else {
        await showEnglishArticleInfo(draftId);
        await updateRecentDocuments('en', draftId);
    }
    await displayAllDocuments();
    if (typeof showReviewerPanel === 'function') await showReviewerPanel();
}


// =================================================
// PUBLIC: Handle view document click (locks article)
// Called when user clicks "Voir le document" button
// @param {string} draftId - Draft identifier
// @param {Object} draft - Draft object with review_status
// =================================================
export async function onViewDocument(draftId, draft) {
    const writerEmail = getCurrentWriterEmail();
    
    // Only lock if article is not already in progress/ready/under review
    if (draft.review_status !== 'in_progress' && 
        draft.review_status !== 'ready_for_review' && 
        draft.review_status !== 'under_review') {
        
        // Lock the article for this writer
        await updateDraftStatus(draftId, 'in_progress');
        
        // Create initial progress entry if none exists
        const existingProgress = getProgress(draftId, writerEmail);
        if (!existingProgress) {
            await saveProgress(draftId, 0, 'Started working on this article', writerEmail, getCurrentWriterPseudonym());
        }
    }
}


