// =================================================
// LOGOUT MODULE - SIMPLIFIED - redirected to login page
// logout.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 50 lines - Updated: 2026-06-02 - 02h13




export function initLogoutButton() {
    console.log('🔘 Initializing logout button...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('❌ Logout button not found');
        return;
    }
    
    logoutBtn.onclick = function(e) {
        e.preventDefault();
        
        if (confirm('Déconnexion / Logout?\n\nVous allez être redirigé vers la page de connexion.')) {
            console.log('🚪 Logging out and redirecting to login page...');
            
            // Clear storage
            sessionStorage.clear();
            localStorage.clear();
            
            // Clear cookies
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
            });
            
            // Redirect to login page
            // Option 1: If you have login.html in the same directory
            window.location.href = '/writer/workspace-9xK2mP/login.html';
            
            // Option 2: If you prefer a login folder with index.html
            // window.location.href = '/writer/workspace-9xK2mP/login/index.html';
        }
    };
}

export function setLogoutButtonVisibility(visible) {
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.style.display = visible ? 'inline-block' : 'none';
}