
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs 
} from "firebase/firestore";
import { db } from "./config";
import { JobApplication } from "@/types";

const JOB_COLLECTION = "jobs";


export const addJob = async (jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">) => {
  try {
    await addDoc(collection(db, JOB_COLLECTION), {
      ...jobData,
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding job:", error);
    throw error;
  }
};



export const subscribeToJobs = (userId: string, callback: (jobs: JobApplication[]) => void) => {
  const q = query(
    collection(db, JOB_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc") 
  );

  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JobApplication[];
    callback(jobs);
  });
};


export const updateJob = async (jobId: string, data: Partial<JobApplication>) => {
  try {
    const jobRef = doc(db, JOB_COLLECTION, jobId);
    await updateDoc(jobRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};


export const deleteJob = async (jobId: string) => {
  try {
    const jobRef = doc(db, JOB_COLLECTION, jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

/**
 * Get the count of jobs for a specific user
 */
export const getJobCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, JOB_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting job count:", error);
    throw error;
  }
};