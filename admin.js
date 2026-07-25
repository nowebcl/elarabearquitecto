// Minimal Admin CMS Top Bar & Visual Editor JavaScript - El Arabe Arquitecto
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// DOM Elements
const adminTopBar = document.getElementById('adminTopBar');
const loginView = document.getElementById('loginView');
const viewVisualEditor = document.getElementById('viewVisualEditor');
const viewConsultas = document.getElementById('viewConsultas');
const visualEditorIframe = document.getElementById('visualEditorIframe');

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const btnLogin = document.getElementById('btnLogin');

const tabBtnVisualEditor = document.getElementById('tabBtnVisualEditor');
const tabBtnConsultas = document.getElementById('tabBtnConsultas');
const btnTopSaveLive = document.getElementById('btnTopSaveLive');
const btnTopLogout = document.getElementById('btnTopLogout');
const topConsultasBadge = document.getElementById('topConsultasBadge');
const adminConsultasList = document.getElementById('adminConsultasList');
const toastNotification = document.getElementById('toastNotification');

// ==========================================
// 1. AUTHENTICATION & LOCAL PERSISTENCE GUARD
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (adminTopBar) adminTopBar.style.display = 'flex';
    if (loginView) loginView.style.display = 'none';
    if (viewVisualEditor) viewVisualEditor.style.display = 'flex';
    if (viewConsultas) viewConsultas.style.display = 'none';

    if (visualEditorIframe && !visualEditorIframe.src) {
      visualEditorIframe.src = 'index.html';
    }

    subscribeConsultasList();

  } else {
    if (adminTopBar) adminTopBar.style.display = 'none';
    if (loginView) loginView.style.display = 'block';
    if (viewVisualEditor) viewVisualEditor.style.display = 'none';
    if (viewConsultas) viewConsultas.style.display = 'none';
  }
});

// Login Form Submit with explicit Local Storage Persistence
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginError) loginError.style.display = 'none';

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
      if (loginError) {
        loginError.style.display = 'block';
        loginError.textContent = 'Por favor ingresa tu correo y contraseña.';
      }
      return;
    }

    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span>INICIANDO...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      showToast('¡Sesión iniciada con éxito!');
    } catch (error) {
      console.error('Error de login:', error);
      if (loginError) {
        loginError.style.display = 'block';
        loginError.textContent = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      }
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<span>INICIAR SESIÓN</span> <i class="fa-solid fa-arrow-right"></i>';
    }
  });
}

// Logout Button
if (btnTopLogout) {
  btnTopLogout.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showToast('Sesión cerrada');
      window.location.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  });
}

// Tabs Navigation
if (tabBtnVisualEditor) {
  tabBtnVisualEditor.addEventListener('click', () => {
    tabBtnVisualEditor.classList.add('active');
    if (tabBtnConsultas) tabBtnConsultas.classList.remove('active');
    if (viewVisualEditor) viewVisualEditor.style.display = 'flex';
    if (viewConsultas) viewConsultas.style.display = 'none';
  });
}

if (tabBtnConsultas) {
  tabBtnConsultas.addEventListener('click', () => {
    tabBtnConsultas.classList.add('active');
    if (tabBtnVisualEditor) tabBtnVisualEditor.classList.remove('active');
    if (viewConsultas) viewConsultas.style.display = 'block';
    if (viewVisualEditor) viewVisualEditor.style.display = 'none';
  });
}

