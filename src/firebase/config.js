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
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
