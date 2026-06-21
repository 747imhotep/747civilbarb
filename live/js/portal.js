// =======================================================
// PORTAL JS - Dead Angles Institute
// Handles: Language toggle, text translations, form toggle
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'fr'; // Default language

    // ===========================================
    // Translation dictionary
    // ===========================================
    const translations = {
        fr: {
            title: 'PORTAIL D\'ACCÈS',
            subtitle: 'Dead Angles Institute ™',
            description: 'Le site sera prochainement accessible.',
            btnSite: 'Accès au site',
            btnRequest: 'Demande d\'accès',
            btnWriter: 'PORTAIL RÉDACTEURS',
            langToggle: '🇬🇧 English'
        },
        en: {
            title: 'ACCESS PORTAL',
            subtitle: 'Dead Angles Institute ™',
            description: 'The website will be available soon.',
            btnSite: 'Access the site',
            btnRequest: 'Request access',
            btnWriter: 'WRITERS PORTAL',
            langToggle: '🇫🇷 Français'
        }
    };

    // ===========================================
    // Apply translations
    // ===========================================
    function applyTranslations(lang) {
        const t = translations[lang];
        if (!t) return;

        document.getElementById('portal-title').textContent = t.title;
        document.getElementById('portal-subtitle').innerHTML = t.subtitle;
        document.getElementById('portal-description').textContent = t.description;
        document.getElementById('btn-site').textContent = t.btnSite;
        document.getElementById('btn-request').textContent = t.btnRequest;
        document.getElementById('btn-writer').textContent = t.btnWriter;
        document.getElementById('lang-toggle').textContent = t.langToggle;

        currentLang = lang;
        document.documentElement.lang = (lang === 'fr') ? 'fr' : 'en';
    }

    // ===========================================
    // Language toggle
    // ===========================================
    document.getElementById('lang-toggle').addEventListener('click', function() {
        const newLang = (currentLang === 'fr') ? 'en' : 'fr';
        applyTranslations(newLang);
    });

    // ===========================================
    // Access form toggle
    // ===========================================
    const openAccessBtn = document.getElementById('btn-request');
    const senderContainer = document.getElementById('sender-form-container');

    if (openAccessBtn && senderContainer) {
        openAccessBtn.addEventListener('click', function() {
            if (senderContainer.style.display === 'none' || senderContainer.style.display === '') {
                senderContainer.style.display = 'block';
                senderContainer.classList.add('form-success');
                setTimeout(() => {
                    senderContainer.classList.remove('form-success');
                }, 1000);
            } else {
                senderContainer.style.display = 'none';
            }
        });
    }

    // ===========================================
    // Language redirect (after 30 minutes)
    // ===========================================
    const delay = 1800000; // 30 minutes
    const browserLang = navigator.language || navigator.userLanguage;
    const target = browserLang.startsWith('fr') ? '/fr/' : '/en/';
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

    // ===========================================
    // Apply initial language (French by default)
    // ===========================================
    applyTranslations('fr');
});