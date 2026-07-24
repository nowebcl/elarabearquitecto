// Script para la creación del usuario Administrador Inicial en Firebase Authentication
// Uso: node scripts/create_admin.js admin@elarabearquitecto.cl TuPasswordSeguro123

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhRM0PFeKfBQetEa40diX7ExbTaxeDkMc",
  authDomain: "elarabe-b1c76.firebaseapp.com",
  projectId: "elarabe-b1c76",
  storageBucket: "elarabe-b1c76.firebasestorage.app",
  messagingSenderId: "596637175626",
  appId: "1:596637175626:web:dfcbfc1fc88f99afd27bb3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = process.argv[2] || "admin@elarabearquitecto.cl";
const password = process.argv[3] || "ArabeAdmin2026!";

async function createAdminUser() {
  console.log(`\n⏳ Creando usuario administrador inicial: ${email}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`\n✅ ¡Usuario Administrador creado exitosamente!`);
    console.log(`   UID: ${userCredential.user.uid}`);
    console.log(`   Email: ${userCredential.user.email}`);
    console.log(`\nYa puedes iniciar sesión en /admin.html con estas credenciales.\n`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`\nℹ️ El usuario ${email} ya existe en Firebase Auth. Puedes iniciar sesión directamente en /admin.html.\n`);
    } else {
      console.error(`\n❌ Error al crear usuario admin:`, error.message, '\n');
    }
  }
}

createAdminUser();
