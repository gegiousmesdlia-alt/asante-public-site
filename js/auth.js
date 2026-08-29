import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from "./main.js";

export async function signup(name, email, password, phone) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name, email, phone: phone || "", createdAt: serverTimestamp(), favorites: []
  });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
  showToast("Signed out.");
  location.href = "index.html";
}

export function watchAuth(cb) {
  onAuthStateChanged(auth, cb);
}

// wire up the header auth slot present on every page (#auth-slot)
watchAuth(user => {
  const slot = document.getElementById("auth-slot");
  if (!slot) return;
  if (user) {
    slot.innerHTML = `
      <a href="dashboard.html">${(user.displayName || "Account").split(" ")[0]}</a>
      <a href="#" id="logout-link">Sign out</a>
    `;
    document.getElementById("logout-link")?.addEventListener("click", e => { e.preventDefault(); logout(); });
  } else {
    slot.innerHTML = `<a href="login.html">Sign in</a><a href="signup.html" class="nav-cta">Create account</a>`;
  }
});
