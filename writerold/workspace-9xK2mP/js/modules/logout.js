// =================================================
// LOGOUT MODULE - SIMPLIFIED - redirected to login page
// logout.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 63 lines - Updated: 2026-06-02 - 03h45


export function initLogoutButton() {
    console.log('🔘 Initializing logout button...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('❌ Logout button not found in DOM');
        return;
    }
    
    console.log('✅ Logout button found');
    
    // Remove any existing listeners to avoid conflicts
    const newBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
    
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🚪 Logout button clicked');
        
        const confirmLogout = confirm('Déconnexion / Logout?\n\nVous allez être redirigé vers le portail d\'accès.');
        
        if (confirmLogout) {
            console.log('✅ User confirmed logout, clearing data...');
            
            // Clear all storage
            sessionStorage.clear();
            localStorage.clear();
            
            // Clear cookies
            try {
                document.cookie.split(";").forEach(function(c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
                });
            } catch(e) {
                console.log('Error clearing cookies:', e);
            }
            
            // CORRECT REDIRECT TO YOUR LOGIN PAGE
            const loginUrl = 'https://www.deadanglesinstitute.org/writer/workspace-9xK2mP/login/';
            console.log('Redirecting to:', loginUrl);
            window.location.href = loginUrl;
        }
    });
}

export function setLogoutButtonVisibility(visible) {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.style.display = visible ? 'inline-block' : 'none';
    }
}