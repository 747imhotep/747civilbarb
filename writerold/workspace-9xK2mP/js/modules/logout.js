// =================================================
// LOGOUT MODULE - SIMPLIFIED
// logout.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 62 lines - Updated: 2026-06-02 - 00h50



/**
 * Initialize logout button functionality
 */
export function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.warn('⚠️ Logout button not found');
        return;
    }
    
    // Remove any existing listeners to avoid duplicates
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    
    newLogoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const confirmLogout = confirm('Êtes-vous sûr de vouloir vous déconnecter?\n\nAre you sure you want to logout?');
        if (!confirmLogout) {
            return;
        }
        
        console.log('🚪 Logging out...');
        
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) {
            const cookieName = c.split("=")[0].trim();
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
        
        // Redirect to Cloudflare login
        window.location.href = 'https://deadangles.cloudflareaccess.com/#/NoAuth';
    });
    
    // Always show the button
    newLogoutBtn.style.display = 'inline-block';
}

/**
 * Show/hide logout button (kept for compatibility)
 */
export function setLogoutButtonVisibility(visible) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = visible ? 'inline-block' : 'none';
    }
}


