// =================================================
// DATA MODULE - Load and manage drafts & progress
// data.js
// manage data for drafts and progress with localstorage.
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 209 lines - Updated 2026-06-07

import { DATA_PATHS } from './config.js';
import { loadFromLocal, saveToLocal } from './storage.js';

// Global data arrays
export let draftsData = [];
export let progressData = [];

// Storage keys for localStorage backup
const DRAFTS_STORAGE_KEY = 'cob_drafts_backup';
const PROGRESS_STORAGE_KEY = 'cob_progress_backup';

/**
 * Load drafts from JSON file or backup
 * @returns {Promise<Array>} - Drafts array
 */
import { scanAvailableDocuments } from './file-scanner.js';

export let draftsData = [];

export async function loadDrafts() {
    try {
        // First try to load from dynamic scanner
        const scannedDocs = await scanAvailableDocuments();
        
        if (scannedDocs && scannedDocs.length > 0) {
            draftsData = scannedDocs;
            console.log('✅ Loaded drafts from dynamic scanner:', draftsData.length);
            return draftsData;
        }
        
        // Fallback to static drafts.json
        const response = await fetch(DATA_PATHS.drafts);
        if (response.ok) {
            const data = await response.json();
            draftsData = data.drafts || data;
            console.log('✅ Loaded drafts from drafts.json:', draftsData.length);
            return draftsData;
        }
    } catch (error) {
        console.error('Error loading drafts:', error);
    }
    
    draftsData = [];
    return [];
}

/**
 * Load drafts from localStorage backup
 * @returns {Array} - Drafts array from backup
 */
function loadDraftsFromBackup() {
    const backup = loadFromLocal(DRAFTS_STORAGE_KEY);
    if (backup && backup.length > 0) {
        draftsData = backup;
        console.log('📦 Loaded drafts from backup:', draftsData.length, 'articles');
        return draftsData;
    }
    draftsData = [];
    return [];
}

/**
 * Load progress from JSON file or backup
 * @returns {Promise<Array>} - Progress array
 */
export async function loadProgress() {
    try {
        console.log('📥 Loading progress from:', DATA_PATHS.progress);
        const response = await fetch(DATA_PATHS.progress);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📥 Progress.json loaded:', data);
            
            if (data && data.progress) {
                progressData = data.progress;
                // Save to localStorage as backup
                saveToLocal(PROGRESS_STORAGE_KEY, progressData);
                console.log('✅ Progress assigned:', progressData.length, 'entries');
                return progressData;
            } else if (Array.isArray(data)) {
                // If JSON is an array directly
                progressData = data;
                saveToLocal(PROGRESS_STORAGE_KEY, progressData);
                console.log('✅ Progress assigned (array format):', progressData.length, 'entries');
                return progressData;
            } else {
                console.error('❌ progress.json unexpected format');
                progressData = [];
                return [];
            }
        } else {
            console.error('❌ Failed to load progress.json:', response.status);
            return loadProgressFromBackup();
        }
    } catch (error) {
        console.error('❌ Error loading progress:', error);
        return loadProgressFromBackup();
    }
}

/**
 * Load progress from localStorage backup
 * @returns {Array} - Progress array from backup
 */
function loadProgressFromBackup() {
    const backup = loadFromLocal(PROGRESS_STORAGE_KEY);
    if (backup && backup.length > 0) {
        progressData = backup;
        console.log('📦 Loaded progress from backup:', progressData.length, 'entries');
        return progressData;
    }
    progressData = [];
    return [];
}

/**
 * Get progress for a specific writer and draft
 * @param {string} draftId - Draft identifier
 * @param {string} writerEmail - Writer's email
 * @returns {Object|null} - Progress object or null
 */
export function getProgress(draftId, writerEmail) {
    return progressData.find(p => p.draft_id === draftId && p.writer_email === writerEmail) || null;
}

/**
 * Update or create progress entry
 * @param {Object} progressEntry - Progress object
 */
export function updateProgress(progressEntry) {
    const existingIndex = progressData.findIndex(p => 
        p.draft_id === progressEntry.draft_id && 
        p.writer_email === progressEntry.writer_email
    );
    
    if (existingIndex >= 0) {
        progressData[existingIndex] = { ...progressEntry, last_update: new Date().toISOString() };
    } else {
        progressData.push({ ...progressEntry, last_update: new Date().toISOString() });
    }
    
    // Save to backup
    saveToLocal(PROGRESS_STORAGE_KEY, progressData);
}

/**
 * Get draft by ID
 * @param {string} draftId - Draft identifier
 * @returns {Object|null} - Draft object or null
 */
export function getDraftById(draftId) {
    return draftsData.find(d => d.id === draftId) || null;
}

/**
 * Get French drafts (unlocked only)
 * @returns {Array} - French drafts
 */
export function getFrenchDrafts() {
    return draftsData.filter(d => d.title_fr && d.status !== 'locked');
}

/**
 * Get English drafts (unlocked only)
 * @returns {Array} - English drafts
 */
export function getEnglishDrafts() {
    return draftsData.filter(d => d.title_en && d.status !== 'locked');
}

/**
 * Update draft status in local data
 * @param {string} draftId - Draft identifier
 * @param {string} status - New status
 */
export function updateLocalDraftStatus(draftId, status) {
    const draft = draftsData.find(d => d.id === draftId);
    if (draft) {
        draft.review_status = status;
        saveToLocal(DRAFTS_STORAGE_KEY, draftsData);
        console.log(`📝 Local draft ${draftId} status updated to: ${status}`);
    }
}

/**
 * Reload all data from server
 * @returns {Promise<{drafts: Array, progress: Array}>}
 */
export async function reloadAllData() {
    const drafts = await loadDrafts();
    const progress = await loadProgress();
    return { drafts, progress };
}


