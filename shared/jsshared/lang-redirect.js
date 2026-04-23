//:::::::::::::::::::::::::::::
// Language Redirect Script
//:::::::::::::::::::::::::::::


document.addEventListener("DOMContentLoaded", () => {
  const delay = 6000;

  const lang = navigator.language || navigator.userLanguage;
  const target = lang.startsWith("fr") ? "/fr/" : "/en/";

  let redirected = false;

  const timer = setTimeout(() => {
    if (!redirected) {
      window.location.href = target;
    }
  }, delay);

  const links = document.querySelectorAll(".lang-link");

  links.forEach(link => {
    link.addEventListener("click", () => {
      redirected = true;
      clearTimeout(timer);
    });
  });
});