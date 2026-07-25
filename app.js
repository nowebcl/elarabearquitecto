// Clean Application JS - El Arabe Arquitecto
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
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
  }

  // 2. Mobile Navigation Toggle
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

  // 3. Services Accordion Interaction
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.paddingLeft = '1.5rem';
      const icon = item.querySelector('.service-icon');
      if (icon) icon.style.color = '#111';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.paddingLeft = '0';
      const icon = item.querySelector('.service-icon');
      if (icon) icon.style.color = 'var(--text-muted-dark)';
    });
  });

  // 4. Dynamic Gallery Filtering & Lightbox Modal
  const filterBtns = document.querySelectorAll('.filter-btn');
  let galleryItems = document.querySelectorAll('.gallery-item');
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

  function bindGalleryItemEvents() {
    galleryItems = document.querySelectorAll('.gallery-item');
    activeItems = Array.from(galleryItems);

    galleryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.admin-card-actions')) return;
        const idx = activeItems.indexOf(item);
        if (idx !== -1) {
          openLightbox(idx);
        }
      });
    });
  }

  function openLightbox(index) {
    if (!lightboxModal || activeItems.length === 0) return;
    currentIndex = index;
    updateLightbox();
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function updateLightbox() {
    const item = activeItems[currentIndex];
    if (!item) return;

    if (lightboxImage) lightboxImage.src = item.getAttribute('data-src');
    if (lightboxCategory) {
      const catEl = item.querySelector('.gallery-category');
      lightboxCategory.textContent = catEl ? catEl.textContent : '';
    }
    if (lightboxTitle) lightboxTitle.textContent = item.getAttribute('data-title') || '';
    if (lightboxDesc) lightboxDesc.textContent = item.getAttribute('data-desc') || '';
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${activeItems.length}`;
  }

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
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
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

  bindGalleryItemEvents();

  // 5. Real-time Text Sync from Cloud Firestore (site_content/landing)
  function initDynamicContentSync() {
    if (!window.db || !window.doc || !window.onSnapshot) {
      setTimeout(initDynamicContentSync, 300);
      return;
    }

    try {
      const docRef = window.doc(window.db, 'site_content', 'landing');
      window.onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const isEditing = document.activeElement && document.activeElement.isContentEditable;
          
          if (!isEditing) {
            if (data.heroTitle && document.getElementById('heroTitle')) document.getElementById('heroTitle').innerHTML = data.heroTitle.replace(/\n/g, '<br>');
            if (data.heroSubtitle && document.getElementById('heroSubtitle')) document.getElementById('heroSubtitle').innerHTML = data.heroSubtitle.replace(/\n/g, '<br>');
            if (data.heroLocation && document.getElementById('heroLocation')) document.getElementById('heroLocation').textContent = data.heroLocation;
            if (data.introHeading && document.getElementById('introHeading')) document.getElementById('introHeading').textContent = data.introHeading;
            if (data.introTitle && document.getElementById('introTitle')) document.getElementById('introTitle').textContent = data.introTitle;
            if (data.aboutTitle && document.getElementById('aboutTitle')) document.getElementById('aboutTitle').textContent = data.aboutTitle;
            if (data.aboutP1 && document.getElementById('aboutP1')) document.getElementById('aboutP1').textContent = data.aboutP1;
            if (data.aboutP2 && document.getElementById('aboutP2')) document.getElementById('aboutP2').textContent = data.aboutP2;
            if (data.ctaTitle && document.getElementById('ctaTitle')) document.getElementById('ctaTitle').innerHTML = data.ctaTitle.replace(/\n/g, '<br>');
            if (data.ctaDesc && document.getElementById('ctaDesc')) document.getElementById('ctaDesc').textContent = data.ctaDesc;
          }
        }
      });
    } catch (e) {
      console.warn('Dynamic content sync notice:', e);
    }
  }

  // 6. Real-time Gallery Sync from Cloud Firestore (gallery)
  function initDynamicGallerySync() {
    if (!window.db || !window.collection || !window.onSnapshot) {
      setTimeout(initDynamicGallerySync, 400);
      return;
    }

    try {
      const galleryRef = window.collection(window.db, 'gallery');
      const galleryGrid = document.getElementById('galleryGrid');

      window.onSnapshot(galleryRef, (snapshot) => {
        if (!snapshot.empty && galleryGrid) {
          const docs = [];
          snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));

          galleryGrid.innerHTML = docs.map(item => `
            <div class="project-card gallery-item" data-category="${item.category || 'all'}" data-src="${item.url}" data-title="${item.title || ''}" data-desc="${item.desc || ''}">
              <img src="${item.url}" alt="${item.title || 'Proyecto'}" loading="lazy">
              <div class="gallery-overlay">
                <span class="gallery-category">${item.categoryLabel || item.category || 'Proyecto'}</span>
                <h3 class="gallery-item-title">${item.title || ''}</h3>
                <div class="gallery-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
              </div>
              ${window.isAdminLoggedIn ? `
                <div class="admin-card-actions">
                  <button onclick="replaceGalleryCardImage('${item.id}', '${item.storagePath || ''}')" title="Reemplazar Imagen">📷 Reemplazar</button>
                  <button onclick="deleteGalleryCardImage('${item.id}', '${item.storagePath || ''}')" title="Eliminar Imagen">🗑️</button>
                </div>
              ` : ''}
            </div>
          `).join('');

          bindGalleryItemEvents();
        }
      });
    } catch (e) {
      console.warn('Dynamic gallery sync notice:', e);
    }
  }

  initDynamicContentSync();
  initDynamicGallerySync();

  // 7. Contact Form Submission connected to Cloud Firestore
  const ctaContactForm = document.getElementById('ctaContactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (ctaContactForm) {
    ctaContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = ctaContactForm.querySelector('.btn-form-submit');
      const originalText = submitBtn ? submitBtn.innerHTML : 'ENVIAR';
      
      const name = document.getElementById('formName') ? document.getElementById('formName').value.trim() : '';
      const phone = document.getElementById('formPhone') ? document.getElementById('formPhone').value.trim() : '';
      const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value.trim() : '';
      const service = document.getElementById('formService') ? document.getElementById('formService').value : 'General';
      const message = document.getElementById('formMessage') ? document.getElementById('formMessage').value.trim() : '';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        if (formFeedback) {
          formFeedback.textContent = 'Por favor ingresa tu nombre completo.';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }
        return;
      }

      if (!phone) {
        if (formFeedback) {
          formFeedback.textContent = 'Por favor ingresa tu número de teléfono o WhatsApp.';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }
        return;
      }

      if (!email || !emailRegex.test(email)) {
        if (formFeedback) {
          formFeedback.textContent = 'El correo electrónico ingresado no es válido. Ejemplo: contacto@dominio.cl';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }
        return;
      }

      if (!message) {
        if (formFeedback) {
          formFeedback.textContent = 'Por favor ingresa los detalles o mensaje de tu proyecto.';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.innerHTML = '<span>ENVIANDO CONSULTA...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
      }

      const formData = {
        nombre: name,
        telefono: phone,
        email: email,
        servicio: service || 'General',
        mensaje: message,
        fecha: new Date().toISOString(),
        estado: 'Nuevo'
      };

      try {
        if (window.db && window.addDoc && window.collection) {
          await window.addDoc(window.collection(window.db, 'consultas'), formData);
        }

        if (submitBtn) {
          submitBtn.innerHTML = '<span>¡CONSULTA ENVIADA!</span> <i class="fa-solid fa-check"></i>';
          submitBtn.style.background = '#25D366';
          submitBtn.style.color = '#ffffff';
        }

        if (formFeedback) {
          formFeedback.textContent = '¡Gracias por contactarnos! Evaluaremos tu proyecto y nos comunicaremos a la brevedad.';
          formFeedback.classList.remove('error');
          formFeedback.classList.add('success');
        }

        ctaContactForm.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
          }
        }, 5000);

      } catch (error) {
        console.error('Error enviando consulta:', error);
        if (submitBtn) {
          submitBtn.innerHTML = '<span>ERROR AL ENVIAR</span> <i class="fa-solid fa-triangle-exclamation"></i>';
          submitBtn.style.background = '#dc2743';
        }

        if (formFeedback) {
          formFeedback.textContent = 'Hubo un error al enviar tu mensaje. Verifica tu conexión e inténtalo nuevamente.';
          formFeedback.classList.remove('success');
          formFeedback.classList.add('error');
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
          }
        }, 4000);
      }
    });
  }

  // 8. Admin Mode Guard & Live Visual Text Editing
  function initVisualEditorMode() {
    // SECURITY: Never enable editor mode unless we are embedded inside the admin panel iframe.
    if (window.self === window.top) {
      return;
    }

    if (!window.auth || !window.onAuthStateChanged) {
      setTimeout(initVisualEditorMode, 150);
      return;
    }

    const adminGalleryHeaderBtn = document.getElementById('adminGalleryHeaderBtn');
    const editableIds = [
      'heroTitle', 'heroSubtitle', 'heroLocation',
      'introHeading', 'introTitle', 'aboutTitle',
      'aboutP1', 'aboutP2', 'ctaTitle', 'ctaDesc'
    ];

    window.onAuthStateChanged(window.auth, (user) => {
      if (user) {
        window.isAdminLoggedIn = true;
        if (adminGalleryHeaderBtn) adminGalleryHeaderBtn.style.display = 'block';

        editableIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.contentEditable = 'true';
            el.classList.add('editable-active');
          }
        });

        initDynamicGallerySync();

      } else {
        window.isAdminLoggedIn = false;
        if (adminGalleryHeaderBtn) adminGalleryHeaderBtn.style.display = 'none';

        editableIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.contentEditable = 'false';
            el.classList.remove('editable-active');
          }
        });
      }
    });
  }

  // 9. Global Save Function for Admin Panel Top Bar
  window.saveVisualEdits = async () => {
    const getHtml = (id) => {
      const el = document.getElementById(id);
      return el ? el.innerHTML.replace(/<br>/gi, '\n').trim() : '';
    };
    const getText = (id) => {
      const el = document.getElementById(id);
      return el ? el.textContent.trim() : '';
    };

    const updatedData = {
      heroTitle: getHtml('heroTitle'),
      heroSubtitle: getHtml('heroSubtitle'),
      heroLocation: getText('heroLocation'),
      introHeading: getText('introHeading'),
      introTitle: getText('introTitle'),
      aboutTitle: getText('aboutTitle'),
      aboutP1: getText('aboutP1'),
      aboutP2: getText('aboutP2'),
      ctaTitle: getHtml('ctaTitle'),
      ctaDesc: getText('ctaDesc'),
      updatedAt: new Date().toISOString()
    };

    if (window.db && window.doc && window.setDoc) {
      await window.setDoc(window.doc(window.db, 'site_content', 'landing'), updatedData, { merge: true });
      return true;
    }
    return false;
  };

  // 10. Gallery Upload Modal Logic
  const btnOpenVisualAddImage = document.getElementById('btnOpenVisualAddImage');
  const visualGalleryModal = document.getElementById('visualGalleryModal');
  const btnCloseVisualGalleryModal = document.getElementById('btnCloseVisualGalleryModal');
  const visualGalleryForm = document.getElementById('visualGalleryForm');

  if (btnOpenVisualAddImage && visualGalleryModal) {
    btnOpenVisualAddImage.addEventListener('click', () => {
      visualGalleryModal.style.display = 'flex';
    });
  }

  if (btnCloseVisualGalleryModal && visualGalleryModal) {
    btnCloseVisualGalleryModal.addEventListener('click', () => {
      visualGalleryModal.style.display = 'none';
    });
  }

  if (visualGalleryForm) {
    visualGalleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('vGalleryFile');
      const file = fileInput ? fileInput.files[0] : null;
      const title = document.getElementById('vGalleryTitle') ? document.getElementById('vGalleryTitle').value.trim() : '';
      const category = document.getElementById('vGalleryCategory') ? document.getElementById('vGalleryCategory').value : 'residencial';
      const desc = document.getElementById('vGalleryDesc') ? document.getElementById('vGalleryDesc').value.trim() : '';
      const btnSubmit = document.getElementById('btnSubmitVGallery');

      if (!file) return;

      const categoryLabels = {
        residencial: 'Residencial',
        diseno: 'Diseño',
        regularizacion: 'Regularización'
      };

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SUBIENDO A STORAGE...';
      }

      try {
        const storagePath = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storageRef = window.ref(window.storage, storagePath);
        const uploadTask = window.uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', null, (err) => console.error(err), async () => {
          const downloadURL = await window.getDownloadURL(uploadTask.snapshot.ref);

          await window.addDoc(window.collection(window.db, 'gallery'), {
            title,
            category,
            categoryLabel: categoryLabels[category] || category,
            desc,
            url: downloadURL,
            storagePath,
            timestamp: new Date().toISOString()
          });

          if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> ¡IMAGEN AGREGADA!';
            btnSubmit.style.background = '#25D366';
          }

          setTimeout(() => {
            visualGalleryForm.reset();
            if (btnSubmit) {
              btnSubmit.disabled = false;
              btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> SUBIR E INSERTAR EN LA GALERÍA';
              btnSubmit.style.background = '';
            }
            if (visualGalleryModal) visualGalleryModal.style.display = 'none';
          }, 1500);
        });

      } catch (err) {
        console.error('Error subiendo imagen:', err);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'ERROR AL SUBIR';
        }
      }
    });
  }

  // 11. Gallery Card Actions (Replace / Delete)
  window.replaceGalleryCardImage = (docId, oldStoragePath) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const newStoragePath = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storageRef = window.ref(window.storage, newStoragePath);
      
      try {
        const uploadTask = window.uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', null, null, async () => {
          const downloadURL = await window.getDownloadURL(uploadTask.snapshot.ref);

          await window.setDoc(window.doc(window.db, 'gallery', docId), {
            url: downloadURL,
            storagePath: newStoragePath,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          if (oldStoragePath) {
            const oldRef = window.ref(window.storage, oldStoragePath);
            window.deleteObject(oldRef).catch(err => console.warn(err));
          }
        });
      } catch (err) {
        console.error('Error reemplazando imagen:', err);
      }
    };
    input.click();
  };

  window.deleteGalleryCardImage = async (docId, storagePath) => {
    if (!confirm('¿Borrar esta imagen de la galería?')) return;

    try {
      await window.deleteDoc(window.doc(window.db, 'gallery', docId));
      if (storagePath) {
        const fileRef = window.ref(window.storage, storagePath);
        window.deleteObject(fileRef).catch(err => console.warn(err));
      }
    } catch (err) {
      console.error('Error al borrar card:', err);
    }
  };

  window.onFirebaseReady = () => {
    initVisualEditorMode();
    initDynamicContentSync();
    initDynamicGallerySync();
  };

  initVisualEditorMode();

});
