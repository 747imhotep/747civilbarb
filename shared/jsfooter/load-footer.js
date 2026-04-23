//:::::::::::::::::::
// Load Footer
//:::::::::::::::::::


fetch('/shared/footer/footer.html')
  .then(res => res.text())
  .then(html => {
    document.querySelector('footer-placeholder').innerHTML = html;
  });