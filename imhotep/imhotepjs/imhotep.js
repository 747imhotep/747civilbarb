// ========================
//  Civilisation ou Barbarie
//  imhotep.js — JavaScript for Imhotep page
//  747civilbarb
// ========================

// List of your "Clés d'Imhotep"
const imhotepKeys = [
  "Clé 01. Selon les chercheurs, sous irradiation UVB, la phéomélanine peut agir comme photosensibilisateur en générant des radicaux libres, ce qui accentue les dommages oxydatifs infligés à l’ADN des cellules cutanées. La phéomélanine, jaune-rouge, a un faible pouvoir absorbant UVB.", 
  "Clé 02. La vitamine D3 module l’activité des lymphocytes T et B, ce qui aide à calibrer la réponse immunitaire pour qu’elle soit efficace sans être excessive. Une heure sous le soleil génère 2000 unités.",
  "Clé 03. Métissage: Le Brésil a connu une dynamique similaire à celle de l’Argentine, notamment au XIXᵉ siècle, avec une politique de métissage qui cherchait à effacer les distinctions raciales et à promouvoir un idéal de «blanchissement »",
  "Clé 04. Si l’on reconsidère l’énoncé « Imhotep est le père de la médecine et de l’architecture », on constate que, d’une certaine manière, il repose sur la même logique que des expressions comme « miracle grec » ou « l’Afrique a aussi pratiqué l’esclavage ». Dans tous ces cas, des réalités historiques complexes sont réduites à des formules simplificatrices, souvent chargées idéologiquement.",
  "Clé 05. L'agriculture est un sujet sensible. Certains utilisent la datation des premiers agriculteurs pour construire un narratif à des fins politiques pour - selon l'expression de Kalala Omotunde - \"organiser une escroquerie intellectuelle\".",
  "Clé 06. La diplomite. Une maladie liée au besoin de valorisation. A l'instar de la sapologie, elle pousse les individus à se focaliser sur la forme qui devient un outil d'argumentation.",
  "Clé 07. TEMPLATE: Rien n’est perdu tant qu’on continue à chercher."
];

const container = document.getElementById('imhotep-container');

// Duration for which a key is displayed (in ms)
const displayTime = 35000; // 35 seconds for reading

/**
 * Show a random Imhotep key with bold "Clé XX." and smooth fade
 */
function showRandomKey() {
  // Pick a random key
  const key = imhotepKeys[Math.floor(Math.random() * imhotepKeys.length)];

  // Split bold prefix
  const parts = key.split(' ', 2); // e.g. ["Clé", "01."]

  // Fade out existing paragraph if any
  const oldParagraph = container.querySelector('p');
  if (oldParagraph) {
    oldParagraph.classList.remove('fade-in');
    // Remove after fade-out duration (match CSS transition: 1.2s)
    setTimeout(() => {
      if (oldParagraph.parentNode) {
        oldParagraph.parentNode.removeChild(oldParagraph);
      }
    }, 1200);
  }

  // Create new paragraph element
  const p = document.createElement('p');
  p.classList.add('imhotep-key');

  // Insert HTML with bold prefix "Clé XX."
  p.innerHTML = `<strong>${parts[0]} ${parts[1]}</strong> ${key.slice(parts.join(' ').length + 1)}`;

  container.appendChild(p);

  // Fade out ankh background smoothly by setting CSS variable
  container.style.setProperty('--ankh-opacity', '0');

  // Trigger fade-in for text after next animation frame
  requestAnimationFrame(() => p.classList.add('fade-in'));

  // After displayTime, fade out text and restore ankh opacity
  setTimeout(() => {
    p.classList.remove('fade-in');
    container.style.setProperty('--ankh-opacity', '1');
  }, displayTime);
}

// Show first key immediately
showRandomKey();

// Repeat showing keys every displayTime + 5 seconds buffer
setInterval(showRandomKey, displayTime + 5000);