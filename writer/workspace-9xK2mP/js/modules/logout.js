// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 175 lines updated: 2026-06-25 - Added inline style fallback for reliability

export function initLogoutButton() {
    console.log('🔘 Initializing logout button...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('❌ Logout button not found in DOM');
        return;
    }
    
    console.log('✅ Logout button found');
    
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

function showLogoutModal() {
    if (document.getElementById('logoutModal')) {
        return;
    }
    
    // Create overlay with BOTH class and inline styles
    const overlay = document.createElement('div');
    overlay.id = 'logoutModal';
    overlay.className = 'logoff-overlay';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 99999 !important;
        margin: 0 !important;
        padding: 0 !important;
    `;
    
    // Create modal with BOTH class and inline styles
    const modal = document.createElement('div');
    modal.className = 'logoff-modal';
    modal.style.cssText = `
        background: linear-gradient(145deg, #240046, #3c0a6d) !important;
        border-radius: 24px !important;
        padding: 45px 50px 40px !important;
        max-width: 420px !important;
        width: 92% !important;
        text-align: center !important;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        position: relative !important;
        z-index: 100000 !important;
    `;
    
    modal.innerHTML = `
        <h3 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.3px;">🔐 Déconnexion</h3>
        <p style="color: rgba(255, 255, 255, 0.82); font-size: 15px; line-height: 1.6; margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Vous allez être déconnecté de votre session rédacteur.</p>
        <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; line-height: 1.5; margin: 0 0 32px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Vous serez redirigé vers la page d'accueil.</p>
        <div style="display: flex; gap: 14px; justify-content: center;">
            <button id="logoutCancelBtn" style="
                background: rgba(255, 255, 255, 0.08);
                color: rgba(255, 255, 255, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                padding: 11px 34px;
                border-radius: 50px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: all 0.25s ease;
                letter-spacing: 0.2px;
            ">Annuler</button>
            <button id="logoutConfirmBtn" style="
                background: linear-gradient(135deg, #6c63ff, #5a4bd1);
                color: #fff;
                border: none;
                padding: 11px 34px;
                border-radius: 50px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 4px 20px rgba(108, 99, 255, 0.35);
                transition: all 0.25s ease;
                letter-spacing: 0.2px;
            ">Confirmer</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add hover effects for buttons
    const cancelBtn = document.getElementById('logoutCancelBtn');
    const confirmBtn = document.getElementById('logoutConfirmBtn');
    
    cancelBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.16)';
        this.style.color = '#fff';
        this.style.transform = 'translateY(-1px)';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 255, 255, 0.08)';
        this.style.color = 'rgba(255, 255, 255, 0.7)';
        this.style.transform = 'translateY(0)';
    });
    
    confirmBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 30px rgba(108, 99, 255, 0.5)';
    });
    confirmBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 20px rgba(108, 99, 255, 0.35)';
    });
    
    document.getElementById('logoutCancelBtn').addEventListener('click', closeLogoutModal);
    document.getElementById('logoutConfirmBtn').addEventListener('click', performLogout);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLogoutModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLogoutModal();
    });
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.remove();
}

function performLogout() {
    console.log('✅ User confirmed logout...');
    
    try { sessionStorage.clear(); } catch(e) {}
    try { localStorage.clear(); } catch(e) {}
    
    try {
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
        });
    } catch(e) {}
    
    const logoutUrl = 'https://deadangles.cloudflareaccess.com/cdn-cgi/access/logout?redirect_url=https://deadanglesinstitute.org/';
    window.location.href = logoutUrl;
}


