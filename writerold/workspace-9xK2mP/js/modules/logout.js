// =================================================
// LOGOUT MODULE - SIMPLIFIED
// logout.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 48 lines - Updated: 2026-06-02 - 01h38



export function initLogoutButton() {
    console.log('🔘 Initializing logout button...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('❌ Logout button not found in DOM');
        return;
    }
    
    console.log('✅ Logout button found');
    
    // Simple click handler
    logoutBtn.onclick = function(e) {
        e.preventDefault();
        
        if (confirm('Déconnexion / Logout?')) {
            console.log('🚪 Logging out...');
            
            // Clear storage
            sessionStorage.clear();
            localStorage.clear();
            
            // Clear cookies
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
            });
            
            // Redirect
            window.location.href = 'https://deadangles.cloudflareaccess.com/#/NoAuth';
        }
    };
}

export function setLogoutButtonVisibility(visible) {
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.style.display = visible ? 'inline-block' : 'none';
}


