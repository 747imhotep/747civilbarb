// =================================================
// CONFIGURATION FILE
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 25 lines - 1.5 KB

// Reviewer email address - CHANGE THIS TO YOUR EMAIL
export const REVIEWER_EMAIL = "your-email@example.com";

// API base URL - CHANGE THIS TO YOUR BACKEND URL
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