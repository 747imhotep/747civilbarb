//:::::::::::::::::::
// Load Footer
//:::::::::::::::::::


const lang = document.documentElement.lang || 'en';

const footerFile =
  lang === 'fr'
    ? '/shared/footer/footer-fr.html'
    : '/shared/footer/footer-en.html';

fetch(footerFile)
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });