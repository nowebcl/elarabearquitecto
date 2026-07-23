// Minimal JS for the new layout interactions
document.addEventListener('DOMContentLoaded', () => {
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(18, 18, 18, 0.95)';
      navbar.style.backdropFilter = 'blur(10px)';
      navbar.style.position = 'fixed';
    } else {
      navbar.style.background = 'transparent';
      navbar.style.backdropFilter = 'none';
      navbar.style.position = 'absolute';
    }
  });

  // Services Accordion Interaction
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Optional: Add hover state logic if needed
      item.style.paddingLeft = '1.5rem';
      item.querySelector('.service-icon').style.color = '#111';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.paddingLeft = '0';
      item.querySelector('.service-icon').style.color = 'var(--text-muted-dark)';
    });
  });
  
});
