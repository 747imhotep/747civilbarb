// =================================================
// MAIN ENTRY POINT - Writer Dashboard
// writer-main.js
// Civilisation ou Barbarie
// =================================================
// 244 lines - Updated: 2026-07-16 - Added reviewer badge and title change

// Import modules from the modules folder - FIXED PATHS
import { REVIEWER_EMAIL } from './modules/config.js';
import { getWriterIdentity, getCurrentWriterEmail, getCurrentWriterPseudonym, displayWriterInfo } from './modules/auth.js';
import { loadDrafts, loadProgress, draftsData, progressData } from './modules/data.js';
import { loadFromLocal, saveToLocal } from './modules/storage.js';
import { initLogoutButton, setLogoutButtonVisibility } from './modules/logout.js';
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
import { initReferences, cleanStaleLocks } from './modules/references-manager.js';

// =================================================
// HELPER FUNCTIONS
// =================================================

/**
 * Add reviewer badge to the header
 */
function addReviewerBadge() {
    const header = document.querySelector('.dashboard-header');
    if (!header) return;

    // Check if badge already exists
    if (document.getElementById('reviewerBadge')) return;

    const h1 = header.querySelector('h1');
    if (!h1) return;

    const badge = document.createElement('span');
    badge.id = 'reviewerBadge';
    badge.className = 'reviewer-badge';
    badge.textContent = '🔍 REVIEWER';
    h1.appendChild(badge);
}

// =================================================
// HANDLERS
// =================================================

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
                🔐 Accès protégé par Cloudflare.
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
    
    loadBackupData();
    
    const email = await getWriterIdentity();
    if (!email) {
        console.log('❌ Writer not identified');
        showLoginError();
        return;
    }
    
    console.log('✅ Writer email:', getCurrentWriterEmail());
    console.log('✅ Writer pseudonym:', getCurrentWriterPseudonym());
    
    const writerInfoContainer = document.getElementById('writerInfo');
    displayWriterInfo(writerInfoContainer);
    
    await loadDrafts();
    await loadProgress();
    
    // Initialize references manager (creates/loads references.json)
    await initReferences();
    await cleanStaleLocks();  // Clean any orphaned locks from previous sessions
    
    setDraftIdGetters(getCurrentFrenchDraftId, getCurrentEnglishDraftId);
    
    populateDropdowns();
    attachDropdownListeners();
    setupSubmitForms();
    
    const notificationContainer = document.getElementById('notificationArea');
    setupToggleListeners(notificationContainer);
    
    await displayAllDocuments();
    
    // ===================================================
    // REVIEWER PANEL
    // ===================================================

    if (isReviewer()) {
        // Change title to REVIEWER WORKSPACE
        const titleElement = document.querySelector('.workspace-title h1');
        if (titleElement) {
            titleElement.textContent = '📋 REVIEWER WORKSPACE';
            titleElement.style.color = '#6c63ff';
        }
        
        // Add reviewer badge to header
        addReviewerBadge();
        
        // Add reviewer class to body for CSS styling
        document.body.classList.add('reviewer-mode');
        
        await showReviewerPanel();
        console.log('🔍 Reviewer mode enabled');
    } else {
        console.log('👤 Writer mode (not reviewer)');
    }
    
    // ===================================================
    // INITIALIZE LOGOUT BUTTON
    // =================================================
    initLogoutButton();
    setLogoutButtonVisibility(true);

    console.log('🎉 Dashboard initialized successfully!');
}

// Start the dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriterDashboard);
} else {
    initWriterDashboard();
}


