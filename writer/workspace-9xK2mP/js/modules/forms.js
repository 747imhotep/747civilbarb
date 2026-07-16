// =================================================
// FORMS MODULE - Form submission and toggle handling
// forms.js
// 
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 343 lines - UPDATED 2026-06-08 at 14h29
// Updated: 2026-07-17 - Added onViewDocument function


// Data functions
import { updateProgress, updateLocalDraftStatus, getDraftById, getProgress, refreshDrafts } from './data.js';

// Authentication functions
import { getCurrentWriterEmail, getCurrentWriterPseudonym } from './auth.js';

// API functions (server sync)
import { saveProgressOnServer, updateDraftStatusOnServer, notifyReviewerOnServer, uploadRevisionOnServer } from './api.js';

// Storage functions (local)
import { saveUploadRecord } from './storage.js';

// UI functions
import { showFrenchArticleInfo, showEnglishArticleInfo, displayAllDocuments, updateRecentDocuments, updateSingleDocumentRefColor, populateFrenchDropdown, populateEnglishDropdown } from './ui.js';

// Reviewer functions
import { showReviewerPanel } from './reviewer.js';

// Utility functions
import { showSuccessMessage, showLocalNotification } from './utils.js';

// References manager
import { markDocumentAsViewed, setReadyForReview } from './references-manager.js';

// File scanner for moving documents
import { moveDocument } from './file-scanner.js';


// =================================================
// STATE - Current draft IDs (set by main)
// =================================================
let getCurrentFrenchDraftId = null;
let getCurrentEnglishDraftId = null;


// =================================================
// PUBLIC: Set draft ID getter functions
// Called by writer-main.js during initialization
// =================================================
export function setDraftIdGetters(getFrenchId, getEnglishId) {
    getCurrentFrenchDraftId = getFrenchId;
    getCurrentEnglishDraftId = getEnglishId;
}


// =================================================
// PUBLIC: Handle document view (lock and track)
// =================================================

/**
 * Handle document view - locks the document and moves it to in-progress
 * @param {string} draftId - Draft identifier
 * @param {Object} draft - Draft object
 */
export async function onViewDocument(draftId, draft) {
    console.log('🔍 onViewDocument called for:', draftId);
    
    const writerEmail = getCurrentWriterEmail();
    const writerPseudonym = getCurrentWriterPseudonym();
    
    if (!writerEmail) {
        console.error('❌ No writer email found');
        return;
    }
    
    try {
        // 1. Mark document as viewed in references
        console.log(`🔒 Locking document: ${draftId} for ${writerEmail}`);
        await markDocumentAsViewed(draftId, writerEmail, writerPseudonym);
        
        // 2. Update local status
        updateLocalDraftStatus(draftId, 'in_progress');
        
        // 3. Update server status
        await updateDraftStatusOnServer(draftId, 'in_progress', writerEmail);
        
        // 4. Move document to step2-in-progress folder
        if (draft && draft.filename) {
            console.log(`📦 Moving document to step2-in-progress: ${draft.filename}`);
            await moveDocument(draft.filename, 'step1-drafts-accessible', 'step2-in-progress', draftId);
        } else {
            // Try to get filename from draft path
            const filename = draft.path ? draft.path.split('/').pop() : null;
            if (filename) {
                console.log(`📦 Moving document to step2-in-progress: ${filename}`);
                await moveDocument(filename, 'step1-drafts-accessible', 'step2-in-progress', draftId);
            } else {
                console.warn('⚠️ Could not determine filename for moving');
            }
        }
        
        // 5. Refresh displays
        await displayAllDocuments();
        await showReviewerPanel();
        
        console.log(`✅ Document ${draftId} locked and moved to in-progress`);
    } catch (error) {
        console.error('❌ Error in onViewDocument:', error);
    }
}


// =================================================
// PRIVATE: Update draft status (local + server)
// =================================================
async function updateDraftStatus(draftId, status) {
    const writerEmail = getCurrentWriterEmail();
    
    // Update local data
    updateLocalDraftStatus(draftId, status);
    
    // Update server
    await updateDraftStatusOnServer(draftId, status, writerEmail);
}


