import admin from "firebase-admin";

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Firebase Admin: Missing required environment variables");
  console.error("Required:", {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!projectId,
    FIREBASE_CLIENT_EMAIL: !!clientEmail,
    FIREBASE_PRIVATE_KEY: !!privateKey,
  });
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

const USER_COLLECTION = "users";

export const getAllUsers = async () => {
  try {
    const usersCollectionRef = adminDb.collection(USER_COLLECTION);
    const querySnapshot = await usersCollectionRef.get(); 
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      let createdAt = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate().toISOString();
      }

      return {
        uid: doc.id,
        email: data.email,
        createdAt: createdAt,
        subscription: data.subscription,
      };
    });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export { adminDb, adminAuth };