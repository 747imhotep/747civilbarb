// GDPR Consent Banner Script


 document.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('gdpr-banner');
  const acceptBtn = document.getElementById('gdpr-accept');

  if (!banner || !acceptBtn) return;

  if (!localStorage.getItem('gdprAccepted')) {
    banner.style.display = 'flex';
  }

  acceptBtn.addEventListener('click', function() {
    localStorage.setItem('gdprAccepted', 'true');
    banner.style.display = 'none';
  });
});




