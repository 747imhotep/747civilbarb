// =================================================
// MAIN ENTRY POINT - Writer Dashboard
// Civilisation ou Barbarie
// =================================================

// Import modules
import { REVIEWER_EMAIL } from './modules/config.js';
import { getWriterIdentity, getCurrentWriterEmail, getCurrentWriterPseudonym, displayWriterInfo } from './modules/auth.js';
import { loadDrafts, loadProgress, draftsData, progressData } from './modules/data.js';
import { loadFromLocal, saveToLocal } from './modules/storage.js';
import { 
    populateFrenchDropdown, 
    populateEnglishDropdown, 
    showFrenchArticleInfo, 
    showEnglishArticleInfo,
    showFrenchViewDocumentButton,
    showEnglishViewDocumentButton,
    clearFrenchArticleInfo,
    clearEnglishArticleInfo,
    clearFrenchViewDocumentButton,
    clearEnglishViewDocumentButton,
    updateRecentDocuments,
    displayAllDocuments,
    updateSelectedArticle,
    clearSelectedArticle,
    getCurrentFrenchDraftId,
    getCurrentEnglishDraftId,
    setCurrentFrenchDraftId,
    setCurrentEnglishDraftId
} from './modules/ui.js';
import { 
    setupSubmitForms, 
    setupToggleListeners, 
    setDraftIdGetters,
    onViewDocument 
} from './modules/forms.js';
import { showReviewerPanel, isReviewer } from './modules/reviewer.js';

/**
 * Handle French article selection change
 */
async function handleFrenchChange(e) {
    const draftId = e.target.value;
    setCurrentFrenchDraftId(draftId);
    
    if (draftId) {
        await showFrenchArticleInfo(draftId);
        showFrenchViewDocumentButton(draftId, onViewDocument);
        updateSelectedArticle(draftId, 'fr');
        await updateRecentDocuments('fr', draftId);
    } else {
        clearFrenchArticleInfo();
        clearFrenchViewDocumentButton();
        clearSelectedArticle('fr');
    }
}

/**
 * Handle English article selection change
 */
async function handleEnglishChange(e) {
    const draftId = e.target.value;
    setCurrentEnglishDraftId(draftId);
    
    if (draftId) {
        await showEnglishArticleInfo(draftId);
        showEnglishViewDocumentButton(draftId, onViewDocument);
        updateSelectedArticle(draftId, 'en');
        await updateRecentDocuments('en', draftId);
    } else {
        clearEnglishArticleInfo();
        clearEnglishViewDocumentButton();
        clearSelectedArticle('en');
    }
}

/**
 * Attach event listeners to dropdowns
 */
function attachDropdownListeners() {
    const frenchSelect = document.getElementById('frenchArticleSelect');
    const englishSelect = document.getElementById('englishArticleSelect');
    
    if (frenchSelect) {
        frenchSelect.removeEventListener('change', handleFrenchChange);
        frenchSelect.addEventListener('change', handleFrenchChange);
    }
    
    if (englishSelect) {
        englishSelect.removeEventListener('change', handleEnglishChange);
        englishSelect.addEventListener('change', handleEnglishChange);
    }
}

/**
 * Populate both dropdowns
 */
function populateDropdowns() {
    populateFrenchDropdown();
    populateEnglishDropdown();
}

/**
 * Load backup data from localStorage on startup
 */
function loadBackupData() {
    const savedDrafts = loadFromLocal('cob_drafts_backup');
    const savedProgress = loadFromLocal('cob_progress_backup');
    
    if (savedDrafts && (!draftsData || draftsData.length === 0)) {
        console.log('📦 Found drafts backup, will use if network fails');
    }
    
    if (savedProgress && (!progressData || progressData.length === 0)) {
        console.log('📦 Found progress backup, will use if network fails');
    }
}

/**
 * Show login error if user is not authenticated
 */
function showLoginError() {
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
}

/**
 * Initialize the dashboard
 */
async function initWriterDashboard() {
    console.log('🚀 Initializing writer dashboard...');
    
    // Load backup data first
    loadBackupData();
    
    // Get writer identity
    const email = await getWriterIdentity();
    if (!email) {
        console.log('❌ Writer not identified');
        showLoginError();
        return;
    }
    
    console.log('✅ Writer email:', getCurrentWriterEmail());
    console.log('✅ Writer pseudonym:', getCurrentWriterPseudonym());
    
    // Display writer info in header
    const writerInfoContainer = document.getElementById('writerInfo');
    displayWriterInfo(writerInfoContainer);
    
    // Load data from server
    await loadDrafts();
    await loadProgress();
    
    // Set up draft ID getters for forms module
    setDraftIdGetters(getCurrentFrenchDraftId, getCurrentEnglishDraftId);
    
    // Populate dropdowns
    populateDropdowns();
    
    // Attach dropdown event listeners
    attachDropdownListeners();
    
    // Setup form submissions
    setupSubmitForms();
    
    // Setup toggle listeners
    const notificationContainer = document.getElementById('notificationArea');
    setupToggleListeners(notificationContainer);
    
    // Display all documents table
    await displayAllDocuments();
    
    // Show reviewer panel if current user is reviewer
    if (isReviewer()) {
        await showReviewerPanel();
        console.log('🔍 Reviewer mode enabled');
    }
    
    console.log('🎉 Dashboard initialized successfully!');
}

// Start the dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriterDashboard);
} else {
    initWriterDashboard();
}