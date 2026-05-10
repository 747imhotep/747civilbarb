//=================================================
// 747 Civil Barbarians - Pricing Page JS
//==============================================

// This script handles the interactive behavior of the pricing page, including:
// - Opening and customizing the signup modal based on the selected plan
// - Submitting the signup form to a backend (e.g., Sender.net) and providing user feedback


// MODAL HANDLING
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
        modalTitle.innerText = '✍️ Become a Writer';
        modalPlanBadge.innerText = 'Writer application';
        pseudonymGroup.style.display = 'block';
        document.getElementById('pseudonym').required = true;
    } else if (plan === 'premium') {
        modalTitle.innerText = '✨ Choose Premium – 12 texts / year';
        modalPlanBadge.innerText = 'Annual donation €12–30';
        pseudonymGroup.style.display = 'none';
        if(document.getElementById('pseudonym')) document.getElementById('pseudonym').required = false;
    } else if (plan === 'volunteer') {
        modalTitle.innerText = '🤝 Volunteer – full archive';
        modalPlanBadge.innerText = 'Donation > €30 / year';
        pseudonymGroup.style.display = 'none';
    } else {
        modalTitle.innerText = '📖 Free access';
        modalPlanBadge.innerText = 'No payment needed';
        pseudonymGroup.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// attach to all plan buttons
document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const plan = btn.getAttribute('data-plan');
        openModal(plan);
    });
});

// close modal
document.querySelector('.close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('signupForm').reset();
    document.getElementById('formStatus').innerHTML = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// SUBMIT FORM (Sender.net integration)
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
        statusDiv.innerHTML = '<div class="success-msg" style="background:#fce8e6; color:#a13e2d;">Please fill name and email.</div>';
        return;
    }
    if (plan === 'writer' && !pseudonym) {
        statusDiv.innerHTML = '<div class="success-msg" style="background:#fce8e6; color:#a13e2d;">Writers must choose a pseudonym.</div>';
        return;
    }
    
    // store pseudonym in localStorage for writer dashboard
    if (plan === 'writer' && pseudonym) {
        localStorage.setItem('cob_writer_pseudonym', pseudonym);
        localStorage.setItem('cob_writer_email', email);
    }
    
    // TODO: Replace with your actual Sender.net form endpoint
    // Example:
    // const formData = new FormData(signupForm);
    // await fetch('https://sender.net/your-form-endpoint', { method: 'POST', body: formData });
    
    const signupData = {
        plan: plan,
        name: name,
        email: email,
        phone: phone,
        pseudonym: pseudonym || null,
        timestamp: new Date().toISOString()
    };
    
    console.log('Signup submitted:', signupData);
    
    statusDiv.innerHTML = '<div class="success-msg">✅ Signup received! ' + 
        (plan === 'writer' ? 'You will receive an email from Cloudflare to access the Writer Dashboard.' : 
        'You will receive a payment link and access details.') + '</div>';
    
    setTimeout(() => {
        modal.style.display = 'none';
        signupForm.reset();
        statusDiv.innerHTML = '';
        if (plan === 'writer') {
            alert('✍️ Welcome! As a writer, you will receive an invite from Cloudflare Zero Trust to log in to the dashboard.');
        }
    }, 2500);
});