import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ PREENCHA com as credenciais do SEU projeto Firebase.
// Console: https://console.firebase.google.com > Configurações do projeto > Seus apps > SDK config
// 1) Crie um projeto Firebase.
// 2) Ative Authentication > Sign-in method > Email/Senha.
// 3) Ative Firestore Database (modo produção) e aplique as regras em `firestore.rules` (raiz do projeto).
// 4) Cole os valores abaixo.
const firebaseConfig = {
  apiKey: "AIzaSyAN0bHW2OuYZ9HOZi4ZoxBubWWANEV3rm8",
  authDomain: "master-gym-flow.firebaseapp.com",
  projectId: "master-gym-flow",
  storageBucket: "master-gym-flow.firebasestorage.app",
  messagingSenderId: "135063658642",
  appId: "1:135063658642:web:e65f853ff4424690fb464b",
  measurementId: "G-1ZFP2P37BR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
