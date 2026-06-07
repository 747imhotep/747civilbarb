// =================================================
// CONFIGURATION FILE - CORRECTED
// config.js
// manage configuration for 
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 36 lines - 1.5 KB



// modules/config.js
export const REVIEWER_EMAIL = 'support@deadangles.org';

// Storage paths (web-accessible URLs)
export const STORAGE_BASE_URL = '/writer-files';
export const DRAFTS_URL = `${STORAGE_BASE_URL}/draft`;
export const AVAILABLE_URL = `${STORAGE_BASE_URL}/available`;
export const IN_PROGRESS_URL = `${STORAGE_BASE_URL}/in_progress`;
export const TO_REVIEW_URL = `${STORAGE_BASE_URL}/to-review`;

// Filesystem paths (for server operations if needed)
export const STORAGE_FS_PATH = '/home/deploy/747civilbarb/writer/workspace-9xK2mP/data/storage-folder';
export const REFERENCES_FILE = `${STORAGE_BASE_URL}/references.json`;

// Legacy paths (to be phased out)
export const LEGACY_DRAFTS_PATH = '/writer/workspace-9xK2mP/data/drafts';
export const LEGACY_UPLOADS_PATH = '/writer/uploads';

// API base URL
export const API_BASE_URL = "/api";

// API endpoints
export const ENDPOINTS = {
    updateDraftStatus: `${API_BASE_URL}/update-draft-status`,
    saveProgress: `${API_BASE_URL}/save-progress`,
    notifyReviewer: `${API_BASE_URL}/notify-reviewer`,
    uploadRevision: `${API_BASE_URL}/upload-revision`
};

// Paths to data files
export const DATA_PATHS = {
    drafts: '/writer/workspace-9xK2mP/data/drafts.json',
    progress: '/writer/workspace-9xK2mP/data/progress.json'
};

// Cloudflare Access configuration
export const CF_ACCESS = {
    loginUrl: 'https://deadangles.cloudflareaccess.com/#/NoAuth',
    identityEndpoint: '/cdn-cgi/access/get-identity'
};

// Configurable link to storage folder
export const STORAGE_FOLDER_PATH = 'workspace-9xK2mP/data/storage-folder'


