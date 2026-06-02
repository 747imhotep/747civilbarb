// =================================================
// LOGOUT MODULE
// logout.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 80 lines - Updated: 2026-06-02 - 22h50

/**
 * Initialize logout button functionality
 */
export function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.warn('⚠️ Logout button not found in DOM');
        return;
    }
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Optional: Show confirmation dialog
        const confirmLogout = confirm('Êtes-vous sûr de vouloir vous déconnecter ?\n\nAre you sure you want to logout?');
        if (!confirmLogout) {
            return;
        }
        
        console.log('🚪 Logging out...');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear all writer-related items from localStorage
        const localStorageKeys = [
            'cob_writer_email',
            'cob_writer_pseudonym',
            'cob_drafts_backup',
            'cob_progress_backup'
        ];
        
        localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed localStorage: ${key}`);
        });
        
        // Clear all upload records from localStorage/sessionStorage
        // Find all keys that start with 'cob_uploads_'
        const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
        allKeys.forEach(key => {
            if (key.startsWith('cob_uploads_')) {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
                console.log(`🗑️ Removed upload records: ${key}`);
            }
        });
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) {
            const cookieName = c.split("=")[0].trim();
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/writer/;";
        });
        
        console.log('✅ All data cleared. Redirecting to login...');
        
        // Redirect to Cloudflare Access launcher
        window.location.href = 'https://deadangles.cloudflareaccess.com/#/NoAuth';
    });
}

/**
 * Show/hide logout button based on login state
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
export function setLogoutButtonVisibility(isLoggedIn) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
}