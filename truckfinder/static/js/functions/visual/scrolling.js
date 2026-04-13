// Authored : Andre Nunes da Silva @ 4:24 PM

const observer = new IntersectionObserver((entries) => { // Creates an observer that watches for elements entering/leaving the viewport
    entries.forEach(entry => { // loops thru every element being watched
      if (entry.isIntersecting) { // if its visible on the screen as a class called visible
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible'); // if not visible anymore remove
      }
    });
  }, { threshold: 0.22 }); // 22% of the element being in view

  // Find every card and section blob on the page and watch them with the observer, able to add more class names to it later, if you want to use this feature.
  document.querySelectorAll('.card, .middle, .section-blob, .stat-card, .about-left').forEach(el => {
    observer.observe(el);
  });