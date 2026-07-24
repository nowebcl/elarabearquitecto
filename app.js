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

  // Mobile Nav Toggle Interaction
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Services Accordion Interaction
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.paddingLeft = '1.5rem';
      item.querySelector('.service-icon').style.color = '#111';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.paddingLeft = '0';
      item.querySelector('.service-icon').style.color = 'var(--text-muted-dark)';
    });
  });

  // Dynamic Gallery Filtering & Lightbox Modal
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let activeItems = Array.from(galleryItems);
  let currentIndex = 0;

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      activeItems = [];

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '1';
          activeItems.push(item);
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });
    });
  });

  // Open Lightbox
  function openLightbox(index) {
    if (activeItems.length === 0) return;
    currentIndex = index;
    updateLightbox();
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function updateLightbox() {
    const item = activeItems[currentIndex];
    if (!item) return;

    lightboxImage.src = item.getAttribute('data-src');
    lightboxCategory.textContent = item.querySelector('.gallery-category').textContent;
    lightboxTitle.textContent = item.getAttribute('data-title') || '';
    lightboxDesc.textContent = item.getAttribute('data-desc') || '';
    lightboxCounter.textContent = `${currentIndex + 1} / ${activeItems.length}`;
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = activeItems.indexOf(item);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
      updateLightbox();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % activeItems.length;
      updateLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
      updateLightbox();
    }
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % activeItems.length;
      updateLightbox();
    }
  });
  // Dynamic CTA Form Submission connected to Cloud Firestore
  const ctaContactForm = document.getElementById('ctaContactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (ctaContactForm) {
    ctaContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = ctaContactForm.querySelector('.btn-form-submit');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<span>ENVIANDO...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;

      const formData = {
        nombre: document.getElementById('formName').value.trim(),
        telefono: document.getElementById('formPhone').value.trim(),
        email: document.getElementById('formEmail').value.trim(),
        servicio: document.getElementById('formService').value,
        mensaje: document.getElementById('formMessage').value.trim(),
        fecha: window.serverTimestamp ? window.serverTimestamp() : new Date().toISOString(),
        estado: 'Nuevo'
      };

      try {
        if (window.db && window.addDoc && window.collection) {
          await window.addDoc(window.collection(window.db, 'consultas'), formData);
        } else {
          console.warn('Firestore database loading or fallback simulation active.');
        }

        submitBtn.innerHTML = '<span>¡CONSULTA REGISTRADA!</span> <i class="fa-solid fa-check"></i>';
        submitBtn.style.background = '#25D366';
        submitBtn.style.color = '#ffffff';

        if (formFeedback) {
          formFeedback.textContent = '¡Gracias por contactarnos! Tu proyecto ha sido guardado con éxito en nuestra base de datos.';
          formFeedback.classList.remove('error');
          formFeedback.classList.add('success');
        }

        ctaContactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
        }, 5000);

      } catch (error) {
        console.error('Error guardando consulta en Firestore:', error);
        submitBtn.innerHTML = '<span>ERROR AL ENVIAR</span> <i class="fa-solid fa-triangle-exclamation"></i>';
        submitBtn.style.background = '#dc2743';

        if (formFeedback) {
          formFeedback.textContent = 'Hubo un inconveniente al guardar la consulta. Por favor inténtalo nuevamente.';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
        }, 4000);
      }
    });
  }
  
});
