// =================================================
// STORAGE MODULE - SessionStorage preferred
// Fallback to localStorage if sessionStorage is unavailable
// storage.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 91 lines - Last edited: 2026-06-06 00h15



/**
 * Save data to storage (tries sessionStorage first, then localStorage)
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @param {boolean} useLocal - Force use localStorage
 */
export function saveToLocal(key, data, useLocal = false) {
    try {
        const serialized = JSON.stringify(data);
        if (useLocal) {
            localStorage.setItem(key, serialized);
        } else {
            sessionStorage.setItem(key, serialized);
        }
        console.log(`💾 Saved to ${useLocal ? 'local' : 'session'}Storage: ${key}`);
    } catch (error) {
        console.error(`❌ Failed to save (${key}):`, error);
    }
}

/**
 * Load data from storage (checks sessionStorage first, then localStorage)
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @returns {any}
 */
export function loadFromLocal(key, defaultValue = null) {
    try {
        // Try sessionStorage first
        let serialized = sessionStorage.getItem(key);
        if (serialized) {
            console.log(`📦 Loaded from sessionStorage: ${key}`);
            return JSON.parse(serialized);
        }
        // Fallback to localStorage
        serialized = localStorage.getItem(key);
        if (serialized) {
            console.log(`📦 Loaded from localStorage: ${key}`);
            return JSON.parse(serialized);
        }
    } catch (error) {
        console.error(`❌ Failed to load (${key}):`, error);
    }
    return defaultValue;
}

export function removeFromLocal(key) {
    try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
    } catch (error) {
        console.error(`❌ Failed to remove (${key}):`, error);
    }
}

export function clearAllWriterData() {
    const keys = ['cob_writer_pseudonym', 'cob_drafts_backup', 'cob_progress_backup'];
    keys.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    });
}

export function saveUploadRecord(draftId, language, uploadRecord) {
    const key = `cob_uploads_${draftId}_${language}`;
    const existing = loadFromLocal(key, []);
    existing.unshift(uploadRecord);
    saveToLocal(key, existing.slice(0, 10));
}

export function getUploadRecords(draftId, language) {
    const key = `cob_uploads_${draftId}_${language}`;
    return loadFromLocal(key, []);
}

export function clearUploadRecords(draftId, language) {
    const key = `cob_uploads_${draftId}_${language}`;
    removeFromLocal(key);
}



