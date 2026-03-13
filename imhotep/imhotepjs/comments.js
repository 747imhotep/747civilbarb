// ========================
// comments.js — Clean Version
// Handles the Imhotep comment section (button + Sender.net popup)
// ========================

// ===== Imhotep Comments Section JS =====
function initImhotepComments() {
  // Reference the main Imhotep container
  const container = document.getElementById('imhotep-container');
  if (!container) return; // Exit if container not found

  // Check if comment box already exists to avoid duplicates
  if (document.getElementById('imhotep-comments')) return;

  // ========================
  // Create the comment box
  // ========================
  const commentsBox = document.createElement('div');
  commentsBox.id = 'imhotep-comments';

  // Title of the comment section
  const title = document.createElement('h3');
  title.textContent = "💬 Laissez un commentaire";

  // Button to open Sender.net popup
  const btn = document.createElement('button');
  btn.id = 'imhotep-comment-btn';
  btn.textContent = "Ouvrir le formulaire";

  // ========================
  // Button click handler
  // ========================
  btn.addEventListener('click', () => {
    // Check if Sender.net popup function is available
    if (typeof window.SENDER_POPUP === "function") {
      window.SENDER_POPUP.open(); // Open the popup
    } else {
      // Fallback: open contact page in new tab
      window.open("/contact/", "_blank");
    }
  });

  // Append title and button to comment box
  commentsBox.appendChild(title);
  commentsBox.appendChild(btn);

  // Append comment box **below Imhotep keys container**
  container.parentNode.insertBefore(commentsBox, container.nextSibling);
}

// ========================
// Initialize on page load
// ========================
document.addEventListener('DOMContentLoaded', initImhotepComments);