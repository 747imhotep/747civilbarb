// =================================================
// AUTHENTICATION MODULE
// auth.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 159 lines - Created: 2024-06-28



let currentWriterEmail = null;
let currentWriterPseudonym = null;

/**
 * Extract email from Cloudflare Access JWT cookie
 * The CF_Authorization cookie contains a JWT with the user's email
 */
function extractEmailFromCFCookie() {
    try {
        // Look for Cloudflare Access session cookie
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('CF_Authorization')) {
                // The cookie value is a JWT token
                const token = trimmed.substring('CF_Authorization='.length);
                
                // JWT format: header.payload.signature
                const parts = token.split('.');
                if (parts.length === 3) {
                    // Decode payload (base64url)
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    
                    // Cloudflare Access puts email in 'email' claim
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
 * Get writer identity - CORRECTED VERSION
 * @returns {Promise<string|null>}
 */
export async function getWriterIdentity() {
    // Method 1: Extract email directly from CF JWT cookie
    const emailFromJWT = extractEmailFromCFCookie();
    if (emailFromJWT) {
        currentWriterEmail = emailFromJWT;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || emailFromJWT.split('@')[0];
        localStorage.setItem('cob_writer_email', currentWriterEmail);
        console.log('✅ Writer identified from CF JWT:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // Method 2: Try identity endpoint (if available)
    try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const identity = await response.json();
            currentWriterEmail = identity.email;
            currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || identity.email.split('@')[0];
            localStorage.setItem('cob_writer_email', currentWriterEmail);
            console.log('✅ Writer identified via endpoint:', currentWriterEmail);
            return currentWriterEmail;
        }
    } catch (error) {
        console.log('Identity endpoint not available');
    }
    
    // Method 3: Check localStorage for previously saved email
    const savedEmail = localStorage.getItem('cob_writer_email');
    if (savedEmail && savedEmail.includes('@')) {
        currentWriterEmail = savedEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || savedEmail.split('@')[0];
        console.log('✅ Writer identified from localStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // Method 4: Development fallback (remove for production)
    const urlParams = new URLSearchParams(window.location.search);
    const testEmail = urlParams.get('test_email');
    if (testEmail && testEmail.includes('@')) {
        currentWriterEmail = testEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || testEmail.split('@')[0];
        localStorage.setItem('cob_writer_email', currentWriterEmail);
        console.log('⚠️ Using test email from URL:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    console.error('❌ Could not identify writer');
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}


