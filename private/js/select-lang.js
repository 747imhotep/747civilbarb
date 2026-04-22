
  const texts = [
    "Select your language",
    "Sélectionnez votre langue"
  ];

  let index = 0;
  const el = document.getElementById("lang-text");

  setInterval(() => {
    index = (index + 1) % texts.length;
    el.textContent = texts[index];
  }, 2000);
