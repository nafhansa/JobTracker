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
    // Validate service account before initialization
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error("Missing required service account fields");
    }

    // Check if private key format is valid
    if (!serviceAccount.privateKey.includes("BEGIN PRIVATE KEY") || !serviceAccount.privateKey.includes("END PRIVATE KEY")) {
      console.warn("⚠️ Private key format might be incorrect. Expected format: -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: serviceAccount.projectId, // Explicitly set projectId
    });
    console.log("✅ Firebase Admin initialized successfully");
    console.log("Project ID:", serviceAccount.projectId);
    console.log("Client Email:", serviceAccount.clientEmail);
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    console.error("Service Account Check:", {
      hasProjectId: !!serviceAccount.projectId,
      hasClientEmail: !!serviceAccount.clientEmail,
      hasPrivateKey: !!serviceAccount.privateKey,
      privateKeyLength: serviceAccount.privateKey?.length || 0,
    });
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