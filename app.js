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
      item.addEventListener('click', () => {
        const idx = activeItems.indexOf(item);
        if (idx !== -1) {
          openLightbox(idx);
        }
      });
    });
  }

  // Real-time Text Sync from Firestore (site_content / landing)
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
          if (data.heroTitle && document.getElementById('heroTitle')) {
            document.getElementById('heroTitle').innerHTML = data.heroTitle.replace(/\n/g, '<br>');
          }
          if (data.heroSubtitle && document.getElementById('heroSubtitle')) {
            document.getElementById('heroSubtitle').innerHTML = data.heroSubtitle.replace(/\n/g, '<br>');
          }
          if (data.heroLocation && document.getElementById('heroLocation')) {
            document.getElementById('heroLocation').textContent = data.heroLocation;
          }
          if (data.introHeading && document.getElementById('introHeading')) {
            document.getElementById('introHeading').textContent = data.introHeading;
          }
          if (data.introTitle && document.getElementById('introTitle')) {
            document.getElementById('introTitle').textContent = data.introTitle;
          }
          if (data.aboutTitle && document.getElementById('aboutTitle')) {
            document.getElementById('aboutTitle').textContent = data.aboutTitle;
          }
          if (data.aboutP1 && document.getElementById('aboutP1')) {
            document.getElementById('aboutP1').textContent = data.aboutP1;
          }
          if (data.aboutP2 && document.getElementById('aboutP2')) {
            document.getElementById('aboutP2').textContent = data.aboutP2;
          }
          if (data.ctaTitle && document.getElementById('ctaTitle')) {
            document.getElementById('ctaTitle').innerHTML = data.ctaTitle.replace(/\n/g, '<br>');
          }
          if (data.ctaDesc && document.getElementById('ctaDesc')) {
            document.getElementById('ctaDesc').textContent = data.ctaDesc;
          }
        }
      });
    } catch (e) {
      console.warn('Dynamic content sync fallback active:', e);
    }
  }

  // Real-time Gallery Sync from Firestore (gallery collection)
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
            </div>
          `).join('');

          bindGalleryItemEvents();
        }
      });
    } catch (e) {
      console.warn('Dynamic gallery sync fallback active:', e);
    }
  }

  initDynamicContentSync();
  initDynamicGallerySync();

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
      item.addEventListener('click', () => {
        const idx = activeItems.indexOf(item);
        if (idx !== -1) {
          openLightbox(idx);
        }
      });
    });
  }

  // Real-time Text Sync from Firestore (site_content / landing)
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
          if (data.heroTitle && document.getElementById('heroTitle')) {
            document.getElementById('heroTitle').innerHTML = data.heroTitle.replace(/\n/g, '<br>');
          }
          if (data.heroSubtitle && document.getElementById('heroSubtitle')) {
            document.getElementById('heroSubtitle').innerHTML = data.heroSubtitle.replace(/\n/g, '<br>');
          }
          if (data.heroLocation && document.getElementById('heroLocation')) {
            document.getElementById('heroLocation').textContent = data.heroLocation;
          }
          if (data.introHeading && document.getElementById('introHeading')) {
            document.getElementById('introHeading').textContent = data.introHeading;
          }
          if (data.introTitle && document.getElementById('introTitle')) {
            document.getElementById('introTitle').textContent = data.introTitle;
          }
          if (data.aboutTitle && document.getElementById('aboutTitle')) {
            document.getElementById('aboutTitle').textContent = data.aboutTitle;
          }
          if (data.aboutP1 && document.getElementById('aboutP1')) {
            document.getElementById('aboutP1').textContent = data.aboutP1;
          }
          if (data.aboutP2 && document.getElementById('aboutP2')) {
            document.getElementById('aboutP2').textContent = data.aboutP2;
          }
          if (data.ctaTitle && document.getElementById('ctaTitle')) {
            document.getElementById('ctaTitle').innerHTML = data.ctaTitle.replace(/\n/g, '<br>');
          }
          if (data.ctaDesc && document.getElementById('ctaDesc')) {
            document.getElementById('ctaDesc').textContent = data.ctaDesc;
          }
        }
      });
    } catch (e) {
      console.warn('Dynamic content sync fallback active:', e);
    }
  }

  // Real-time Gallery Sync from Firestore (gallery collection)
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
            </div>
          `).join('');

          bindGalleryItemEvents();
        }
      });
    } catch (e) {
      console.warn('Dynamic gallery sync fallback active:', e);
    }
  }

  initDynamicContentSync();
  initDynamicGallerySync();

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

  function initVisualEditorMode() {
    if (!window.auth || !window.onAuthStateChanged) {
      setTimeout(initVisualEditorMode, 100);
      return;
    }

    const landingAdminBar = document.getElementById('landingAdminBar');
    const btnLandingSave = document.getElementById('btnLandingSave');
    const btnLandingLogout = document.getElementById('btnLandingLogout');
    const adminGalleryHeaderBtn = document.getElementById('adminGalleryHeaderBtn');

    const editableIds = [
      'heroTitle', 'heroSubtitle', 'heroLocation',
      'introHeading', 'introTitle', 'aboutTitle',
      'aboutP1', 'aboutP2', 'ctaTitle', 'ctaDesc'
    ];

    window.onAuthStateChanged(window.auth, (user) => {
      if (user) {
        window.isAdminLoggedIn = true;
        if (landingAdminBar) landingAdminBar.style.display = 'flex';
        if (adminGalleryHeaderBtn) adminGalleryHeaderBtn.style.display = 'block';
        document.body.classList.add('editor-mode-active');

        // Make text blocks editable only when logged in
        editableIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.contentEditable = 'true';
            el.classList.add('editable-active');
          }
        });

        if (typeof initDynamicGallerySync === 'function') initDynamicGallerySync();

      } else {
        // PUBLIC VISITOR MODE: 100% READ ONLY
        window.isAdminLoggedIn = false;
        if (landingAdminBar) landingAdminBar.style.display = 'none';
        if (adminGalleryHeaderBtn) adminGalleryHeaderBtn.style.display = 'none';
        document.body.classList.remove('editor-mode-active');

        editableIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.contentEditable = 'false';
            el.classList.remove('editable-active');
          }
        });
      }
    });

    if (btnLandingSave) {
      btnLandingSave.addEventListener('click', async () => {
        btnLandingSave.disabled = true;
        btnLandingSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>GUARDANDO...</span>';

        try {
          if (typeof window.saveVisualEdits === 'function') {
            await window.saveVisualEdits();
          }

          btnLandingSave.innerHTML = '<i class="fa-solid fa-check"></i> <span>¡GUARDADO!</span>';
          btnLandingSave.style.background = '#20ba59';

          setTimeout(() => {
            btnLandingSave.disabled = false;
            btnLandingSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>GUARDAR CAMBIOS</span>';
            btnLandingSave.style.background = '';
          }, 3000);

        } catch (err) {
          console.error('Error guardando desde barra landing:', err);
          btnLandingSave.disabled = false;
          btnLandingSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>GUARDAR CAMBIOS</span>';
        }
      });
    }

    if (btnLandingLogout) {
      btnLandingLogout.addEventListener('click', async () => {
        try {
          if (window.auth && window.signOut) {
            await window.signOut(window.auth);
            window.location.reload();
          }
        } catch (err) {
          console.error('Error cerrando sesión:', err);
        }
      });
    }

    // Modal Logic for Adding Gallery Image Directly from Landing Page
    const btnOpenVisualAddImage = document.getElementById('btnOpenVisualAddImage');
    const visualGalleryModal = document.getElementById('visualGalleryModal');
    const btnCloseVisualGalleryModal = document.getElementById('btnCloseVisualGalleryModal');
    const visualGalleryForm = document.getElementById('visualGalleryForm');
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
        const file = document.getElementById('vGalleryFile').files[0];
        const title = document.getElementById('vGalleryTitle').value.trim();
        const category = document.getElementById('vGalleryCategory').value;
        const desc = document.getElementById('vGalleryDesc').value.trim();
        const btnSubmit = document.getElementById('btnSubmitVGallery');

        if (!file) return;

        const categoryLabels = {
          residencial: 'Residencial',
          diseno: 'Diseño',
          regularizacion: 'Regularización'
        };

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SUBIENDO A STORAGE...';

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

            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> ¡IMAGEN AGREGADA!';
            btnSubmit.style.background = '#25D366';

            setTimeout(() => {
              visualGalleryForm.reset();
              btnSubmit.disabled = false;
              btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> SUBIR E INSERTAR EN LA GALERÍA';
              btnSubmit.style.background = '';
              visualGalleryModal.style.display = 'none';
            }, 1500);
          });

        } catch (err) {
          console.error('Error subiendo imagen desde modal:', err);
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'ERROR AL SUBIR';
        }
      });
    }
  }

  // Global functions for direct card actions on landing page
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

          // Update Firestore doc
          await window.setDoc(window.doc(window.db, 'gallery', docId), {
            url: downloadURL,
            storagePath: newStoragePath,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          // Clean old storage file
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
        const file = document.getElementById('vGalleryFile').files[0];
        const title = document.getElementById('vGalleryTitle').value.trim();
        const category = document.getElementById('vGalleryCategory').value;
        const desc = document.getElementById('vGalleryDesc').value.trim();
        const btnSubmit = document.getElementById('btnSubmitVGallery');

        if (!file) return;

        const categoryLabels = {
          residencial: 'Residencial',
          diseno: 'Diseño',
          regularizacion: 'Regularización'
        };

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SUBIENDO A STORAGE...';

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

            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> ¡IMAGEN AGREGADA!';
            btnSubmit.style.background = '#25D366';

            setTimeout(() => {
              visualGalleryForm.reset();
              btnSubmit.disabled = false;
              btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> SUBIR E INSERTAR EN LA GALERÍA';
              btnSubmit.style.background = '';
              visualGalleryModal.style.display = 'none';
            }, 1500);
          });

        } catch (err) {
          console.error('Error subiendo imagen desde modal:', err);
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'ERROR AL SUBIR';
        }
      });
    }
  }

  // Global functions for direct card actions on landing page
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

          // Update Firestore doc
          await window.setDoc(window.doc(window.db, 'gallery', docId), {
            url: downloadURL,
            storagePath: newStoragePath,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          // Clean old storage file
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
