// ===== Imhotep Comments Section JS =====
function initImhotepComments() {
  const container = document.getElementById('imhotep-container');
  if (!container) return;

  // Check if comment box exists already
  if (document.getElementById('imhotep-comments')) return;

  // Create comment box
  const commentsBox = document.createElement('div');
  commentsBox.id = 'imhotep-comments';

  const title = document.createElement('h3');
  title.textContent = "💬 Laissez un commentaire";

  const btn = document.createElement('button');
  btn.id = 'imhotep-comment-btn';
  btn.textContent = "Ouvrir le formulaire";

  btn.addEventListener('click', () => {
    if(typeof SendernetPopup === "function") {
      SendernetPopup(); // your sender.net popup
    } else {
      window.open("/contact/", "_blank"); // fallback
    }
  });

  commentsBox.appendChild(title);
  commentsBox.appendChild(btn);

  container.appendChild(commentsBox);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initImhotepComments);