//=================================================
// 747 Civil Barbarians - Page Tarifs JS
//=================================================

// Ce script gère le comportement interactif de la page des tarifs :
// - Ouverture et personnalisation de la popup d'inscription selon le forfait choisi
// - Soumission du formulaire d'inscription vers Sender.net et retour utilisateur


// GESTION DE LA POPUP
const modal = document.getElementById('signupModal');
const modalTitle = document.getElementById('modalTitle');
const modalPlanBadge = document.getElementById('modalPlanBadge');
const selectedPlanInput = document.getElementById('selectedPlan');
const pseudonymGroup = document.getElementById('pseudonymGroup');

let currentPlan = '';

function openModal(plan) {
    currentPlan = plan;
    selectedPlanInput.value = plan;
    
    if (plan === 'writer') {
        modalTitle.innerText = '✍🏾 Devenir Rédacteur';
        modalPlanBadge.innerText = 'Candidature rédacteur';
        pseudonymGroup.style.display = 'block';
        document.getElementById('pseudonym').required = true;
    } else if (plan === 'premium') {
        modalTitle.innerText = '✨ Premium – 12 textes / an';
        modalPlanBadge.innerText = 'Don annuel 12–30€';
        pseudonymGroup.style.display = 'none';
        if(document.getElementById('pseudonym')) document.getElementById('pseudonym').required = false;
    } else if (plan === 'volunteer') {
        modalTitle.innerText = '🫴🏾 Bénévole – archives complètes';
        modalPlanBadge.innerText = 'Don > 30€ / an';
        pseudonymGroup.style.display = 'none';
    } else {
        modalTitle.innerText = '📖 Accès Libre';
        modalPlanBadge.innerText = 'Aucun paiement requis';
        pseudonymGroup.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// attacher les événements aux boutons des forfaits
document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const plan = btn.getAttribute('data-plan');
        openModal(plan);
    });
});

// fermer la popup
document.querySelector('.close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('signupForm').reset();
    document.getElementById('formStatus').innerHTML = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// SOUMISSION DU FORMULAIRE (intégration Sender.net)
const signupForm = document.getElementById('signupForm');
const statusDiv = document.getElementById('formStatus');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const plan = document.getElementById('selectedPlan').value;
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pseudonym = document.getElementById('pseudonym')?.value.trim() || '';
    
    if (!name || !email) {
        statusDiv.innerHTML = '<div class="success-msg" style="background:#fce8e6; color:#a13e2d;">Veuillez remplir le nom et l\'email.</div>';
        return;
    }
    if (plan === 'writer' && !pseudonym) {
        statusDiv.innerHTML = '<div class="success-msg" style="background:#fce8e6; color:#a13e2d;">Les rédacteurs doivent choisir un pseudonyme.</div>';
        return;
    }
    
    // stocker le pseudonyme dans localStorage pour le tableau rédacteur
    if (plan === 'writer' && pseudonym) {
        localStorage.setItem('cob_writer_pseudonym', pseudonym);
        localStorage.setItem('cob_writer_email', email);
    }
    
    // À remplacer par votre véritable endpoint Sender.net
    // Exemple :
    // const formData = new FormData(signupForm);
    // await fetch('https://sender.net/votre-endpoint', { method: 'POST', body: formData });
    
    const signupData = {
        plan: plan,
        name: name,
        email: email,
        phone: phone,
        pseudonym: pseudonym || null,
        timestamp: new Date().toISOString()
    };
    
    console.log('Inscription soumise :', signupData);
    
    statusDiv.innerHTML = '<div class="success-msg">✅ Inscription reçue ! ' + 
        (plan === 'writer' ? 'Vous recevrez un email de Cloudflare pour accéder au Tableau Rédacteur.' : 
        'Vous recevrez un lien de paiement et les détails d\'accès.') + '</div>';
    
    setTimeout(() => {
        modal.style.display = 'none';
        signupForm.reset();
        statusDiv.innerHTML = '';
        if (plan === 'writer') {
            alert('✍🏾 Bienvenue ! En tant que rédacteur, vous recevrez une invitation Cloudflare Zero Trust pour vous connecter au tableau de bord.');
        }
    }, 2500);
});