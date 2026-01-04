import admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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