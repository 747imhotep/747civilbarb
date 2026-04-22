
  const texts = [
    "Select your language",
    "Sélectionnez votre langue"
  ];

  let index = 0;
  const el = document.getElementById("lang-text");

  setInterval(() => {
    // fade out
    el.classList.add("fade-out");

    setTimeout(() => {
      // switch text while invisible
      index = (index + 1) % texts.length;
      el.textContent = texts[index];

      // fade back in
      el.classList.remove("fade-out");
    }, 500); // match CSS transition time
  }, 2000);
