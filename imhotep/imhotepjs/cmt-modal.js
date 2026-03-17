// ==================================
// Civilisation ou Barbarie
// CMT Modal JavaScript
// ==================================

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.getElementById("cmt-modal");
  const openBtn = document.getElementById("open-cmt-modal");
  const closeBtn = document.querySelector("#cmt-modal .cmt-close");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });

});