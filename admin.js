// Admin CMS JavaScript - El Arabe Arquitecto
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhRM0PFeKfBQetEa40diX7ExbTaxeDkMc",
  authDomain: "elarabe-b1c76.firebaseapp.com",
  projectId: "elarabe-b1c76",
  storageBucket: "elarabe-b1c76.firebasestorage.app",
  messagingSenderId: "596637175626",
  appId: "1:596637175626:web:dfcbfc1fc88f99afd27bb3"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const btnLogin = document.getElementById('btnLogin');
const adminUserInfo = document.getElementById('adminUserInfo');
const userEmailBadge = document.getElementById('userEmailBadge');
const btnLogout = document.getElementById('btnLogout');
const toastNotification = document.getElementById('toastNotification');

// Tabs DOM
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Content Form DOM
const btnSaveContent = document.getElementById('btnSaveContent');
const inputHeroTitle = document.getElementById('inputHeroTitle');
const inputHeroSubtitle = document.getElementById('inputHeroSubtitle');
const inputHeroLocation = document.getElementById('inputHeroLocation');
const inputIntroHeading = document.getElementById('inputIntroHeading');
const inputIntroTitle = document.getElementById('inputIntroTitle');
const inputAboutTitle = document.getElementById('inputAboutTitle');
const inputAboutP1 = document.getElementById('inputAboutP1');
const inputAboutP2 = document.getElementById('inputAboutP2');
const inputCtaTitle = document.getElementById('inputCtaTitle');
const inputCtaDesc = document.getElementById('inputCtaDesc');

// Gallery Form DOM
const uploadGalleryForm = document.getElementById('uploadGalleryForm');
const galleryFileInput = document.getElementById('galleryFileInput');
const galleryTitleInput = document.getElementById('galleryTitleInput');
const galleryCategoryInput = document.getElementById('galleryCategoryInput');
const galleryDescInput = document.getElementById('galleryDescInput');
const uploadProgressBox = document.getElementById('uploadProgressBox');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadProgressText = document.getElementById('uploadProgressText');
const btnUploadGallery = document.getElementById('btnUploadGallery');
const adminGalleryList = document.getElementById('adminGalleryList');

// Consultas DOM
const adminConsultasList = document.getElementById('adminConsultasList');
const consultasCountBadge = document.getElementById('consultasCountBadge');

// ==========================================
// 1. ROUTE GUARD & AUTHENTICATION
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Session active -> Show Dashboard
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    adminUserInfo.style.display = 'flex';
    userEmailBadge.textContent = user.email;

    // Load CMS Data
    loadLandingContent();
    subscribeGalleryList();
    subscribeConsultasList();
  } else {
    // No session -> Show Login Form
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
    adminUserInfo.style.display = 'none';
  }
});

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  btnLogin.disabled = true;
  btnLogin.innerHTML = '<span>INICIANDO SESIÓN...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('¡Sesión iniciada con éxito!');
  } catch (error) {
    console.error('Error de login:', error);
    loginError.style.display = 'block';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      loginError.textContent = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    } else {
      loginError.textContent = `Error de autenticación: ${error.message}`;
    }
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerHTML = '<span>INICIAR SESIÓN</span> <i class="fa-solid fa-arrow-right"></i>';
  }
});

// Logout Button
btnLogout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('Sesión cerrada correctamente');
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
  }
});

// Tabs Navigation
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetTab = document.getElementById(btn.getAttribute('data-tab'));
    if (targetTab) targetTab.classList.add('active');
  });
});

