// =================================================
// AUTHENTICATION MODULE - BOUNCE TRACKER RESILIENT
// auth.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 157 lines - Updated: 2026-06-02


import { CF_ACCESS } from './config.js';

let currentWriterEmail = null;
let currentWriterPseudonym = null;

/**
 * Extract email from URL parameters (most reliable after redirect)
 * Cloudflare Access can pass user email as a query parameter
 */
function extractEmailFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || urlParams.get('user_email');
    if (email && email.includes('@')) {
        console.log('✅ Email extracted from URL:', email);
        // Clean the URL to remove the email parameter (security)
        if (window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        return email;
    }
    return null;
}

/**
 * Try to get email from Cloudflare identity endpoint
 */
async function fetchFromIdentityEndpoint() {
    try {
        const response = await fetch(CF_ACCESS.identityEndpoint, {
            credentials: 'include',
            cache: 'no-store'
        });
        if (response.ok) {
            const identity = await response.json();
            if (identity.email) {
                console.log('✅ Email from identity endpoint:', identity.email);
                return identity.email;
            }
        }
    } catch (error) {
        console.log('Identity endpoint not available:', error.message);
    }
    return null;
}

/**
 * Try to extract from JWT cookie (fallback)
 */
function extractFromJWT() {
    try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('CF_Authorization')) {
                const token = trimmed.substring('CF_Authorization='.length);
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (payload.email) return payload.email;
                }
            }
        }
    } catch (e) {}
    return null;
}

/**
 * Get writer identity - Resilient to bounce tracker purging
 * @returns {Promise<string|null>}
 */
export async function getWriterIdentity() {
    // METHOD 1: Check URL parameters (most reliable for bounce tracker case)
    const urlEmail = extractEmailFromUrl();
    if (urlEmail) {
        currentWriterEmail = urlEmail;
        currentWriterPseudonym = urlEmail.split('@')[0];
        // Don't save to localStorage - it will be purged anyway
        console.log('✅ Writer from URL (bounce tracker resilient):', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // METHOD 2: Identity endpoint
    const endpointEmail = await fetchFromIdentityEndpoint();
    if (endpointEmail) {
        currentWriterEmail = endpointEmail;
        currentWriterPseudonym = endpointEmail.split('@')[0];
        return currentWriterEmail;
    }
    
    // METHOD 3: JWT cookie
    const jwtEmail = extractFromJWT();
    if (jwtEmail) {
        currentWriterEmail = jwtEmail;
        currentWriterPseudonym = jwtEmail.split('@')[0];
        return currentWriterEmail;
    }
    
    // METHOD 4: SessionStorage (more persistent than localStorage in some browsers)
    const sessionEmail = sessionStorage.getItem('cob_writer_email');
    if (sessionEmail && sessionEmail.includes('@')) {
        currentWriterEmail = sessionEmail;
        currentWriterPseudonym = sessionStorage.getItem('cob_writer_pseudonym') || sessionEmail.split('@')[0];
        console.log('✅ Writer from sessionStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // METHOD 5: localStorage (last resort, may be purged)
    const savedEmail = localStorage.getItem('cob_writer_email');
    if (savedEmail && savedEmail.includes('@')) {
        currentWriterEmail = savedEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || savedEmail.split('@')[0];
        console.log('✅ Writer from localStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // No identity found - redirect to Cloudflare login
    console.error('❌ Could not identify writer, redirecting to Cloudflare Access...');
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${CF_ACCESS.loginUrl}?redirect_uri=${returnUrl}`;
    return null;
}

export function getCurrentWriterEmail() { return currentWriterEmail; }
export function getCurrentWriterPseudonym() { return currentWriterPseudonym; }
export function setWriterPseudonym(pseudonym) {
    currentWriterPseudonym = pseudonym;
    sessionStorage.setItem('cob_writer_pseudonym', pseudonym);
}
export function isReviewer(reviewerEmail) { return currentWriterEmail === reviewerEmail; }

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



