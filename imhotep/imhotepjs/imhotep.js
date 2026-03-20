// ========================
// Imhotep.js — JSON Version
// Handles random keys, fade-in/out, progress animation
// 289 lines
// ========================

let imhotepKeys = [];
let recentKeyNumbers = [];
let keysThisWeekShuffled = [];
let seenKeys = [];
let currentWeek;
let modalJustOpened = false; // Track when modal opens

// ====== PROFESSIONAL: Store latest key instantly ======
let latestKey = ''; // Add this line

// ====== DOM References ======
const container = document.getElementById('imhotep-container');
const screenReader = document.getElementById('imhotep-text');
const progressDot = document.getElementById('imhotep-progress-dot');
const progressAnkh = document.getElementById('imhotep-progress-ankh');

// ====== Config ======
const displayTime = 35000;
const fadeDuration = 1200;

// ====== Load keys from JSON ======
fetch('/imhotep/imhotep-keys.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load Imhotep keys');
    }
    return response.json();
  })
  .then(data => {
    imhotepKeys = data;
    initializeImhotep();
  })
  .catch(error => {
    console.error('Error loading Imhotep keys:', error);
    if (container) {
      container.innerHTML = '<p class="error">Clés temporairement indisponibles</p>';
    }
  });

// ====== Initialize everything once keys are loaded ======
function initializeImhotep() {

  currentWeek = getCurrentWeek();

  const keysThisWeek = imhotepKeys.filter(key => key.week === currentWeek);
  keysThisWeekShuffled = shuffleArray(keysThisWeek);

  const storageKey = "imhotepSeenKeys";
  const saved = JSON.parse(localStorage.getItem(storageKey));

  if(saved && saved.week === currentWeek){
    seenKeys = saved.seen;
  } else {
    seenKeys = [];
  }

  const existingTextarea = document.querySelector("textarea");
  if (existingTextarea) {
    existingTextarea.value = '';
  }

  showRandomKey();
  setInterval(showRandomKey, displayTime + fadeDuration);
}

// ====== Helper: Get current week number ======
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

// ====== Helper: Shuffle array ======
function shuffleArray(arr) {
  if (!arr || arr.length === 0) return [];
  return [...arr].sort(() => Math.random() - 0.5);
}

// ====== Helper: Format key ======
function formatKey(key) {
  const match = key.match(/^(Clé \d+\.)\s*(.*)/);
  if (!match) return key;
  return `<strong>${match[1]}</strong> ${match[2]}`;
}

// ====== Show Random Key ======
function showRandomKey() {

  if(!keysThisWeekShuffled || keysThisWeekShuffled.length === 0) return;

  const availableIndexes = keysThisWeekShuffled
    .map((k, i) => i)
    .filter(i => !seenKeys.includes(i));

  if(availableIndexes.length === 0){
    seenKeys = [];
    localStorage.setItem("imhotepSeenKeys", JSON.stringify({ week: currentWeek, seen: seenKeys }));
    availableIndexes.push(...keysThisWeekShuffled.map((_, i) => i));
  }

  const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  const keyObj = keysThisWeekShuffled[randomIndex];

  seenKeys.push(randomIndex);
  localStorage.setItem("imhotepSeenKeys", JSON.stringify({ week: currentWeek, seen: seenKeys }));

  const key = keyObj.text;

  const keyNumberMatch = key.match(/^(Clé \d+\.)/);
  const keyNumber = keyNumberMatch ? keyNumberMatch[1] : "Clé";

  // ====== STORE LATEST KEY INSTANTLY ======
  latestKey = keyNumber; // THIS IS THE KEY LINE

  recentKeyNumbers.push(keyNumber);
  if (recentKeyNumbers.length > 3) {
    recentKeyNumbers.shift();
  }

  // Backup to sessionStorage
  sessionStorage.setItem('imhotep_backup', JSON.stringify(recentKeyNumbers));
  console.log('💾 Keys backed up to sessionStorage:', recentKeyNumbers);

  window.currentImhotepKey = recentKeyNumbers.join(' ');

  screenReader.textContent = key;

  const oldKey = container.querySelector('p.imhotep-key');

  if (oldKey) {

    oldKey.classList.remove('fade-in');
    container.style.setProperty('--ankh-opacity', '1');

    setTimeout(() => {

      if (oldKey.parentNode) oldKey.parentNode.removeChild(oldKey);
      insertNewKey(key);

    }, fadeDuration);

  } else {
    insertNewKey(key);
  }
}

