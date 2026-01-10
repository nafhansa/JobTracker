import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

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

interface SubscriptionData {
  status?: string;
  plan?: string;
  renewsAt?: Timestamp | Date | string | { _seconds?: number };
  endsAt?: Timestamp | Date | string | { _seconds?: number };
}

export const checkIsPro = (subscription: SubscriptionData | null | undefined): boolean => {
  if (!subscription) return false;

  const { status, plan, renewsAt, endsAt } = subscription;

  // Free plan is never Pro
  if (plan === "free") return false;

  // 1. Lifetime = Auto Pro
  if (plan === "lifetime") return true;

  // 2. Status Active = Pro (but not free)
  if (status === "active" && plan !== "free") return true;

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
    } else if (typeof candidate === "object" && "_seconds" in candidate && typeof candidate._seconds === "number") {
      endDate = new Date(candidate._seconds * 1000);
    } else {
      return false; // Format tidak dikenal
    }

    const now = new Date();
    return now < endDate; // Selama belum lewat target date, user masih Pro
  }

  return false;
};

/**
 * Check if user is admin
 */
export const isAdminUser = (email: string | null | undefined): boolean => {
  const ADMIN_EMAILS = ["nafhan1723@gmail.com", "nafhan.sh@gmail.com"];
  return ADMIN_EMAILS.includes(email || "");
};

/**
 * Get job limit for a subscription plan
 * Admin users always have unlimited
 */
export const getPlanLimits = (plan: string | null | undefined, isAdmin = false): number => {
  if (isAdmin) {
    return Infinity;
  }
  if (!plan || plan === "free") {
    return FREE_PLAN_JOB_LIMIT;
  }
  // Pro plans have unlimited
  return Infinity;
};

/**
 * Check if user can add a new job based on their plan and current job count
 * Admin users can always add jobs
 */
export const checkCanAddJob = (
  plan: string | null | undefined,
  currentJobCount: number,
  isAdmin = false
): boolean => {
  if (isAdmin) {
    return true;
  }
  const limit = getPlanLimits(plan, isAdmin);
  return currentJobCount < limit;
};

/**
 * Check if user can edit/delete jobs based on their plan
 * Free users cannot edit/delete, but admin users always can
 */
export const canEditDelete = (plan: string | null | undefined, isAdmin = false): boolean => {
  if (isAdmin) {
    return true;
  }
  if (!plan || plan === "free") {
    return false;
  }
  return true;
};

/**
 * Auto-assign free plan to user if they don't have a subscription
 */
export const ensureFreePlan = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USER_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // New user - create with free plan
      await setDoc(userRef, {
        subscription: {
          plan: "free",
          status: "active",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const userData = userDoc.data();
      // Existing user without subscription - assign free plan
      if (!userData.subscription || !userData.subscription.plan) {
        await updateDoc(userRef, {
          subscription: {
            plan: "free",
            status: "active",
          },
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring free plan:", error);
    // Don't throw - let user continue even if assignment fails
  }
};