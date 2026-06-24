// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 151 lines - Updated: 2026-06-24 - Redirect to homepage after Cloudflare logout
// Updated: 2026-06-24 - Custom modal with CSS separated


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
 */
function showLogoutModal() {
    // Check if modal already exists
    if (document.getElementById('logoutModal')) {
        return;
    }
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'logoutModal';
    overlay.className = 'logout-modal-overlay';
    
    // Create modal box
    const modal = document.createElement('div');
    modal.className = 'logout-modal-box';
    
    // Modal content
    modal.innerHTML = `
        <div class="logout-modal-icon">🔐</div>
        <h2 class="logout-modal-title">Déconnexion</h2>
        <p class="logout-modal-text">
            Vous allez être déconnecté de votre session rédacteur.
        </p>
        <p class="logout-modal-subtext">
            Vous serez redirigé vers la page d'accueil.
        </p>
        <div class="logout-modal-actions">
            <button id="logoutCancelBtn" class="logout-modal-btn logout-modal-btn-cancel">
                Annuler
            </button>
            <button id="logoutConfirmBtn" class="logout-modal-btn logout-modal-btn-confirm">
                Confirmer
            </button>
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
        modal.style.animation = 'logoutFadeOut 0.2s ease';
        setTimeout(function() {
            modal.remove();
        }, 200);
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
    // Using the full domain with https://
    const logoutUrl = 'https://deadangles.cloudflareaccess.com/cdn-cgi/access/logout?redirect_url=https://deadanglesinstitute.org/';
    
    console.log('🔓 Redirecting to Cloudflare Access logout:', logoutUrl);
    window.location.href = logoutUrl;
}


