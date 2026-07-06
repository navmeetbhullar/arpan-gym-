import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { Member, GymAnnouncement, GymNotification, PlanChangeRequest, WorkoutPlan, DietPlan } from "./types";

const firebaseConfig = {
  projectId: "bamboo-enterprise-3gtt6",
  appId: "1:562256145565:web:a7b6c860af24c9a783b874",
  apiKey: "AIzaSyCsv5j7VrnvsL0Rs-cR0V63g5teXNfuq0Y",
  authDomain: "bamboo-enterprise-3gtt6.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-arpangymdashboar-1ab20172-e509-43d2-b0eb-321a85b03d6d",
  storageBucket: "bamboo-enterprise-3gtt6.firebasestorage.app",
  messagingSenderId: "562256145565",
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Generic helper to get a single document from Firestore
export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error);
    return null;
  }
}

// Generic helpers for Firestore collections
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    return items;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

export async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    console.error(`Error saving document in ${collectionName}:`, error);
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
  }
}

// Batch seeding helper
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<T[]> {
  try {
    const existing = await getCollectionData<T>(collectionName);
    if (existing.length > 0) {
      return existing;
    }

    console.log(`Seeding initial data for ${collectionName}...`);
    const batch = writeBatch(db);
    initialData.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    return initialData;
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error);
    return initialData;
  }
}
