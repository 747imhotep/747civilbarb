// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 69 lines - Updated: 2026-06-24 - Redirect to gateway after Cloudflare logout

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
        
        const confirmLogout = confirm('Déconnexion / Logout?\n\nVous allez être déconnecté de Cloudflare Access et redirigé vers l\'accueil.');
        
        if (confirmLogout) {
            console.log('✅ User confirmed logout, redirecting to Cloudflare Access logout...');
            
            // Clear local and session storage
            try {
                sessionStorage.clear();
                localStorage.clear();
            } catch(e) {
                console.log('Error clearing storage:', e);
            }
            
            // Clear cookies (including CF Access cookies)
            try {
                document.cookie.split(";").forEach(function(c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
                });
            } catch(e) {
                console.log('Error clearing cookies:', e);
            }
            
            // Cloudflare Access logout URL
            // Redirect to gateway page after logout
            const logoutUrl = 'https://deadangles.cloudflareaccess.com/cdn-cgi/access/logout?redirect_url=https://www.deadanglesinstitute.org/w_gateway/w_gateway.html';
            
            console.log('🔓 Redirecting to Cloudflare Access logout:', logoutUrl);
            window.location.href = logoutUrl;
        }
    });
}

export function setLogoutButtonVisibility(visible) {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.style.display = visible ? 'inline-block' : 'none';
    }
}


