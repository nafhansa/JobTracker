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
        return userData.subscription || null;
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

  const { status, plan, endsAt } = subscription;

  // 1. Lifetime = Auto Pro
  if (plan === "lifetime") return true;

  // 2. Status Active = Pro
  if (status === "active") return true;

  // 3. Status Cancelled = Cek Tanggal (Grace Period)
  if (status === "cancelled" && endsAt) {
    // Handle konversi tanggal karena Firebase bisa return Timestamp / String / Date
    let endDate;
    if (endsAt instanceof Timestamp) {
      endDate = endsAt.toDate();
    } else {
      endDate = new Date(endsAt);
    }
    
    const now = new Date();
    // Jika hari ini belum melewati tanggal berakhir, berarti MASIH PRO
    return now < endDate;
  }

  return false;
};