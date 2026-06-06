// =================================================
// REFERENCES MANAGER - Document status tracking
// Manages JSON file for real-time document references
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 264 lines creaeted on 2026-06-06 at 20h15



import { getCurrentWriterEmail, getCurrentWriterPseudonym } from './auth.js';
import { getDraftById, updateLocalDraftStatus } from './data.js';
import { getRefColorClass } from './utils.js';

// Configuration
const STORAGE_BASE = 'workspace-9xK2mP/data/storage-folder/'; // Change to your actual path
const REFERENCES_FILE = `${STORAGE_BASE}/references.json`;

// In-memory cache
let referencesCache = new Map();
let isInitialized = false;

/**
 * Load references from JSON file
 */
export async function loadReferences() {
    try {
        const response = await fetch(REFERENCES_FILE);
        if (response.ok) {
            const data = await response.json();
            referencesCache.clear();
            Object.entries(data).forEach(([id, ref]) => {
                referencesCache.set(id, ref);
            });
            console.log(`📚 Loaded ${referencesCache.size} document references`);
            isInitialized = true;
            return data;
        } else if (response.status === 404) {
            console.log('📝 No references file yet, will create on first save');
            isInitialized = true;
            return {};
        }
    } catch (error) {
        console.error('Failed to load references:', error);
    }
    return {};
}

/**
 * Save references to JSON file
 */
async function saveReferences() {
    try {
        const data = {};
        for (const [id, ref] of referencesCache) {
            data[id] = ref;
        }
        
        const response = await fetch(REFERENCES_FILE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log(`💾 Saved ${referencesCache.size} references`);
            return true;
        }
    } catch (error) {
        console.error('Failed to save references:', error);
    }
    return false;
}

/**
 * Get document reference object
 */
export function getDocumentReference(draftId) {
    if (!referencesCache.has(draftId)) {
        // Initialize default reference
        referencesCache.set(draftId, {
            draftId: draftId,
            currentStatus: 'available',
            lockedBy: null,
            lockedAt: null,
            isViewing: false,
            readyForReview: false,
            percentComplete: 0,
            lastUpdated: new Date().toISOString(),
            viewHistory: []
        });
    }
    return referencesCache.get(draftId);
}

/**
 * Get REF column color class for a document
 */
export async function getDocumentRefColor(draftId) {
    const draft = getDraftById(draftId);
    if (!draft) return 'ref-green';
    
    const writerEmail = getCurrentWriterEmail();
    const ref = getDocumentReference(draftId);
    
    // Determine effective status for coloring
    let effectiveStatus = draft.review_status;
    
    // Override if current writer is viewing this document
    if (ref.isViewing && ref.lockedBy === writerEmail) {
        effectiveStatus = 'in_progress';
    }
    // If locked by another writer
    else if (ref.lockedBy && ref.lockedBy !== writerEmail && ref.isViewing) {
        effectiveStatus = 'locked_by_other';
    }
    
    return getRefColorClass(effectiveStatus);
}

/**
 * Get status text for display
 */
export function getDocumentStatusText(draftId, language = 'fr') {
    const ref = getDocumentReference(draftId);
    const writerEmail = getCurrentWriterEmail();
    
    if (ref.isViewing && ref.lockedBy === writerEmail) {
        return language === 'fr' ? 'En cours (vous)' : 'In progress (you)';
    }
    if (ref.isViewing && ref.lockedBy !== writerEmail) {
        return language === 'fr' ? 'Occupé par un autre' : 'Locked by another';
    }
    if (ref.readyForReview) {
        return language === 'fr' ? 'Prêt pour relecture' : 'Ready for review';
    }
    return language === 'fr' ? 'Disponible' : 'Available';
}

/**
 * Mark document as viewed (locked by current writer)
 */
export async function markDocumentAsViewed(draftId) {
    const writerEmail = getCurrentWriterEmail();
    const writerPseudonym = getCurrentWriterPseudonym();
    const ref = getDocumentReference(draftId);
    
    const now = new Date().toISOString();
    
    ref.currentStatus = 'in_progress';
    ref.lockedBy = writerEmail;
    ref.lockedAt = now;
    ref.isViewing = true;
    ref.lastUpdated = now;
    ref.viewHistory.push({
        writerEmail: writerEmail,
        writerPseudonym: writerPseudonym,
        action: 'view',
        timestamp: now
    });
    
    // Limit history to last 20 entries
    if (ref.viewHistory.length > 20) {
        ref.viewHistory = ref.viewHistory.slice(-20);
    }
    
    referencesCache.set(draftId, ref);
    await saveReferences();
    
    // Update local draft status
    updateLocalDraftStatus(draftId, 'in_progress');
    
    console.log(`🔒 Document ${draftId} locked by ${writerEmail}`);
}

/**
 * Release document lock
 */
export async function releaseDocumentLock(draftId) {
    const ref = getDocumentReference(draftId);
    
    ref.isViewing = false;
    ref.lastUpdated = new Date().toISOString();
    
    referencesCache.set(draftId, ref);
    await saveReferences();
    
    console.log(`🔓 Document ${draftId} unlocked`);
}

/**
 * Update ready for review status
 */
export async function setReadyForReview(draftId, isReady) {
    const ref = getDocumentReference(draftId);
    ref.readyForReview = isReady;
    ref.lastUpdated = new Date().toISOString();
    
    referencesCache.set(draftId, ref);
    await saveReferences();
    
    // Update local draft status
    const newStatus = isReady ? 'ready_for_review' : 'in_progress';
    updateLocalDraftStatus(draftId, newStatus);
}

/**
 * Update progress percentage
 */
export async function updateProgress(draftId, percentComplete) {
    const ref = getDocumentReference(draftId);
    ref.percentComplete = percentComplete;
    ref.lastUpdated = new Date().toISOString();
    
    referencesCache.set(draftId, ref);
    await saveReferences();
}

/**
 * Check if document is locked by another writer
 */
export function isLockedByOther(draftId) {
    const writerEmail = getCurrentWriterEmail();
    const ref = getDocumentReference(draftId);
    
    return ref.isViewing && ref.lockedBy && ref.lockedBy !== writerEmail;
}

/**
 * Initialize references on dashboard load
 */
export async function initReferences() {
    await loadReferences();
}

/**
 * Get all references for debugging/admin
 */
export function getAllReferences() {
    const data = {};
    for (const [id, ref] of referencesCache) {
        data[id] = ref;
    }
    return data;
}

// Clean up stale locks (older than 2 hours) - call periodically
export async function cleanStaleLocks() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    let updated = false;
    
    for (const [id, ref] of referencesCache) {
        if (ref.isViewing && ref.lockedAt && new Date(ref.lockedAt) < twoHoursAgo) {
            console.log(`🧹 Cleaning stale lock for ${id}`);
            ref.isViewing = false;
            referencesCache.set(id, ref);
            updated = true;
        }
    }
    
    if (updated) {
        await saveReferences();
    }
}




