// ========================
// comments.js — Clean Version
// Handles the Imhotep comment section (button + Sender.net popup)
// ========================

// ===== Imhotep Comments Section JS =====
function initImhotepComments() {
  // Reference the main Imhotep container
  const container = document.getElementById('imhotep-container');
  if (!container) return; // Exit if container not found

  // Check if comment button already exists to avoid duplicates
  const btn = document.getElementById('imhotep-comment-btn');
  if (!btn) return;

  // ========================
  // Button click handler
  // ========================
  btn.addEventListener('click', () => {
    // Get current key from the dataset
    const currentKey = btn.dataset.currentKey || "Clé inconnue";
    window.currentImhotepKey = currentKey; // store globally for popup injection

    // Open the Sender.net popup
    if (typeof window.SENDER_POPUP === "function") {
      window.SENDER_POPUP.open();
 
    }
  });

  // ========================
  // Observe DOM to detect Sender.net popup and prefill the textarea
  // ========================
  const observer = new MutationObserver(() => {
    const textarea = document.querySelector("textarea");
    if (textarea && window.currentImhotepKey && !textarea.value) {
      textarea.value = window.currentImhotepKey + " — ";
      textarea.focus();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ========================
// Initialize on page load
// ========================
document.addEventListener('DOMContentLoaded', initImhotepComments);