// =================================================
// PUBLIC: Setup toggle (Ready for Review) listeners
// =================================================
export function setupToggleListeners(notificationContainer) {
    const frenchToggle = document.getElementById('frenchReadyForReview');
    const englishToggle = document.getElementById('englishReadyForReview');
    
    // French toggle handler
    if (frenchToggle) {
        frenchToggle.addEventListener('change', async (e) => {
            const draftId = getCurrentFrenchDraftId ? getCurrentFrenchDraftId() : null;
            if (draftId) {
                const isReady = e.target.checked;
                const newStatus = isReady ? 'ready_for_review' : 'in_progress';
                
                await updateDraftStatus(draftId, newStatus);
                
                // Update references manager
                await setReadyForReview(draftId, isReady);
                
                // If marked as ready, move document to to-review folder
                if (isReady) {
                    const draft = getDraftById(draftId);
                    if (draft && draft.filename) {
                        await moveDocument(draft.filename, 'step2-in-progress', 'step3-to-review', draftId);
                    }
                }
                
                await showFrenchArticleInfo(draftId);
                await displayAllDocuments();
                await showReviewerPanel();
                
                const message = isReady ? '📤 Article prêt pour relecture !' : '✏️ Article remis en cours de rédaction.';
                showLocalNotification(notificationContainer, message, 'info');
            }
        });
    }
    
    // English toggle handler
    if (englishToggle) {
        englishToggle.addEventListener('change', async (e) => {
            const draftId = getCurrentEnglishDraftId ? getCurrentEnglishDraftId() : null;
            if (draftId) {
                const isReady = e.target.checked;
                const newStatus = isReady ? 'ready_for_review' : 'in_progress';
                
                await updateDraftStatus(draftId, newStatus);
                
                // Update references manager
                await setReadyForReview(draftId, isReady);
                
                // If marked as ready, move document to to-review folder
                if (isReady) {
                    const draft = getDraftById(draftId);
                    if (draft && draft.filename) {
                        await moveDocument(draft.filename, 'step2-in-progress', 'step3-to-review', draftId);
                    }
                }
                
                await showEnglishArticleInfo(draftId);
                await displayAllDocuments();
                await showReviewerPanel();
                
                const message = isReady ? '📤 Article ready for review!' : '✏️ Article back in progress.';
                showLocalNotification(notificationContainer, message, 'info');
            }
        });
    }
}


// =================================================
// PUBLIC: Setup submit forms
// =================================================
export function setupSubmitForms() {
    const frenchForm = document.getElementById('frenchSubmitForm');
    const englishForm = document.getElementById('englishSubmitForm');
    
    if (frenchForm) {
        frenchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit('fr');
        });
    }
    
    if (englishForm) {
        englishForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit('en');
        });
    }
}


// =================================================
// PRIVATE: Handle form submission
// =================================================
async function handleSubmit(language) {
    const isFrench = language === 'fr';
    const prefix = isFrench ? 'french' : 'english';
    
    // Get draft ID
    let draftId = null;
    if (isFrench && getCurrentFrenchDraftId) {
        draftId = getCurrentFrenchDraftId();
    } else if (!isFrench && getCurrentEnglishDraftId) {
        draftId = getCurrentEnglishDraftId();
    }
    
    if (!draftId) {
        alert(isFrench ? 'Veuillez sélectionner un article.' : 'Please select an article.');
        return;
    }
    
    const draft = getDraftById(draftId);
    if (!draft) {
        alert(isFrench ? 'Article non trouvé.' : 'Article not found.');
        return;
    }
    
    // Get form data
    const wordsInput = document.getElementById(`${prefix}WordsToday`);
    const commentInput = document.getElementById(`${prefix}Comment`);
    const fileInput = document.getElementById(`${prefix}File`);
    const readyCheckbox = document.getElementById(`${prefix}ReadyForReview`);
    
    const wordsWritten = parseInt(wordsInput.value) || 0;
    const comment = commentInput.value || '';
    const file = fileInput.files[0];
    const readyForReview = readyCheckbox ? readyCheckbox.checked : false;
    
    // Validate
    if (wordsWritten <= 0) {
        alert(isFrench ? 'Veuillez indiquer le nombre de mots écrits.' : 'Please enter the number of words written.');
        return;
    }
    
    // Get writer info
    const writerEmail = getCurrentWriterEmail();
    const writerPseudonym = getCurrentWriterPseudonym();
    
    // Prepare progress data
    const progressData = {
        draft_id: draftId,
        writer_email: writerEmail,
        writer_pseudonym: writerPseudonym,
        words_written: wordsWritten,
        comment: comment,
        ready_for_review: readyForReview,
        last_update: new Date().toISOString()
    };
    
    try {
        // Save progress locally
        updateProgress(progressData);
        
        // Save progress to server
        await saveProgressOnServer(progressData);
        
        // Update draft status if ready for review
        if (readyForReview) {
            await updateDraftStatus(draftId, 'ready_for_review');
            await setReadyForReview(draftId, true);
            
            // Move document to step3-to-review
            if (draft.filename) {
                await moveDocument(draft.filename, 'step2-in-progress', 'step3-to-review', draftId);
            }
            
            // Notify reviewer
            await notifyReviewerOnServer(draft.title_fr || draft.title_en || draftId, writerPseudonym);
        }
        
        // Upload file if present
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('draft_id', draftId);
            formData.append('writer_email', writerEmail);
            formData.append('language', language);
            
            await uploadRevisionOnServer(formData);
            
            // Save upload record locally
            saveUploadRecord(draftId, language, file.name);
            
            // Update recent documents
            await updateRecentDocuments(language, draftId);
        }
        
        // Show success message
        const message = isFrench 
            ? '✅ Révision envoyée avec succès !' 
            : '✅ Revision submitted successfully!';
        alert(message);
        
        // Reset form
        wordsInput.value = '';
        commentInput.value = '';
        fileInput.value = '';
        if (readyCheckbox) readyCheckbox.checked = false;
        
        // Refresh displays
        await displayAllDocuments();
        await showReviewerPanel();
        
        if (isFrench) {
            await showFrenchArticleInfo(draftId);
        } else {
            await showEnglishArticleInfo(draftId);
        }
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        alert(isFrench ? '❌ Erreur lors de l\'envoi.' : '❌ Error submitting.');
    }
}



