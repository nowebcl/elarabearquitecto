// Clean Application JS - El Arabe Arquitecto (Supabase Powered)
document.addEventListener('DOMContentLoaded', () => {
  const supabase = window.supabaseClient;

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

  // 5. Real-time Text Sync from Supabase (site_content table)
  async function initDynamicContentSync() {
    if (!supabase) return;

    try {
      const { data: docSnap, error } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', 'landing')
        .single();

      if (!error && docSnap && docSnap.data) {
        applyContentData(docSnap.data);
      }

      // Realtime subscription
      supabase
        .channel('public:site_content')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_content', filter: 'id=eq.landing' }, (payload) => {
          if (payload && payload.new && payload.new.data) {
            applyContentData(payload.new.data);
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Dynamic content sync notice:', e);
    }
  }

  function applyContentData(data) {
    const isEditing = document.activeElement && document.activeElement.isContentEditable;
    if (isEditing) return;

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

  // 6. Real-time Gallery Sync from Supabase (gallery table)
  async function initDynamicGallerySync() {
    if (!supabase) return;

    try {
      const { data: docs, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && docs && docs.length > 0) {
        renderGalleryItems(docs);
      }

      // Real-time updates
      supabase
        .channel('public:gallery')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, async () => {
          const { data: newDocs } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });
          if (newDocs && newDocs.length > 0) renderGalleryItems(newDocs);
        })
        .subscribe();
    } catch (e) {
      console.warn('Dynamic gallery sync notice:', e);
    }
  }

  function renderGalleryItems(docs) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = docs.map(item => `
      <div class="project-card gallery-item" data-category="${item.category || 'all'}" data-src="${item.url}" data-title="${item.title || ''}" data-desc="${item.desc || ''}">
        <img src="${item.url}" alt="${item.title || 'Proyecto'}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-category">${item.category_label || item.category_label || item.category || 'Proyecto'}</span>
          <h3 class="gallery-item-title">${item.title || ''}</h3>
          <div class="gallery-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
        </div>
        ${window.isAdminLoggedIn ? `
          <div class="admin-card-actions">
            <button onclick="replaceGalleryCardImage('${item.id}', '${item.storage_path || ''}')" title="Reemplazar Imagen">📷 Reemplazar</button>
            <button onclick="deleteGalleryCardImage('${item.id}', '${item.storage_path || ''}')" title="Eliminar Imagen">🗑️</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    bindGalleryItemEvents();
  }

  // 7. Contact Form Submission connected to Supabase Database
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
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>ENVIANDO...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      }

      try {
        if (!supabase) throw new Error('Falta configurar Supabase en env.js');

        const { error } = await supabase
          .from('consultas')
          .insert([{ name, phone, email, servicio: service, message, created_at: new Date().toISOString() }]);

        if (error) throw error;

        if (formFeedback) {
          formFeedback.textContent = '¡Tu mensaje ha sido enviado con éxito! Nos comunicaremos contigo muy pronto.';
          formFeedback.classList.remove('error');
          formFeedback.classList.add('success');
        }

        ctaContactForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = '<span>¡ENVIADO CORRECTAMENTE!</span> <i class="fa-solid fa-check"></i>';
          submitBtn.style.background = '#25D366';
          submitBtn.style.color = '#fff';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
          }
        }, 4000);

      } catch (error) {
        console.error('Error enviando consulta:', error);
        if (submitBtn) {
          submitBtn.innerHTML = '<span>ERROR AL ENVIAR</span> <i class="fa-solid fa-triangle-exclamation"></i>';
          submitBtn.style.background = '#dc2743';
        }

        if (formFeedback) {
          formFeedback.textContent = 'Hubo un error al enviar tu mensaje. Verifica tu conexión o base de datos.';
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
  async function initVisualEditorMode() {
    // SECURITY: Never enable editor mode unless we are embedded inside the admin panel iframe.
    if (window.self === window.top) {
      return;
    }

    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    applyEditorMode(session?.user);

    supabase.auth.onAuthStateChange((_event, session) => {
      applyEditorMode(session?.user);
    });
  }

  function applyEditorMode(user) {
    const adminGalleryHeaderBtn = document.getElementById('adminGalleryHeaderBtn');
    const editableIds = [
      'heroTitle', 'heroSubtitle', 'heroLocation',
      'introHeading', 'introTitle', 'aboutTitle',
      'aboutP1', 'aboutP2', 'ctaTitle', 'ctaDesc'
    ];

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
  }

  // 9. Global Save Function for Admin Panel Top Bar
  window.saveVisualEdits = async () => {
    if (!supabase) return false;

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
      ctaDesc: getText('ctaDesc')
    };

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ id: 'landing', data: updatedData, updated_at: new Date().toISOString() });
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error saveVisualEdits:', e);
      return false;
    }
  };

  // 10. Gallery Upload Modal Logic (Supabase Storage)
  const btnOpenVisualAddImage = document.getElementById('btnOpenVisualAddImage');
  const visualGalleryModal = document.getElementById('visualGalleryModal');
  const btnCloseVisualGalleryModal = document.getElementById('btnCloseVisualGalleryModal');
  const visualGalleryModalBackdrop = document.getElementById('visualGalleryModalBackdrop');
  const visualGalleryForm = document.getElementById('visualGalleryForm');

  if (btnOpenVisualAddImage && visualGalleryModal) {
    btnOpenVisualAddImage.addEventListener('click', () => {
      visualGalleryModal.style.display = 'flex';
      visualGalleryModal.classList.add('active');
    });
  }

  const closeGalleryModal = () => {
    if (visualGalleryModal) {
      visualGalleryModal.style.display = 'none';
      visualGalleryModal.classList.remove('active');
    }
  };

  if (btnCloseVisualGalleryModal) btnCloseVisualGalleryModal.addEventListener('click', closeGalleryModal);
  if (visualGalleryModalBackdrop) visualGalleryModalBackdrop.addEventListener('click', closeGalleryModal);

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
        if (!supabase) throw new Error('Falta configurar Supabase');
        
        const storagePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        
        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase
          .storage
          .from('gallery')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(storagePath);
        const downloadURL = publicUrlData.publicUrl;

        // 3. Insert into database
        const { error: dbError } = await supabase
          .from('gallery')
          .insert([{
            title,
            category,
            category_label: categoryLabels[category] || category,
            desc,
            url: downloadURL,
            storage_path: storagePath,
            created_at: new Date().toISOString()
          }]);

        if (dbError) throw dbError;

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
          closeGalleryModal();
        }, 1500);

      } catch (err) {
        console.error('Error subiendo imagen:', err);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'ERROR AL SUBIR: ' + (err.message || 'Fallo');
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
      if (!file || !supabase) return;

      const newStoragePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      
      try {
        const { error: uploadError } = await supabase.storage.from('gallery').upload(newStoragePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(newStoragePath);
        const downloadURL = publicUrlData.publicUrl;

        await supabase.from('gallery').update({ url: downloadURL, storage_path: newStoragePath }).eq('id', docId);

        if (oldStoragePath) {
          await supabase.storage.from('gallery').remove([oldStoragePath]).catch(e => console.warn(e));
        }
      } catch (err) {
        console.error('Error reemplazando imagen:', err);
      }
    };
    input.click();
  };

  window.deleteGalleryCardImage = async (docId, storagePath) => {
    if (!confirm('¿Borrar esta imagen de la galería?')) return;
    if (!supabase) return;

    try {
      await supabase.from('gallery').delete().eq('id', docId);
      if (storagePath) {
        await supabase.storage.from('gallery').remove([storagePath]).catch(e => console.warn(e));
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
  initDynamicContentSync();
  initDynamicGallerySync();
});
