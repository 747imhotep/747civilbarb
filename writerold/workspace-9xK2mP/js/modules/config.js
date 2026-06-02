// =================================================
// CONFIGURATION FILE - UPDATED 2026-06-02
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 33 lines - 1.5 KB



// Reviewer email address - CHANGE THIS TO YOUR EMAIL
export const REVIEWER_EMAIL = "your-email@example.com";

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

// NEW: Cloudflare Access configuration
export const CF_ACCESS = {
    loginUrl: 'https://deadangles.cloudflareaccess.com/#/NoAuth',
    identityEndpoint: '/cdn-cgi/access/get-identity'
};