// ==========================================
// 2. REAL-TIME TEXT CMS (site_content / landing)
// ==========================================
async function loadLandingContent() {
  try {
    const docRef = doc(db, 'site_content', 'landing');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const d = docSnap.data();
      if (d.heroTitle) inputHeroTitle.value = d.heroTitle;
      if (d.heroSubtitle) inputHeroSubtitle.value = d.heroSubtitle;
      if (d.heroLocation) inputHeroLocation.value = d.heroLocation;
      if (d.introHeading) inputIntroHeading.value = d.introHeading;
      if (d.introTitle) inputIntroTitle.value = d.introTitle;
      if (d.aboutTitle) inputAboutTitle.value = d.aboutTitle;
      if (d.aboutP1) inputAboutP1.value = d.aboutP1;
      if (d.aboutP2) inputAboutP2.value = d.aboutP2;
      if (d.ctaTitle) inputCtaTitle.value = d.ctaTitle;
      if (d.ctaDesc) inputCtaDesc.value = d.ctaDesc;
    } else {
      // Pre-fill defaults
      inputHeroTitle.value = "REGULARIZAMOS\nLO QUE CONSTRUISTE.";
      inputHeroSubtitle.value = "Arquitectura.\nRegularización.\nDiseño Desde Cero.";
      inputHeroLocation.value = "Puerto Montt - Puerto Varas - Región de Los Lagos";
      inputIntroHeading.value = "No solo hacemos planos.";
      inputIntroTitle.value = "Transformamos construcciones irregulares en proyectos normados, aprobados y listos para vender o ampliar.";
      inputAboutTitle.value = "La arquitectura no termina con un plano.";
      inputAboutP1.value = "Comienza cuando puedes vivir, construir o vender con tranquilidad.";
      inputAboutP2.value = "En nuestra oficina de arquitectura acompañamos a nuestros clientes desde la primera idea hasta la aprobación municipal, diseñando proyectos que cumplen la normativa, respetan el entorno y aumentan el valor de cada propiedad.";
      inputCtaTitle.value = "TU PROYECTO MERECE\nHACERSE BIEN DESDE\nEL PRINCIPIO.";
      inputCtaDesc.value = "Envíanos los detalles de tu propiedad y te evaluamos el proyecto sin compromiso.";
    }
  } catch (err) {
    console.error('Error al cargar contenido de Firestore:', err);
  }
}

btnSaveContent.addEventListener('click', async () => {
  const contentData = {
    heroTitle: inputHeroTitle.value.trim(),
    heroSubtitle: inputHeroSubtitle.value.trim(),
    heroLocation: inputHeroLocation.value.trim(),
    introHeading: inputIntroHeading.value.trim(),
    introTitle: inputIntroTitle.value.trim(),
    aboutTitle: inputAboutTitle.value.trim(),
    aboutP1: inputAboutP1.value.trim(),
    aboutP2: inputAboutP2.value.trim(),
    ctaTitle: inputCtaTitle.value.trim(),
    ctaDesc: inputCtaDesc.value.trim(),
    updatedAt: new Date().toISOString()
  };

  btnSaveContent.disabled = true;
  btnSaveContent.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

  try {
    await setDoc(doc(db, 'site_content', 'landing'), contentData, { merge: true });
    showToast('¡Contenido guardado exitosamente en Firestore!');
  } catch (err) {
    console.error('Error al guardar en Firestore:', err);
    showToast('Error al guardar contenido: ' + err.message);
  } finally {
    btnSaveContent.disabled = false;
    btnSaveContent.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
  }
});

// ==========================================
// 3. GALLERY MANAGEMENT (FIREBASE STORAGE + FIRESTORE)
// ==========================================
uploadGalleryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = galleryFileInput.files[0];
  if (!file) {
    showToast('Selecciona una imagen primero');
    return;
  }

  const title = galleryTitleInput.value.trim();
  const category = galleryCategoryInput.value;
  const desc = galleryDescInput.value.trim();
  const categoryLabels = {
    residencial: 'Residencial',
    diseno: 'Diseño',
    regularizacion: 'Regularización'
  };

  btnUploadGallery.disabled = true;
  uploadProgressBox.style.display = 'block';
  uploadProgressBar.style.width = '0%';
  uploadProgressText.textContent = '0%';

  try {
    // Unique Storage Path
    const storagePath = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, storagePath);

    // Upload Bytes
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        uploadProgressBar.style.width = `${progress}%`;
        uploadProgressText.textContent = `${progress}%`;
      }, 
      (error) => {
        console.error('Error subiendo imagen:', error);
        showToast('Error al subir imagen: ' + error.message);
        btnUploadGallery.disabled = false;
        uploadProgressBox.style.display = 'none';
      }, 
      async () => {
        // Upload Completed -> Get Download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save Record in Firestore `gallery` collection
        await addDoc(collection(db, 'gallery'), {
          title,
          category,
          categoryLabel: categoryLabels[category] || category,
          desc,
          url: downloadURL,
          storagePath,
          timestamp: new Date().toISOString()
        });

        showToast('¡Imagen subida e integrada a la galería!');
        uploadGalleryForm.reset();
        btnUploadGallery.disabled = false;
        uploadProgressBox.style.display = 'none';
      }
    );

  } catch (err) {
    console.error('Error procesando subida:', err);
    showToast('Error: ' + err.message);
    btnUploadGallery.disabled = false;
    uploadProgressBox.style.display = 'none';
  }
});

