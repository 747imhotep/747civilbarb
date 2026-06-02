// =================================================
// AUTHENTICATION MODULE - COMPLETE FIXED VERSION
// auth.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 210 lines - Updated: 2026-06-02

let currentWriterEmail = null;
let currentWriterPseudonym = null;

/**
 * Redirect to Cloudflare Access login page
 * @param {string} returnUrl - URL to return to after login
 */
function redirectToCloudflareLogin(returnUrl) {
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const loginUrl = `https://deadangles.cloudflareaccess.com/#/NoAuth?redirect_uri=${encodedReturnUrl}`;
    console.log('🔐 No Cloudflare session, redirecting to login...');
    window.location.href = loginUrl;
}

/**
 * Extract email from Cloudflare Access JWT cookie
 */
function extractEmailFromCFCookie() {
    try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('CF_Authorization')) {
                const token = trimmed.substring('CF_Authorization='.length);
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (payload.email) {
                        console.log('✅ Email extracted from CF JWT:', payload.email);
                        return payload.email;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error extracting email from CF cookie:', error);
    }
    return null;
}

/**
 * Clear all writer data from localStorage (used on email mismatch)
 */
function clearWriterLocalStorage() {
    const keysToRemove = [
        'cob_writer_email',
        'cob_writer_pseudonym',
        'cob_drafts_backup',
        'cob_progress_backup'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🔄 Cleared old localStorage data due to email mismatch');
}

/**
 * Get writer identity - COMPLETE FIXED VERSION
 * @returns {Promise<string|null>}
 */
export async function getWriterIdentity() {
    // =============================================
    // STEP 1: Check if we have ANY Cloudflare session cookie
    // =============================================
    const hasCFSession = document.cookie.includes('CF_Authorization') || 
                         document.cookie.includes('CF_AppSession');
    
    // If no session cookie AND no saved email in localStorage, redirect to login
    const savedEmail = localStorage.getItem('cob_writer_email');
    if (!hasCFSession && !savedEmail) {
        redirectToCloudflareLogin(window.location.href);
        return null; // Execution stops here
    }
    
    // =============================================
    // STEP 2: Try to extract email from JWT cookie
    // =============================================
    const emailFromJWT = extractEmailFromCFCookie();
    if (emailFromJWT) {
        // Check if this is a different user than the one saved
        if (savedEmail && savedEmail !== emailFromJWT) {
            clearWriterLocalStorage();
        }
        currentWriterEmail = emailFromJWT;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || emailFromJWT.split('@')[0];
        localStorage.setItem('cob_writer_email', currentWriterEmail);
        console.log('✅ Writer identified from CF JWT:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // =============================================
    // STEP 3: Try identity endpoint (if available)
    // =============================================
    try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const identity = await response.json();
            if (savedEmail && savedEmail !== identity.email) {
                clearWriterLocalStorage();
            }
            currentWriterEmail = identity.email;
            currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || identity.email.split('@')[0];
            localStorage.setItem('cob_writer_email', currentWriterEmail);
            console.log('✅ Writer identified via endpoint:', currentWriterEmail);
            return currentWriterEmail;
        }
    } catch (error) {
        console.log('Identity endpoint not available');
    }
    
    // =============================================
    // STEP 4: Check localStorage for previously saved email
    // =============================================
    if (savedEmail && savedEmail.includes('@')) {
        currentWriterEmail = savedEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || savedEmail.split('@')[0];
        console.log('✅ Writer identified from localStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // =============================================
    // STEP 5: Development fallback (URL parameter)
    // =============================================
    const urlParams = new URLSearchParams(window.location.search);
    const testEmail = urlParams.get('test_email');
    if (testEmail && testEmail.includes('@')) {
        currentWriterEmail = testEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || testEmail.split('@')[0];
        localStorage.setItem('cob_writer_email', currentWriterEmail);
        console.log('⚠️ Using test email from URL:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // =============================================
    // STEP 6: No identity found — redirect to login
    // =============================================
    console.error('❌ Could not identify writer, redirecting to login...');
    redirectToCloudflareLogin(window.location.href);
    return null;
}

/**
 * Get current writer's email
 * @returns {string|null}
 */
export function getCurrentWriterEmail() {
    return currentWriterEmail;
}

/**
 * Get current writer's pseudonym
 * @returns {string|null}
 */
export function getCurrentWriterPseudonym() {
    return currentWriterPseudonym;
}

/**
 * Set writer's pseudonym
 * @param {string} pseudonym
 */
export function setWriterPseudonym(pseudonym) {
    currentWriterPseudonym = pseudonym;
    localStorage.setItem('cob_writer_pseudonym', pseudonym);
}

/**
 * Check if current user is the reviewer
 * @param {string} reviewerEmail
 * @returns {boolean}
 */
export function isReviewer(reviewerEmail) {
    return currentWriterEmail === reviewerEmail;
}

/**
 * Display writer info in DOM
 * @param {HTMLElement} container
 */
export function displayWriterInfo(container) {
    if (container && currentWriterPseudonym) {
        container.innerHTML = `
            <span class="writer-pseudo">✍🏾 ${escapeHtml(currentWriterPseudonym)}</span>
            <span class="writer-email">(${escapeHtml(currentWriterEmail || '')})</span>
        `;
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}


