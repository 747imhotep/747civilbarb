// =================================================
// FORMS MODULE - Form submission and toggle handling
// forms.js
// 
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 343 lines - UPDATED 2026-06-08 at 14h29



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
                await populateFrenchDropdown();
                await populateEnglishDropdown();
                
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
                await populateFrenchDropdown();
                await populateEnglishDropdown();
                
                if (typeof showReviewerPanel === 'function') await showReviewerPanel();
                console.log(`📝 English article status updated to: ${newStatus}`);
            }
        });
    }
}


// =================================================
// PUBLIC: Setup form submission handlers
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
    
    // Update server
    await saveProgressOnServer(progressEntry);
    
    return true;
}


// =================================================
// PRIVATE: Upload revision file (local + server)
// =================================================
async function uploadRevision(file, draftId, writerEmail, writerPseudonym, language) {
    // Save record locally (for recent documents list)
    saveUploadRecord(draftId, language, {
        filename: file.name,
        date: new Date().toISOString()
    });
    
    // Upload to server
    await uploadRevisionOnServer(file, draftId, writerEmail, writerPseudonym, language);
}


// =================================================
// PRIVATE: Submit revision for an article
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
            
            // Update references manager
            await setReadyForReview(draftId, true);
            
            // Move document to to-review folder
            if (draft && draft.filename) {
                await moveDocument(draft.filename, 'step2-in-progress', 'step3-to-review', draftId);
            }
            
            // Send notification to reviewer
            const notified = await notifyReviewerOnServer(draftId, draft.title_fr || draft.title_en, writerPseudonym);
            if (!notified) {
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
    await populateFrenchDropdown();
    await populateEnglishDropdown();
    
    if (typeof showReviewerPanel === 'function') await showReviewerPanel();
}


// =================================================
// PUBLIC: Handle view document click (locks article)
// Called when user clicks "Voir le document" button
// =================================================
export async function onViewDocument(draftId, draft) {
    const writerEmail = getCurrentWriterEmail();
    
    // Mark document as viewed in references manager
    await markDocumentAsViewed(draftId);
    
    // Move document from available to in_progress folder
    if (draft && draft.filename) {
        await moveDocument(draft.filename, 'step1-available', 'step2-in-progress', draftId);
    }
    
    // Update the REF color in the table without full refresh
    try {
        await updateSingleDocumentRefColor(draftId);
    } catch (e) {
        console.log('Could not update single ref color, will refresh full table');
        await displayAllDocuments();
    }
    
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
    
    // Refresh dropdowns to update available lists
    await populateFrenchDropdown();
    await populateEnglishDropdown();
}