// Subscribe to Gallery Firestore Collection
function subscribeGalleryList() {
  const galleryRef = collection(db, 'gallery');
  onSnapshot(galleryRef, (snapshot) => {
    if (snapshot.empty) {
      adminGalleryList.innerHTML = '<div style="grid-column: 1/-1; color: #888; text-align: center; padding: 2rem;">No hay imágenes cargadas en Firestore. Sube una usando el formulario arriba.</div>';
      return;
    }

    const docs = [];
    snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));

    adminGalleryList.innerHTML = docs.map(item => `
      <div class="admin-gallery-card">
        <img src="${item.url}" alt="${item.title || 'Imagen'}">
        <div class="admin-gallery-card-body">
          <span class="cat-tag">${item.categoryLabel || item.category || 'Proyecto'}</span>
          <h4>${item.title || 'Sin título'}</h4>
          <p>${item.desc || ''}</p>
          <button class="btn-delete-img" onclick="deleteGalleryItem('${item.id}', '${item.storagePath || ''}')">
            <i class="fa-solid fa-trash-can"></i> Eliminar Imagen
          </button>
        </div>
      </div>
    `).join('');
  });
}

// Global Delete Function (Exposed to Window)
window.deleteGalleryItem = async (docId, storagePath) => {
  if (!confirm('¿Estás seguro de eliminar esta imagen? Se borrará permanentemente de Storage y Firestore.')) {
    return;
  }

  try {
    // 1. Delete Document from Firestore
    await deleteDoc(doc(db, 'gallery', docId));

    // 2. Delete Physical File from Firebase Storage (if path exists)
    if (storagePath) {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef).catch(err => console.warn('Aviso al borrar archivo de storage:', err));
    }

    showToast('Imagen eliminada correctamente');
  } catch (err) {
    console.error('Error al eliminar imagen:', err);
    showToast('Error al eliminar: ' + err.message);
  }
};

// ==========================================
// 4. CONSULTAS MANAGEMENT (FIRESTORE)
// ==========================================
function subscribeConsultasList() {
  const consultasRef = collection(db, 'consultas');
  onSnapshot(consultasRef, (snapshot) => {
    if (consultasCountBadge) consultasCountBadge.textContent = snapshot.size;

    if (snapshot.empty) {
      adminConsultasList.innerHTML = '<div style="color: #888; text-align: center; padding: 2rem;">No se han recibido consultas de clientes aún.</div>';
      return;
    }

    const docs = [];
    snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));

    adminConsultasList.innerHTML = `
      <table class="consultas-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Servicio</th>
            <th>Mensaje</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${docs.map(item => `
            <tr>
              <td>${item.fecha ? (typeof item.fecha === 'string' ? item.fecha.split('T')[0] : 'Reciente') : 'Reciente'}</td>
              <td><strong>${item.nombre || ''}</strong></td>
              <td><a href="https://wa.me/${(item.telefono || '').replace(/[^0-9]/g, '')}" target="_blank" style="color: #25D366; text-decoration: none;"><i class="fa-brands fa-whatsapp"></i> ${item.telefono || ''}</a></td>
              <td><a href="mailto:${item.email || ''}" style="color: #d4af37; text-decoration: none;">${item.email || ''}</a></td>
              <td><span style="background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px;">${item.servicio || ''}</span></td>
              <td style="max-width: 250px;">${item.mensaje || ''}</td>
              <td>
                <button onclick="deleteConsultaDoc('${item.id}')" style="background: rgba(220,39,67,0.2); color: #ff4d6d; border: 1px solid #dc2743; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });
}

window.deleteConsultaDoc = async (docId) => {
  if (!confirm('¿Borrar este mensaje de la base de datos?')) return;
  try {
    await deleteDoc(doc(db, 'consultas', docId));
    showToast('Consulta eliminada');
  } catch (err) {
    showToast('Error al borrar: ' + err.message);
  }
};

// Notification Toast Helper
function showToast(msg) {
  toastNotification.textContent = msg;
  toastNotification.classList.add('active');
  setTimeout(() => {
    toastNotification.classList.remove('active');
  }, 4000);
}
