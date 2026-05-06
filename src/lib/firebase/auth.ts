
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged as _onAuthStateChanged,
  NextOrObserver,
  User,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const provider = new GoogleAuthProvider();

export function onAuthStateChanged(cb: NextOrObserver<User>) {
  return _onAuthStateChanged(auth, cb);
}

export const loginWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        email: user.email,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    return user;
  } catch (error: any) {
    if (error?.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null;
    }
    console.error("Error logging in with Google:", error);
    return null;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const { user } = result;
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          email: user.email,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    return null;
  }
};

export const logout = () => {
  return signOut(auth);
};