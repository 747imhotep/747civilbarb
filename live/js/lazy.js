// :::::::::::::::::::::::::::::::::::::::
// Lazy load Sender form on button click
// - Waits for DOMContentLoaded
// - Loads form only when user clicks button
// - Prevents unnecessary load on initial page load
// :::::::::::::::::::::::::::::::::::::::


document.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("openAccessForm");
  const container = document.getElementById("sender-form-container");

  if (!btn || !container) return;

  btn.addEventListener("click", function () {
    container.style.display = "block";

    setTimeout(() => {
    container.classList.add("visible");
    }, 10);
    container.scrollIntoView({ behavior: "smooth" });
  });

  const link = document.querySelector(".btn-primary");

if (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const overlay = document.getElementById("page-transition");
    overlay.classList.add("active");

    setTimeout(() => {
      window.location.href = link.href;
    }, 500);
  });
}

});