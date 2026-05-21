// =================================================
// AUTHENTICATION MODULE
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 84 lines - Created: 2024-06-15

// Global variables
let currentWriterEmail = null;
let currentWriterPseudonym = null;

/**
 * Get writer identity from Cloudflare Access
 * @returns {Promise<string|null>} Writer email or null
 */
export async function getWriterIdentity() {
    try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const identity = await response.json();
            currentWriterEmail = identity.email;
            
            // Get pseudonym from localStorage or derive from email
            const storedPseudonym = localStorage.getItem('cob_writer_pseudonym');
            currentWriterPseudonym = storedPseudonym || identity.email.split('@')[0];
            
            console.log('✅ Writer identified:', currentWriterEmail);
            return currentWriterEmail;
        }
    } catch (error) {
        console.error('Could not fetch Cloudflare identity:', error);
    }
    
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
 * Set writer's pseudonym (saves to localStorage)
 * @param {string} pseudonym
 */
export function setWriterPseudonym(pseudonym) {
    currentWriterPseudonym = pseudonym;
    localStorage.setItem('cob_writer_pseudonym', pseudonym);
}

/**
 * Check if current user is the reviewer
 * @param {string} reviewerEmail - Email from config
 * @returns {boolean}
 */
export function isReviewer(reviewerEmail) {
    return currentWriterEmail === reviewerEmail;
}

/**
 * Update writer info in the DOM
 * @param {HTMLElement} container - Element to display writer info
 */
export function displayWriterInfo(container) {
    if (container && currentWriterPseudonym) {
        container.innerHTML = `
            <span class="writer-pseudo">✍🏾 ${currentWriterPseudonym}</span>
            <span class="writer-email">(${currentWriterEmail})</span>
        `;
    }
}