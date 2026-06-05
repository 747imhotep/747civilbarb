// =================================================
// AUTHENTICATION MODULE - MANUAL EMAIL ENTRY
// For private windows where cookies are blocked
// auth.js
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 128 lines - Updated: 2026-06-02  21h04



let currentWriterEmail = null;
let currentWriterPseudonym = null;

/**
 * Get writer identity - with manual email fallback
 * @returns {Promise<string|null>}
 */
export async function getWriterIdentity() {
    // Check if we already have email in memory
    if (currentWriterEmail) {
        return currentWriterEmail;
    }
    
    // Check sessionStorage (survives page reloads within the same tab)
    const sessionEmail = sessionStorage.getItem('cob_writer_email');
    if (sessionEmail && sessionEmail.includes('@')) {
        currentWriterEmail = sessionEmail;
        currentWriterPseudonym = sessionStorage.getItem('cob_writer_pseudonym') || sessionEmail.split('@')[0];
        console.log('✅ Writer from sessionStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // Check localStorage (may be purged but try anyway)
    const savedEmail = localStorage.getItem('cob_writer_email');
    if (savedEmail && savedEmail.includes('@')) {
        currentWriterEmail = savedEmail;
        currentWriterPseudonym = localStorage.getItem('cob_writer_pseudonym') || savedEmail.split('@')[0];
        console.log('✅ Writer from localStorage:', currentWriterEmail);
        return currentWriterEmail;
    }
    
    // If we reach here, we need to ask the user for their email
    // Only ask once per session to avoid annoying the user
    if (!sessionStorage.getItem('email_prompt_shown')) {
        sessionStorage.setItem('email_prompt_shown', 'true');
        
        const email = prompt(
            'Bienvenue! Veuillez entrer votre adresse email pour continuer.\n\n' +
            'Welcome! Please enter your email address to continue.',
            ''
        );
        
        if (email && email.includes('@')) {
            currentWriterEmail = email;
            currentWriterPseudonym = email.split('@')[0];
            
            // Save to sessionStorage for this browsing session
            sessionStorage.setItem('cob_writer_email', currentWriterEmail);
            sessionStorage.setItem('cob_writer_pseudonym', currentWriterPseudonym);
            
            console.log('✅ Writer from manual entry:', currentWriterEmail);
            return currentWriterEmail;
        } else {
            console.error('❌ No valid email provided');
            return null;
        }
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
    sessionStorage.setItem('cob_writer_pseudonym', pseudonym);
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


