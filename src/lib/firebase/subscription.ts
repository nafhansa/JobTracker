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
    console.log("Subscription created successfully for user:", userId);
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

  const { status, plan, renewsAt } = subscription;

  // 1. Lifetime = Auto Pro
  if (plan === "lifetime") return true;

  // 2. Status Active = Pro
  if (status === "active") return true;

  // 3. Status Cancelled = Cek Grace Period pakai renewsAt
  if (status === "cancelled" && renewsAt) {
    // Parse tanggal renewsAt
    let endDate: Date;

    if (renewsAt instanceof Timestamp) {
      endDate = renewsAt.toDate();
    } else if (typeof renewsAt === "string") {
      endDate = new Date(renewsAt);
    } else if (renewsAt instanceof Date) {
      endDate = renewsAt;
    } else {
      return false; // Kalau format aneh, anggap expired
    }

    const now = new Date();
    
    // Debug log
    console.log('🔍 Grace Period Check:', {
      status,
      renewsAt: endDate.toISOString(),
      now: now.toISOString(),
      isPro: now < endDate
    });

    // ✅ Selama belum lewat renewsAt, user MASIH PRO
    return now < endDate;
  }

  return false;
};