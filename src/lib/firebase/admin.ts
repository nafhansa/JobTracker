import admin from "firebase-admin";

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Handle private key with multiple format support (Vercel can store it in different ways)
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Step 1: Remove any trailing/leading newlines or spaces
  privateKey = privateKey.trim();
  
  // Step 2: Handle various newline formats that Vercel might use
  // Replace escaped newlines (\n) with actual newlines - do this multiple times to handle nested escaping
  privateKey = privateKey.replace(/\\n/g, '\n');
  privateKey = privateKey.replace(/\\\\n/g, '\n');
  privateKey = privateKey.replace(/\\\\\\n/g, '\n');
  
  // Step 3: Remove the trailing \n from JSON format if present
  if (privateKey.endsWith('\\n')) {
    privateKey = privateKey.slice(0, -2);
  }
  if (privateKey.endsWith('\n') && !privateKey.endsWith('-----\n')) {
    // Keep newline before END marker, but remove trailing newline after
    privateKey = privateKey.trimEnd();
    if (!privateKey.endsWith('-----')) {
      privateKey = privateKey + '\n-----END PRIVATE KEY-----';
    }
  }
  
  // Step 4: Ensure proper format with BEGIN/END markers
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Private key missing BEGIN marker');
  }
  if (!privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Private key missing END marker');
  }
  
  // Step 5: Extract the actual key content (between markers)
  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';
  const beginIndex = privateKey.indexOf(beginMarker);
  const endIndex = privateKey.indexOf(endMarker);
  
  if (beginIndex === -1 || endIndex === -1 || endIndex <= beginIndex) {
    throw new Error('Private key markers are invalid or out of order');
  }
  
  // Reconstruct with proper formatting
  const keyContent = privateKey.substring(beginIndex + beginMarker.length, endIndex).trim();
  // Remove any remaining escaped newlines in content
  const cleanKeyContent = keyContent.replace(/\\n/g, '\n').replace(/\s+/g, '\n');
  
  // Reconstruct the full key with proper newlines
  privateKey = `${beginMarker}\n${cleanKeyContent}\n${endMarker}`;
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
    // RSA private keys should be at least 1600 characters when properly formatted
    if (key.length < 1600) {
      console.error("❌ Private key appears to be too short or corrupted");
      console.error("Expected length: ~1600-1700 characters, got:", key.length);
      throw new Error(`Private key appears to be corrupted or incomplete (length: ${key.length})`);
    }
    
    // Validate that key content exists between markers
    const keyContent = key.substring(
      key.indexOf('-----BEGIN PRIVATE KEY-----') + '-----BEGIN PRIVATE KEY-----'.length,
      key.indexOf('-----END PRIVATE KEY-----')
    ).trim();
    
    if (keyContent.length < 1500) {
      console.error("❌ Private key content is too short");
      throw new Error(`Private key content is incomplete (content length: ${keyContent.length})`);
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
  } catch (error) {
    const err = error as { message?: string };
    console.error("❌ Firebase Admin initialization failed:", err.message);
    console.error("Service Account Check:", {
      hasProjectId: !!serviceAccount.projectId,
      hasClientEmail: !!serviceAccount.clientEmail,
      hasPrivateKey: !!serviceAccount.privateKey,
      privateKeyLength: serviceAccount.privateKey?.length || 0,
    });
    throw new Error(`Firebase Admin initialization failed: ${err.message || "Unknown error"}`);
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