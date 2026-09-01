import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { AuthContext } from "./authContextObj";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = carregando, null = deslogado
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  async function signup(name, email, password) {
    setError(null);
    try {
      // Verificação explícita: nunca deixar criar conta com email já cadastrado
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);
      if (existingMethods.length > 0) {
        setError("Este email já está cadastrado.");
        return false;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
      });
      // Força atualização local do displayName
      setUser({ ...cred.user, displayName: name });
      return true;
    } catch (e) {
      setError(mapAuthError(e.code));
      return false;
    }
  }

  async function login(email, password) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      setError(mapAuthError(e.code));
      return false;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, error, setError, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function mapAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/invalid-email": "Email inválido.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/user-not-found": "Email ou senha incorretos.",
    "auth/wrong-password": "Email ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente em instantes.",
  };
  return map[code] || "Ocorreu um erro. Tente novamente.";
}