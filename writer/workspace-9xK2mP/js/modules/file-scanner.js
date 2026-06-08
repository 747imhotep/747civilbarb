// =================================================
// FILE SCANNER - Auto-detect documents in storage folders
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 43 lines created on 2026-06-08 at 13h52

/**
 * Scan available folder and build document list dynamically
 * This replaces static drafts.json
 */
export async function scanAvailableDocuments() {
    try {
        const response = await fetch('/api/writer/scan-documents');
        if (response.ok) {
            const data = await response.json();
            console.log(`📁 Found ${data.length} documents in available folder`);
            return data;
        }
    } catch (error) {
        console.error('Failed to scan documents:', error);
    }
    return [];
}

/**
 * Parse filename to extract metadata
 * Expected format: ID_Title_Language.docx
 * Example: draft_01_oot-stade-singe_fr.md
 */
export function parseDocument(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('_');
    
    return {
        id: parts[0] || filename,
        title_fr: parts.slice(1).join(' '),
        title_en: parts.slice(1).join(' '),
        language: parts.includes('fr') ? 'fr' : 'en',
        originalFilename: filename
    };
}


