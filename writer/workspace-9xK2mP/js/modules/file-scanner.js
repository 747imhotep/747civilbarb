// =================================================
// FILE SCANNER - Auto-detect documents in storage folders
// Dynamically scans step1-available folder for documents
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 140 lines Updated: 2026-07-08 - Returns empty array when API fails (fallback only)

/**
 * Scan available folder and build document list dynamically
 * This is a fallback when drafts.json is not available
 * @returns {Promise<Array>} - List of available documents
 */
export async function scanAvailableDocuments() {
    try {
        console.log('📁 Scanning for available documents...');
        const response = await fetch('/api/writer/scan-documents');
        
        if (response.ok) {
            const data = await response.json();
            console.log(`📁 Found ${data.length} documents in available folder`);
            return data;
        } else {
            console.log('⚠️ Document scanner API unavailable, using drafts.json instead');
            return [];
        }
    } catch (error) {
        console.log('⚠️ Document scanner error, using drafts.json instead');
        return [];
    }
}


/**
 * Parse filename to extract metadata
 * Expected format: ID_Title_Language.docx
 * Example: draft_01_oot-stade-singe_fr.md
 * @param {string} filename - File name to parse
 * @returns {Object} - Parsed metadata
 */
export function parseDocument(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('_');
    
    // Detect language from filename
    let language = 'fr';
    if (filename.includes('_en_') || filename.endsWith('_en')) {
        language = 'en';
    } else if (filename.includes('_fr_') || filename.endsWith('_fr')) {
        language = 'fr';
    }
    
    // Build title from parts (skip the ID if present)
    let title = nameWithoutExt;
    if (parts.length > 1) {
        // Remove the first part if it looks like an ID
        const firstPart = parts[0];
        if (firstPart.match(/^(draft|doc|art)[_-]?\d+$/i)) {
            title = parts.slice(1).join(' ');
        }
    }
    
    // Clean up title (replace underscores and hyphens with spaces)
    title = title.replace(/[_\-]/g, ' ').trim();
    
    return {
        id: parts[0] || filename.replace(/\.[^/.]+$/, ''),
        originalFilename: filename,
        language: language,
        title_fr: language === 'fr' ? title : title,
        title_en: language === 'en' ? title : title,
        extension: filename.split('.').pop()
    };
}

/**
 * Move a document to a different folder
 * @param {string} filename - File name
 * @param {string} sourceFolder - Source folder name (step1-available, step2-in-progress, etc.)
 * @param {string} targetFolder - Target folder name
 * @param {string} draftId - Document ID
 * @returns {Promise<boolean>} - Success status
 */
export async function moveDocument(filename, sourceFolder, targetFolder, draftId) {
    try {
        const response = await fetch('/api/writer/move-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: filename,
                sourceFolder: sourceFolder,
                targetFolder: targetFolder,
                draftId: draftId
            })
        });
        
        if (response.ok) {
            console.log(`📦 Moved ${filename} to ${targetFolder}`);
            return true;
        } else {
            console.error('❌ Failed to move document:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to move document:', error);
        return false;
    }
}

/**
 * Get the current folder for a document based on its status
 * @param {Object} reference - Document reference from references.json
 * @returns {string} - Folder name
 */
export function getFolderByStatus(reference) {
    if (reference.readyForReview) {
        return 'step3-to-review';
    }
    if (reference.isViewing && reference.lockedBy) {
        return 'step2-in-progress';
    }
    return 'step1-available';
}

/**
 * Check if a file exists in a specific folder
 * @param {string} filename - File name
 * @param {string} folder - Folder name
 * @returns {Promise<boolean>} - True if exists
 */
export async function fileExists(filename, folder) {
    try {
        const response = await fetch(`/api/writer/check-file?filename=${encodeURIComponent(filename)}&folder=${folder}`);
        return response.ok && response.status === 200;
    } catch (error) {
        return false;
    }
}


