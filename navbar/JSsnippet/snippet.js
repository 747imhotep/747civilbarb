// GDPR Consent Banner Script


  document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('gdpr-banner');
    const acceptBtn = document.getElementById('gdpr-accept');

    // Only show banner if not accepted yet
    if (!localStorage.getItem('gdprAccepted')) {
      banner.style.display = 'flex';
    }

    // On click, hide banner and store consent
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('gdprAccepted', 'true');
      banner.style.display = 'none';
    });
  });



