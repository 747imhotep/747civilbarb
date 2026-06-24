// =================================================
// LOGOUT MODULE - Cloudflare Access Logout
// logout.js
// Logout button logic - Redirect to Cloudflare Access logout
// Civilisation ou Barbarie - Writer Dashboard
// =================================================

// 100 lines - Updated: 2026-06-24 - Redirect to homepage after Cloudflare logout
// Updated: 2026-06-24 - Custom modal with CSS separated - uses logoff.css for styles



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
    
    const overlay = document.createElement('div');
    overlay.id = 'logoutModal';
    overlay.className = 'logoff-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'logoff-modal';
    
    modal.innerHTML = `
        <h3>🔐 Déconnexion</h3>
        <p>Vous allez être déconnecté de votre session rédacteur.</p>
        <p class="logoff-subtext">Vous serez redirigé vers la page d'accueil.</p>
        <div class="logoff-buttons">
            <button id="logoutCancelBtn" class="logoff-cancel">Annuler</button>
            <button id="logoutConfirmBtn" class="logoff-confirm">Confirmer</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
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