// Reliable Minimal Save Button Action
if (btnTopSaveLive) {
  btnTopSaveLive.addEventListener('click', async () => {
    btnTopSaveLive.disabled = true;
    const saveLabel = btnTopSaveLive.querySelector('.save-label');
    const originalText = saveLabel ? saveLabel.textContent : 'Guardar';
    if (saveLabel) saveLabel.textContent = 'Guardando...';

    try {
      let savedSuccessfully = false;

      // 1. Try invoking iframe internal save function
      if (visualEditorIframe && visualEditorIframe.contentWindow && typeof visualEditorIframe.contentWindow.saveVisualEdits === 'function') {
        savedSuccessfully = await visualEditorIframe.contentWindow.saveVisualEdits();
      }

      // 2. Direct DOM read fallback
      if (!savedSuccessfully && visualEditorIframe && visualEditorIframe.contentDocument) {
        const iframeDoc = visualEditorIframe.contentDocument;
        const updatedData = {
          heroTitle: iframeDoc.getElementById('heroTitle') ? iframeDoc.getElementById('heroTitle').innerHTML.trim() : '',
          heroSubtitle: iframeDoc.getElementById('heroSubtitle') ? iframeDoc.getElementById('heroSubtitle').innerHTML.trim() : '',
          heroLocation: iframeDoc.getElementById('heroLocation') ? iframeDoc.getElementById('heroLocation').textContent.trim() : '',
          introHeading: iframeDoc.getElementById('introHeading') ? iframeDoc.getElementById('introHeading').textContent.trim() : '',
          introTitle: iframeDoc.getElementById('introTitle') ? iframeDoc.getElementById('introTitle').textContent.trim() : '',
          aboutTitle: iframeDoc.getElementById('aboutTitle') ? iframeDoc.getElementById('aboutTitle').textContent.trim() : '',
          aboutP1: iframeDoc.getElementById('aboutP1') ? iframeDoc.getElementById('aboutP1').textContent.trim() : '',
          aboutP2: iframeDoc.getElementById('aboutP2') ? iframeDoc.getElementById('aboutP2').textContent.trim() : '',
          ctaTitle: iframeDoc.getElementById('ctaTitle') ? iframeDoc.getElementById('ctaTitle').innerHTML.trim() : '',
          ctaDesc: iframeDoc.getElementById('ctaDesc') ? iframeDoc.getElementById('ctaDesc').textContent.trim() : '',
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'site_content', 'landing'), updatedData, { merge: true });
        savedSuccessfully = true;
      }

      if (saveLabel) saveLabel.textContent = '¡Guardado!';
      showToast('¡Cambios guardados permanentemente en la base de datos!');

      setTimeout(() => {
        btnTopSaveLive.disabled = false;
        if (saveLabel) saveLabel.textContent = originalText;
      }, 3000);

    } catch (err) {
      console.error('Error al guardar cambios:', err);
      showToast('Error al guardar cambios.');
      btnTopSaveLive.disabled = false;
      if (saveLabel) saveLabel.textContent = originalText;
    }
  });
}

// Consultas Realtime Subscription (Hanging prevention)
function subscribeConsultasList() {
  try {
    const consultasRef = collection(db, 'consultas');
    onSnapshot(consultasRef, (snapshot) => {
      if (topConsultasBadge) topConsultasBadge.textContent = snapshot ? snapshot.size : 0;

      if (!snapshot || snapshot.empty) {
        if (adminConsultasList) {
          adminConsultasList.innerHTML = '<div style="color: #888; text-align: center; padding: 3rem;">No se han recibido consultas aún.</div>';
        }
        return;
      }

      const docs = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));

      if (adminConsultasList) {
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
                <th>Acción</th>
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
      }
    }, (error) => {
      console.warn('Notice snapshot consultas:', error);
      if (adminConsultasList) {
        adminConsultasList.innerHTML = '<div style="color: #888; text-align: center; padding: 3rem;">No se han recibido consultas aún.</div>';
      }
    });
  } catch (err) {
    console.warn('Notice catch consultas:', err);
    if (adminConsultasList) {
      adminConsultasList.innerHTML = '<div style="color: #888; text-align: center; padding: 3rem;">No se han recibido consultas aún.</div>';
    }
  }
}

window.deleteConsultaDoc = async (docId) => {
  if (!confirm('¿Borrar esta consulta de la base de datos?')) return;
  try {
    await deleteDoc(doc(db, 'consultas', docId));
    showToast('Consulta eliminada');
  } catch (err) {
    showToast('Error al borrar: ' + err.message);
  }
};

// Toast Helper
function showToast(msg) {
  if (!toastNotification) return;
  toastNotification.textContent = msg;
  toastNotification.classList.add('active');
  setTimeout(() => {
    toastNotification.classList.remove('active');
  }, 3500);
}
