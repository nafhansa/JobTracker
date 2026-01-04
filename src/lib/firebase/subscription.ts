
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./config";

const USER_COLLECTION = "users";
const SUBSCRIPTION_COLLECTION = "subscriptions";

export const createSubscription = async (userId: string, plan: "monthly" | "lifetime") => {
  const subscriptionRef = doc(db, SUBSCRIPTION_COLLECTION, userId);
  const userRef = doc(db, USER_COLLECTION, userId);
  
  try {
    await setDoc(subscriptionRef, {
      plan,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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