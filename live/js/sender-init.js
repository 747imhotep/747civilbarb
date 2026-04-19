//::::::::::::::::::::::::::::::::::
// Sender Initialization Script
// - Loads Sender script asynchronously
// - Sets up basic Sender function and event listener system
// - Should be included in the page head or before any Sender usage
//::::::::::::::::::::::::::::::::::


(function (s, e, n, d, er) {
  s['Sender'] = er;
  s[er] = s[er] || function () {
    (s[er].q = s[er].q || []).push(arguments)
  }, s[er].l = 1 * new Date();

  s[er].on = function(event, callback) {
    (s[er].listeners = s[er].listeners || {});
    (s[er].listeners[event] = s[er].listeners[event] || []).push(callback);
  };

  // LOAD Sender script
  if (!e.querySelector('script[src*="sender.js"]')) { // Prevent duplicate load
  const script = e.createElement(n);
  script.async = true;
  script.src = d + "/js/v2/sender.js"; // official CDN path

  const firstScript = e.getElementsByTagName(n)[0];
  firstScript.parentNode.insertBefore(script, firstScript);

})(window, document, 'script', 'https://cdn.sender.net', 'sender');