// ====== Insert New Key ======
function insertNewKey(key) {

  const p = document.createElement('p');
  p.classList.add('imhotep-key');
  p.innerHTML = formatKey(key);

  container.insertBefore(p, progressDot.parentNode);

  requestAnimationFrame(() => p.classList.add('fade-in'));
  container.style.setProperty('--ankh-opacity', '0');

  progressDot.style.transition = 'none';
  progressDot.style.left = '0';
  progressDot.offsetHeight;

  progressDot.style.transition = `left ${displayTime}ms linear`;
  progressDot.style.left = '100%';

  setTimeout(() => {

    p.classList.remove('fade-in');
    container.style.setProperty('--ankh-opacity', '1');

  }, displayTime);
}


// ============================================
// PROFESSIONAL: MODAL WITH INSTANT KEY DISPLAY
// ============================================

const observer = new MutationObserver(() => {

  const textarea = document.querySelector("textarea");
  const modal = document.querySelector('.cmt-modal');
  const cleField = document.querySelector('#cle'); // Hidden field for backend
  const cleDisplay = document.querySelector('#cle_display'); // Visible field for users

  if (modal && modal.classList.contains('active') && !modalJustOpened) {

    modalJustOpened = true;

    // Clear fields immediately
    if (cleField) cleField.value = '';
    if (cleDisplay) cleDisplay.value = '';
    if (textarea) textarea.value = '';

    // ====== INSTANT FILL - NO DELAY ======
    if (latestKey) {
      // Use the stored key - INSTANT!
      if (cleField) cleField.value = latestKey;
      if (cleDisplay) cleDisplay.value = latestKey;
      console.log('✅ INSTANT Key display:', latestKey);
    } else {
      // Fallback to DOM if no stored key
      const currentDisplay = document.querySelector('#imhotep-container .imhotep-key');
      if (currentDisplay) {
        const displayedText = currentDisplay.innerText || currentDisplay.textContent;
        const match = displayedText.match(/(Clé\s+\d+\.)/);
        if (match) {
          const currentKey = match[1];
          if (cleField) cleField.value = currentKey;
          if (cleDisplay) cleDisplay.value = currentKey;
          console.log('✅ Fallback Key display:', currentKey);
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


// ============================================
// FORM VALIDATION + CLEANUP
// ============================================

document.addEventListener('submit', function(e) {

  if (e.target.classList.contains('cmt-modal-content') || e.target.querySelector('textarea')) {

    const cleField = document.querySelector('#cle');
    const cleDisplay = document.querySelector('#cle_display');
    const textarea = document.querySelector('textarea');

    // Clean up after submission
    setTimeout(() => {

      if (cleField) cleField.value = '';
      if (cleDisplay) cleDisplay.value = '';
      if (textarea) textarea.value = '';

      recentKeyNumbers = [];
      window.currentImhotepKey = '';

      const modal = document.querySelector('.cmt-modal');

      if (modal) {
        modal.classList.remove('active');
      }

      console.log('✅ Champs nettoyés après envoi');

    }, 500);
  }

});


// ============================================
// MANUAL RESET FUNCTION
// ============================================

function resetCommentFields() {

  const cleField = document.querySelector('#cle');
  const cleDisplay = document.querySelector('#cle_display');
  const textarea = document.querySelector('textarea');

  if (cleField) cleField.value = '';
  if (cleDisplay) cleDisplay.value = '';
  if (textarea) textarea.value = '';

  recentKeyNumbers = [];
  window.currentImhotepKey = '';

  console.log('🔄 Champs réinitialisés manuellement');

}

window.resetCommentFields = resetCommentFields;