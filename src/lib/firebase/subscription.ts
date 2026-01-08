import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";

const USER_COLLECTION = "users";
const SUBSCRIPTION_COLLECTION = "subscriptions";

// ... (Kode createSubscription & getSubscription biarkan saja seperti semula) ...
export const createSubscription = async (userId: string, plan: "monthly" | "lifetime") => {
  // ... (biarkan existing code kamu) ...
  const subscriptionRef = doc(db, SUBSCRIPTION_COLLECTION, userId);
  const userRef = doc(db, USER_COLLECTION, userId);
  
  try {
    await setDoc(subscriptionRef, {
      plan,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Simpan data subscription di user document juga biar gampang diambil
    await updateDoc(userRef, {
      subscription: {
        plan,
        status: "active",
        
      },
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

export const getSubscription = async (userId: string) => {
    // ... (biarkan existing code kamu) ...
    const userDocRef = doc(db, USER_COLLECTION, userId);
  
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
        subscription: userData.subscription || null,
        updatedAt: userData.updatedAt || null,
        createdAt: userData.createdAt || null,
        isPro: userData.isPro || false,
      };
      }
      return null;
    } catch (error) {
      console.error("Error getting subscription:", error);
      throw error;
    }
};

// 👇👇👇 TAMBAHKAN FUNGSI INI DI PALING BAWAH 👇👇👇

export const checkIsPro = (subscription: any): boolean => {
  if (!subscription) return false;

  const { status, plan, renewsAt, endsAt } = subscription;

  // 1. Lifetime = Auto Pro
  if (plan === "lifetime") return true;

  // 2. Status Active = Pro
  if (status === "active") return true;

  // 3. Status Cancelled = Cek Grace Period pakai endsAt (prioritas) atau renewsAt
  if (status === "cancelled" || status === "canceled") {
    const candidate = endsAt || renewsAt;
    if (!candidate) return false;

    let endDate: Date;
    if (candidate instanceof Timestamp) {
      endDate = candidate.toDate();
    } else if (candidate instanceof Date) {
      endDate = candidate;
    } else if (typeof candidate === "string") {
      endDate = new Date(candidate);
    } else if ((candidate as any)?._seconds) {
      endDate = new Date((candidate as any)._seconds * 1000);
    } else {
      return false; // Format tidak dikenal
    }

    const now = new Date();
    return now < endDate; // Selama belum lewat target date, user masih Pro
  }

  return false;
};