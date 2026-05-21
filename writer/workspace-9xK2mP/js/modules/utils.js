// =================================================
// UTILS MODULE - Helper functions
// Civilisation ou Barbarie - Writer Dashboard
// =================================================
// 182 lines


/**
 * Get CSS class for REF column based on status
 * @param {string} status - Review status
 * @returns {string} - CSS class name (ref-red, ref-amber, etc.)
 */
export function getRefColorClass(status) {
    if (status === 'locked_by_other') return 'ref-red';
    if (status === 'in_progress') return 'ref-amber';
    if (status === 'ready_for_review') return 'ref-green';
    if (status === 'under_review') return 'ref-blue';
    if (status === 'published_free' || status === 'published_premium') return 'ref-purple';
    return 'ref-green';
}

/**
 * Get CSS class for status text color
 * @param {string} status - Review status
 * @returns {string} - CSS class name (status-red, status-amber, etc.)
 */
export function getStatusClass(status) {
    if (status === 'locked_by_other') return 'status-red';
    if (status === 'in_progress') return 'status-amber';
    if (status === 'ready_for_review') return 'status-green';
    if (status === 'under_review') return 'status-blue';
    if (status === 'published_free' || status === 'published_premium') return 'status-purple';
    return 'status-gray';
}

/**
 * Get human-readable status text in French/English
 * @param {string} status - Review status
 * @param {boolean} isCurrentWriter - Is this the current writer?
 * @param {string} language - 'fr' or 'en'
 * @returns {string} - Human-readable status
 */
export function getStatusText(status, isCurrentWriter, language = 'fr') {
    const texts = {
        fr: {
            locked_by_other: 'Occupé par un autre rédacteur',
            in_progress: isCurrentWriter ? 'En cours (vous)' : 'Occupé par un autre',
            ready_for_review: 'Prêt pour relecture',
            under_review: 'En relecture',
            published_free: 'Publié (libre)',
            published_premium: 'Publié (premium)',
            unlocked: 'Disponible',
            default: 'Disponible'
        },
        en: {
            locked_by_other: 'Locked by another writer',
            in_progress: isCurrentWriter ? 'In progress (you)' : 'Locked by another',
            ready_for_review: 'Ready for review',
            under_review: 'Under review',
            published_free: 'Published (free)',
            published_premium: 'Published (premium)',
            unlocked: 'Available',
            default: 'Available'
        }
    };
    
    const langTexts = texts[language] || texts.fr;
    return langTexts[status] || langTexts.default;
}

/**
 * Calculate percentage complete
 * @param {number} wordsWritten - Words written
 * @param {number} target - Target word count
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentComplete(wordsWritten, target) {
    if (!target || target === 0) return 0;
    return Math.round((wordsWritten / target) * 100);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @param {string} language - 'fr' or 'en'
 * @returns {string} - Formatted date
 */
export function formatDate(dateString, language = 'fr') {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale);
}

/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show temporary success message
 * @param {HTMLElement} button - Button element
 * @param {string} originalText - Original button text
 * @param {string} successText - Success message
 */
export function showSuccessMessage(button, originalText, successText = '✓ Done!') {
    button.textContent = successText;
    button.style.background = '#27ae60';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#2c3e2f';
    }, 2000);
}

/**
 * Show local notification banner (fallback when email fails)
 * @param {string} title - Article title
 * @param {string} writerPseudonym - Writer's pseudonym
 * @param {HTMLElement} container - Notification container
 */
export function showLocalNotification(title, writerPseudonym, container) {
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification-banner';
    notification.innerHTML = `
        <span>⚠️ ${writerPseudonym} a marqué "${title}" comme prêt pour relecture.</span>
        <button class="notification-close">✖</button>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) notification.remove();
    }, 8000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Create a progress bar HTML
 * @param {number} percent - Percentage (0-100)
 * @param {number} width - Width in pixels (optional)
 * @returns {string} - HTML string
 */
export function createProgressBar(percent, width = 100) {
    return `
        <div class="progress-bar-container" style="width: ${width}px;">
            <div class="progress-bar" style="width: ${percent}%;"></div>
        </div>
        ${percent}%
    `;
}