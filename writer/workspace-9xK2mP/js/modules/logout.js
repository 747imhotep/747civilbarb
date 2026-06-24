// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 142 lines - Updated: 2026-06-24 - Redirect to homepage after Cloudflare logout
// Updated: 2026-06-24 - Custom modal with CSS separated - uses logoff.css for styles




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
        showLogoutModal();
    });
}

export function setLogoutButtonVisibility(visible) {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.style.display = visible ? 'inline-block' : 'none';
    }
}

/**
 * Show custom logout confirmation modal
 * Uses classes from logoff.css
 */
function showLogoutModal() {
    // Check if modal already exists
    if (document.getElementById('logoutModal')) {
        return;
    }
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'logoutModal';
    overlay.className = 'logoff-overlay';
    
    // Create modal box
    const modal = document.createElement('div');
    modal.className = 'logoff-modal';
    
    // Modal content
    modal.innerHTML = `
        <h3>🔐 Déconnexion</h3>
        <p>Vous allez être déconnecté de votre session rédacteur.<br>
        Vous serez redirigé vers la page d'accueil.</p>
        <div class="logoff-buttons">
            <button id="logoutCancelBtn" class="logoff-cancel">Annuler</button>
            <button id="logoutConfirmBtn" class="logoff-confirm">Confirmer</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Handle cancel
    document.getElementById('logoutCancelBtn').addEventListener('click', function() {
        closeLogoutModal();
    });
    
    // Handle confirm
    document.getElementById('logoutConfirmBtn').addEventListener('click', function() {
        performLogout();
    });
    
    // Close on overlay click (outside modal)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeLogoutModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLogoutModal();
        }
    });
}

/**
 * Close the logout modal
 */
function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Perform the actual logout
 */
function performLogout() {
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
    
    // Cloudflare Access logout URL with redirect to homepage
    const logoutUrl = 'https://deadangles.cloudflareaccess.com/cdn-cgi/access/logout?redirect_url=https://deadanglesinstitute.org/';
    
    console.log('🔓 Redirecting to Cloudflare Access logout:', logoutUrl);
    window.location.href = logoutUrl;
}


