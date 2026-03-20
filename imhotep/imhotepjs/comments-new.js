// ========================
// comments-new.js — Simplified
// Just handles the button click and global key storage
// ========================

function initImhotepComments() {
  const btn = document.getElementById('imhotep-comment-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Store the current key globally - already done in imhotep.js
    // But we can add a small debug log
    console.log('Comment button clicked. Current key:', window.currentImhotepKey);
  });
}

document.addEventListener('DOMContentLoaded', initImhotepComments);