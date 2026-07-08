// =================================================
// CONFIGURATION FILE - CORRECTED
// config.js
// manage configuration for 
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 47 lines - Last edited: 2026-06-08  01h00




export const REVIEWER_EMAIL = 'support@deadangles.org';


// API Endpoints - MUST MATCH what api.js expects
export const ENDPOINTS = {
    updateDraftStatus: '/api/writer/update-status',
    saveProgress: '/api/writer/save-progress',
    notifyReviewer: '/api/writer/notify-reviewer',
    uploadRevision: '/api/writer/upload-revision'
};

// Data paths (relative to web root)
export const DATA_PATHS = {
    drafts: 'https://deadanglesinstitute.org/writer/workspace-9xK2mP/data/drafts.json',
    progress: 'https://deadanglesinstitute.org/writer/workspace-9xK2mP/data/progress.json'
};

// Storage folder configuration
export const STORAGE_FOLDER_PATH = '/writer/workspace-9xK2mP/data/storage-folder';
export const REFERENCES_FILE = `${STORAGE_FOLDER_PATH}/references.json`;

// File type mappings
export const ALLOWED_FILE_TYPES = ['.docx', '.md', '.txt', '.pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Document status constants
export const DOCUMENT_STATUS = {
    AVAILABLE: 'available',
    IN_PROGRESS: 'in_progress',
    READY_FOR_REVIEW: 'ready_for_review',
    UNDER_REVIEW: 'under_review',
    LOCKED_BY_OTHER: 'locked_by_other',
    PUBLISHED_FREE: 'published_free',
    PUBLISHED_PREMIUM: 'published_premium'
};


