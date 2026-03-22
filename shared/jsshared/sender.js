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
    host === "deadangleinstitute.org" ||
    host === "www.deadangleinstitute.org" ||
    host === "127.0.0.1" ||
    host === "localhost"
  ) &&
  document.getElementById('open-cmt-modal')
) {
  // Load Sender.net universal library
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
  
  // Initialize with your tracking ID
  // Note: This might need to be your brand ID, not tracking ID
  sender('init', {
    trackingId: '8ff476a5273454',  // Your tracking ID
    apiKey: 'YOUR_API_KEY_HERE'     // You might need an API key
  });
}