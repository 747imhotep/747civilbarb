// ========================
// Imhotep.js — Clean Version
// Handles random keys, fade-in/out, progress animation
// ========================

// Array of Imhotep keys (text snippets)
const imhotepKeys = [
    { text: "Clé 01. Selon les chercheurs, sous irradiation UVB, la phéomélanine peut agir comme photosensibilisateur en générant des radicaux libres, ce qui accentue les dommages oxydatifs infligés à l’ADN des cellules cutanées. La phéomélanine, jaune-rouge, a un faible pouvoir absorbant UVB.", week: 11 }, 
    { text: "Clé 02. La vitamine D3 module l’activité des lymphocytes T et B, ce qui aide à calibrer la réponse immunitaire pour qu’elle soit efficace sans être excessive. Une heure sous le soleil génère 2000 unités.", week: 11 },
    { text: "Clé 03. Métissage: Le Brésil a connu une dynamique similaire à celle de l’Argentine, notamment au XIXᵉ siècle, avec une politique de métissage qui cherchait à effacer les distinctions raciales et à promouvoir un idéal de «blanchissement »", week: 11 },
    { text: "Clé 04. Si l’on reconsidère l’énoncé « Imhotep est le père de la médecine et de l’architecture », on constate que, d’une certaine manière, il repose sur la même logique que des expressions comme « miracle grec » ou « l’Afrique a aussi pratiqué l’esclavage ». Dans tous ces cas, des réalités historiques complexes sont réduites à des formules simplificatrices, souvent chargées idéologiquement.", week: 12 },
    { text: "Clé 05. L'agriculture est un sujet sensible. Certains utilisent la datation des premiers agriculteurs pour construire un narratif à des fins politiques pour - selon l'expression de Kalala Omotunde - \"organiser une escroquerie intellectuelle\".", week: 12 },
    { text: "Clé 06. La diplomite. Une maladie liée au besoin de valorisation. A l'instar de la sapologie, elle pousse les individus à se focaliser sur la forme qui devient un outil d'argumentation.", week: 12 },
    { text: "Clé 07. A SUIVRE...: Rien n’est perdu tant qu’on continue à chercher.", week: 13 }
];

// ========================
// Step 2: function to calculate current week
// ========================
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1); // January 1st
  const diff = now - start;                        // milliseconds since Jan 1
  const oneWeek = 1000 * 60 * 60 * 24 * 7;        // milliseconds in a week
  return Math.floor(diff / oneWeek) + 1;          // week number starting at 1
}

// ====== Config ======
const displayTime = 35000; // 35 seconds per key
const fadeDuration = 1200; // 1.2s fade-in/out

// ====== DOM References ======
const container = document.getElementById('imhotep-container');
const screenReader = document.getElementById('imhotep-text'); // ARIA live region

const progressDot = document.getElementById('imhotep-progress-dot');
const progressAnkh = document.getElementById('imhotep-progress-ankh');

// ====== Helper: Format key with bold prefix ======
function formatKey(key) {
  const match = key.match(/^(Clé \d+\.)\s*(.*)/);
  if (!match) return key;
  return `<strong>${match[1]}</strong> ${match[2]}`;
}

// ====== Step 3: Determine keys for current week ======
const currentWeek = getCurrentWeek();
const keysThisWeek = imhotepKeys.filter(key => key.week === currentWeek);

// Optional: shuffle keys
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
const keysThisWeekShuffled = shuffleArray(keysThisWeek);

// ====== Step 4: Track seen keys per visitor ======
let seenKeys = [];
const storageKey = "imhotepSeenKeys";
const saved = JSON.parse(localStorage.getItem(storageKey));
if(saved && saved.week === currentWeek){
  seenKeys = saved.seen;
} else {
  seenKeys = [];
}

// ====== Show Random Key ======
function showRandomKey() {
  if(keysThisWeekShuffled.length === 0) return; // safety check

  // Find indexes of keys not yet shown
  const availableIndexes = keysThisWeekShuffled
    .map((k, i) => i)
    .filter(i => !seenKeys.includes(i));

  // If all keys already seen, reset seenKeys
  if(availableIndexes.length === 0){
    seenKeys = [];
    localStorage.setItem(storageKey, JSON.stringify({ week: currentWeek, seen: seenKeys }));
    availableIndexes.push(0,1,2); // all keys available again
  }

  // Pick a random index
  const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  const keyObj = keysThisWeekShuffled[randomIndex];

  // Mark as seen
  seenKeys.push(randomIndex);
  localStorage.setItem(storageKey, JSON.stringify({ week: currentWeek, seen: seenKeys }));

  const key = keyObj.text;

  // ========================
  // Update global variable for Sender popup
  // ========================
  window.currentImhotepKey = key;

  // Update ARIA live region
  screenReader.textContent = key;

  // Remove existing key if present
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

  // Insert before the progress bar
  container.insertBefore(p, progressDot.parentNode);

  // Trigger fade-in
  requestAnimationFrame(() => p.classList.add('fade-in'));
  container.style.setProperty('--ankh-opacity', '0');

  // Animate progress dot
  progressDot.style.transition = 'none';
  progressDot.style.left = '0';
  progressDot.offsetHeight; // Force reflow
  progressDot.style.transition = `left ${displayTime}ms linear`;
  progressDot.style.left = '100%';

  // Schedule fade-out
  setTimeout(() => {
    p.classList.remove('fade-in');
    container.style.setProperty('--ankh-opacity', '1');
  }, displayTime);
}

// ====== Kickoff ======
// Show the first key immediately
showRandomKey();

// Repeat showing keys every displayTime + fadeDuration
setInterval(showRandomKey, displayTime + fadeDuration);

// ========================
// Observe Sender popup textarea and prefill with current key
// ========================
// ========================== START OF OBSERVER (commented out for now) ==========================
// const observer = new MutationObserver(() => {
//   const textarea = document.querySelector("textarea");
//   if (textarea && window.currentImhotepKey && !textarea.value) {
//     textarea.value = window.currentImhotepKey + " — ";
//     textarea.focus();
//   }
// });
// ======================== ENND OF OBSERVER ========================

observer.observe(document.body, {
  childList: true,
  subtree: true
});