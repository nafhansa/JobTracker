import admin from "firebase-admin";

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Handle private key with multiple format support (Vercel can store it in different ways)
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Handle various newline formats that Vercel might use
  // 1. Replace escaped newlines (\n) with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  // 2. Replace double-escaped newlines (\\n) with actual newlines
  privateKey = privateKey.replace(/\\\\n/g, '\n');
  // 3. Ensure proper format with BEGIN/END markers
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // If it's missing the header, try to reconstruct it
    privateKey = privateKey.trim();
    if (!privateKey.startsWith('-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
  }
  // Trim any extra whitespace
  privateKey = privateKey.trim();
}

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

    // Validate private key format more thoroughly
    const key = serviceAccount.privateKey;
    if (!key.includes("BEGIN PRIVATE KEY") || !key.includes("END PRIVATE KEY")) {
      console.error("❌ Private key format is incorrect. Expected format: -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----");
      throw new Error("Invalid private key format: missing BEGIN/END markers");
    }
    
    // Check if key is too short (likely corrupted)
    if (key.length < 100) {
      console.error("❌ Private key appears to be too short or corrupted");
      throw new Error("Private key appears to be corrupted or incomplete");
    }
    
    // Log key info (without exposing the actual key)
    console.log("Private key validation:", {
      hasBeginMarker: key.includes("BEGIN PRIVATE KEY"),
      hasEndMarker: key.includes("END PRIVATE KEY"),
      keyLength: key.length,
      lineCount: key.split('\n').length,
    });

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