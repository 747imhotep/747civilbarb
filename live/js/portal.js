// =======================================================
// PORTAL JS - Dead Angles Institute
// Handles: Language selection, access form toggle
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    // Language selection text animation
    const texts = [
        "The website will be available soon.",
        "Le site sera prochainement accessible."
    ];

    let index = 0;
    const el = document.getElementById("lang-text");

    if (el) {
        setInterval(() => {
            el.classList.add("fade-out");

            setTimeout(() => {
                index = (index + 1) % texts.length;
                el.textContent = texts[index];
                el.classList.remove("fade-out");
            }, 500);
        }, 2000);
    }

    // Access form toggle
    const openAccessBtn = document.getElementById('openAccessForm');
    const senderContainer = document.getElementById('sender-form-container');

    if (openAccessBtn && senderContainer) {
        openAccessBtn.addEventListener('click', function() {
            if (senderContainer.style.display === 'none' || senderContainer.style.display === '') {
                senderContainer.style.display = 'block';
            } else {
                senderContainer.style.display = 'none';
            }
        });
    }

    // Language redirect (after 30 minutes of inactivity)
    const delay = 1800000; // 30 minutes
    const lang = navigator.language || navigator.userLanguage;
    const target = lang.startsWith('fr') ? '/fr/' : '/en/';
    let redirected = false;

    const timer = setTimeout(() => {
        if (!redirected) {
            window.location.href = target;
        }
    }, delay);

    const links = document.querySelectorAll('.lang-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            redirected = true;
            clearTimeout(timer);
        });
    });
});