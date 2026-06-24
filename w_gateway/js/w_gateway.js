// =====================================
//             w_gateway.js
// =====================================


(function() {
    'use strict';

    // ===== DOM REFS =====
    var statusEl = document.getElementById('status');
    var loginBtn = document.getElementById('loginBtn');

    // ===== CONFIGURATION =====
    var CONFIG = {
    // Cloudflare Access logout URL (same as before)
    LOGOUT_URL: 'https://deadangles.cloudflareaccess.com/cdn-cgi/access/logout',

    // Protected portal URL (your new Access-protected path)
    PORTAL_URL: 'https://deadanglesinstitute.org/my-worker/public/login/',
    
    // URL to check if logout worked
    CHECK_URL: 'https://deadanglesinstitute.org/my-worker/public/login/',



        // How often to check if logout worked (ms)
        CHECK_INTERVAL: 800,

        // Max attempts before fallback
        MAX_ATTEMPTS: 5,

        // Fallback timeout (ms)
        FALLBACK_TIMEOUT: 8000,

        // Delay before redirecting to login (ms)
        LOGIN_DELAY: 20000  // 20 seconds
    };

    // ===== STATUS HELPER =====
    function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = 'gateway-status ' + type;
    }

    // ===== ENABLE LOGIN BUTTON =====
    function enableLoginButton() {
        loginBtn.disabled = false;
        loginBtn.textContent = '🔐 Login to Workspace';
        loginBtn.onclick = function() {
            // Disable button immediately to prevent double-clicks
            loginBtn.disabled = true;
            loginBtn.textContent = '⏳ Redirecting in 20 seconds...';
            
            // Show status message
            setStatus('⏳ Redirecting to Cloudflare Access in 20 seconds...', 'loading');
            
            // Wait 20 seconds, then redirect
            setTimeout(function() {
                window.location.href = CONFIG.PORTAL_URL;
            }, CONFIG.LOGIN_DELAY);
        };
    }

    // ===== PERFORM LOGOUT =====
    function performLogout() {
        setStatus('⏳ Logging out of visitor session...', 'loading');
        loginBtn.disabled = true;
        loginBtn.textContent = '⏳ Logging out...';

        // --- Method 1: Iframe (silent logout) ---
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = CONFIG.LOGOUT_URL;
        document.body.appendChild(iframe);

        // --- Method 2: Fetch (backup) ---
        try {
            fetch(CONFIG.LOGOUT_URL, {
                method: 'GET',
                credentials: 'include',
                mode: 'no-cors'
            }).catch(function() {
                // Ignore - no-cors mode still clears cookies
            });
        } catch (_) {
            // Ignore fetch errors
        }

        // --- Check if logout succeeded ---
        var attempts = 0;

        function checkLogoutStatus() {
            attempts++;

            fetch(CONFIG.CHECK_URL, {
                method: 'HEAD',
                credentials: 'include'
            })
            .then(function(response) {
                // 302, 401, or 403 = logout successful (not authenticated)
                if (response.status === 302 || response.status === 401 || response.status === 403) {
                    setStatus('✅ Visitor session cleared. Ready to log in as writer.', 'success');
                    enableLoginButton();
                } else {
                    // Still logged in? Try again
                    if (attempts < CONFIG.MAX_ATTEMPTS) {
                        setTimeout(checkLogoutStatus, CONFIG.CHECK_INTERVAL);
                    } else {
                        // Force logout by redirecting
                        setStatus('🔄 Completing logout...', 'loading');
                        window.location.href = CONFIG.LOGOUT_URL + '?redirect_url=' + encodeURIComponent(window.location.href);
                    }
                }
            })
            .catch(function() {
                // Network error might mean we're logged out (CORS)
                if (attempts < CONFIG.MAX_ATTEMPTS) {
                    setTimeout(checkLogoutStatus, CONFIG.CHECK_INTERVAL);
                } else {
                    setStatus('✅ Session cleared. Ready to log in as writer.', 'success');
                    enableLoginButton();
                }
            });
        }

        // Start checking after 1.5 seconds
        setTimeout(checkLogoutStatus, 1500);

        // --- Fallback: Show button anyway after timeout ---
        setTimeout(function() {
            if (loginBtn.disabled) {
                setStatus('⚠️ Click the button below to continue', 'error');
                enableLoginButton();
                loginBtn.textContent = '🔐 Continue to Workspace';
            }
        }, CONFIG.FALLBACK_TIMEOUT);
    }

    // ===== START =====
    performLogout();

})();