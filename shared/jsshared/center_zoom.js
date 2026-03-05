if (window.matchMedia('(hover: hover)').matches) {
  const images = document.querySelectorAll('.article-hero-image');

  images.forEach(img => {
    img.addEventListener('mousemove', e => {
      const rect = img.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(1.2)';
    });

    img.addEventListener('mouseleave', () => {
      img.style.transformOrigin = 'center center';
      img.style.transform = 'scale(1)';
    });
  });

}

  
