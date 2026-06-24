// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 240 lines - Updated: 2026-06-24 - Redirect to homepage after Cloudflare logout
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
 * Uses classes from logoff.css with inline fallback styles
 */
function showLogoutModal() {
    // Check if modal already exists
    if (document.getElementById('logoutModal')) {
        return;
    }
    
    // Create modal overlay with inline styles for safety
    const overlay = document.createElement('div');
    overlay.id = 'logoutModal';
    overlay.className = 'logoff-overlay';
    
    // Force overlay styles inline to ensure it works
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        animation: fadeInScale 0.25s ease;
    `;
    
    // Create modal box with inline styles for safety
    const modal = document.createElement('div');
    modal.className = 'logoff-modal';
    modal.style.cssText = `
        background: #1e1e2f;
        border-radius: 24px;
        padding: 40px 45px;
        max-width: 420px;
        width: 92%;
        text-align: center;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.06);
        animation: fadeInScale 0.3s ease;
    `;
    
    // Modal content
    modal.innerHTML = `
        <h3 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; font-family: -apple-system, sans-serif;">
            🔐 Déconnexion
        </h3>
        <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.6; margin: 0 0 6px 0; font-family: -apple-system, sans-serif;">
            Vous allez être déconnecté de votre session rédacteur.
        </p>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.5; margin: 0 0 28px 0; font-family: -apple-system, sans-serif;">
            Vous serez redirigé vers la page d'accueil.
        </p>
        <div class="logoff-buttons" style="display: flex; gap: 12px; justify-content: center;">
            <button id="logoutCancelBtn" class="logoff-cancel" style="
                background: rgba(255,255,255,0.08);
                color: rgba(255,255,255,0.7);
                border: 1px solid rgba(255,255,255,0.08);
                padding: 11px 30px;
                border-radius: 50px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                font-family: -apple-system, sans-serif;
                transition: all 0.2s ease;
            ">Annuler</button>
            <button id="logoutConfirmBtn" class="logoff-confirm" style="
                background: linear-gradient(135deg, #6c63ff, #5a4bd1);
                color: #fff;
                border: none;
                padding: 11px 30px;
                border-radius: 50px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                font-family: -apple-system, sans-serif;
                box-shadow: 0 4px 20px rgba(108, 99, 255, 0.35);
                transition: all 0.2s ease;
            ">Confirmer</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add keyframe animation if not exists
    if (!document.getElementById('logoutModalStyles')) {
        const style = document.createElement('style');
        style.id = 'logoutModalStyles';
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Handle cancel - hover effects
    const cancelBtn = document.getElementById('logoutCancelBtn');
    cancelBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.15)';
        this.style.color = '#fff';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255,255,255,0.08)';
        this.style.color = 'rgba(255,255,255,0.7)';
    });
    
    // Handle confirm - hover effects
    const confirmBtn = document.getElementById('logoutConfirmBtn');
    confirmBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 30px rgba(108, 99, 255, 0.5)';
    });
    confirmBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 20px rgba(108, 99, 255, 0.35)';
    });
    
    // Handle cancel click
    cancelBtn.addEventListener('click', function() {
        closeLogoutModal();
    });
    
    // Handle confirm click
    confirmBtn.addEventListener('click', function() {
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


