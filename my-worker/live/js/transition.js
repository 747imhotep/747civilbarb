//:::::::::::::::::::::::::
//  Page Transition Logic  //
//:::::::::::::::::::::::::

document.addEventListener("DOMContentLoaded", function () {

  const overlay = document.getElementById("page-transition");

  // Target ALL links (or just specific ones)
  const links = document.querySelectorAll("a");

  links.forEach(link => {
    link.addEventListener("click", function (e) {

      const href = link.getAttribute("href");

      // Ignore anchors or empty links
      if (!href || href.startsWith("#")) return;

      e.preventDefault();

      overlay.classList.add("active");

      setTimeout(() => {
        window.location.href = href;
      }, 500); // match CSS duration
    });
  });

});