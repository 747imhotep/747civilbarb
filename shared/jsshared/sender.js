// ========================
// civilisationoubarbarie.org
// sender.js — Script d'intégration de Sender.net pour les commentaires
// ========================

const host = location.hostname;

if (
  (
    host === "civilisationoubarbarie.org" ||
    host === "www.civilisationoubarbarie.org" ||
    host === "deadangles.org" ||
    host === "www.deadangles.org" ||
    host === "127.0.0.1" ||
    host === "localhost"
  ) &&
  document.getElementById('imhotep-comment-btn')
) {
  (function (s, e, n, d, er) {
      s['Sender'] = er;
      s[er] = s[er] || function () {
        (s[er].q = s[er].q || []).push(arguments)
      }, s[er].l = 1 * new Date();
      var a = e.createElement(n),
          m = e.getElementsByTagName(n)[0];
      a.async = 1;
      a.src = d;
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://cdn.sender.net/accounts_resources/universal.js', 'sender');
  sender('8ff476a5273454');
}

// ===== Fade in Sender popup when it loads =====
const checkPopup = setInterval(() => {
  const popup = document.querySelector('#imhotep-comment-btn iframe');
  if (popup) {
    document.getElementById('imhotep-comment-btn').classList.add('loaded');
    clearInterval(checkPopup);
  }
}, 100);