import { User, Employee, InputData, OutputData, OperationBreakdownData } from '../types';
import { auth, db, storage } from '../firebase';
import { 
    createUserWithEmailAndPassword as fbCreateUser, 
    signInWithEmailAndPassword as fbSignIn,
    sendPasswordResetEmail as fbSendPasswordReset,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { 
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- UTILS ---
const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};


// --- AUTH MOCKS ---

export const signInWithEmailAndPassword = async (email: string, password: string, rememberMe: boolean): Promise<User | null> => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const userCredential = await fbSignIn(auth, email, password);
    const firebaseUser = userCredential.user;
    if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return { uid: firebaseUser.uid, ...userDoc.data() } as User;
        }
    }
    return null;
};

export const createUserWithEmailAndPassword = async (email: string, password: string, additionalData: Omit<User, 'uid' | 'email'>, profilePicture: File | null): Promise<User | null> => {
  const userCredential = await fbCreateUser(auth, email, password);
  const firebaseUser = userCredential.user;
  if (firebaseUser) {
    let profilePictureUrl = additionalData.profilePictureUrl || '';
    if(profilePicture) {
        profilePictureUrl = await uploadFile(profilePicture, 'profilePictures');
    }

    const newUser: User = {
        uid: firebaseUser.uid,
        email,
        ...additionalData,
        profilePictureUrl,
    };
    // FIX: 'Omit' is a TypeScript type, not a runtime function. The code was attempting to use it to remove the 'uid' property from the newUser object before saving to Firestore. The correct approach is to create a new object without the 'uid' property.
    const { uid, ...dataToSave } = newUser;
    await setDoc(doc(db, 'users', firebaseUser.uid), dataToSave);
    return newUser;
  }
  return null;
};

export const sendPasswordResetEmail = async (email: string, officeId: string): Promise<boolean> => {
  const q = query(collection(db, "users"), where("email", "==", email), where("officeId", "==", officeId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    await fbSendPasswordReset(auth, email);
    return true;
  }
  return false;
};

export const signOutUser = async (): Promise<void> => {
    await signOut(auth);
}


// --- EMPLOYEE FIRESTORE MOCKS ---

const mapDocToData = <T>(doc: any): T => ({ id: doc.id, ...doc.data() } as T);

export const getEmployees = async (): Promise<Employee[]> => {
  const q = query(collection(db, "employees"), orderBy("slNo", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDocToData<Employee>(doc));
};

export const addEmployee = async (data: Omit<Employee, 'id' | 'slNo'>): Promise<Employee> => {
    const snapshot = await getDocs(collection(db, "employees"));
    const slNo = snapshot.docs.length + 1;
    const docRef = await addDoc(collection(db, "employees"), { ...data, slNo });
    return { id: docRef.id, slNo, ...data };
};

export const updateEmployee = async (id: string, data: Partial<Omit<Employee, 'id' | 'slNo'>>): Promise<void> => {
    const empDoc = doc(db, "employees", id);
    await updateDoc(empDoc, data);
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "employees", id));
};


// --- INPUT FIRESTORE MOCKS ---

export const getInputs = async(): Promise<InputData[]> => {
    const q = query(collection(db, "inputs"), orderBy("slNo", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToData<InputData>(doc));
}

export const addInput = async(data: Omit<InputData, 'id' | 'slNo'>): Promise<InputData> => {
    const snapshot = await getDocs(collection(db, "inputs"));
    const slNo = snapshot.docs.length + 1;
    const docRef = await addDoc(collection(db, "inputs"), { ...data, slNo });
    return { id: docRef.id, slNo, ...data };
}

export const updateInput = async(id: string, data: Partial<Omit<InputData, 'id' | 'slNo'>>): Promise<void> => {
    await updateDoc(doc(db, "inputs", id), data);
}

export const deleteInput = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "inputs", id));
}

// --- OUTPUT FIRESTORE MOCKS ---

export const getOutputs = async(): Promise<OutputData[]> => {
    const q = query(collection(db, "outputs"), orderBy("slNo", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToData<OutputData>(doc));
}

export const addOutput = async(data: Omit<OutputData, 'id' | 'slNo'>): Promise<OutputData> => {
    const snapshot = await getDocs(collection(db, "outputs"));
    const slNo = snapshot.docs.length + 1;
    const docRef = await addDoc(collection(db, "outputs"), { ...data, slNo });
    return { id: docRef.id, slNo, ...data };
}

export const updateOutput = async(id: string, data: Partial<Omit<OutputData, 'id' | 'slNo'>>): Promise<void> => {
    await updateDoc(doc(db, "outputs", id), data);
}

export const deleteOutput = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "outputs", id));
}

// --- OPERATION BREAKDOWN FIRESTORE ---

export const getOperationBreakdowns = async(): Promise<OperationBreakdownData[]> => {
    const q = query(collection(db, "operationBreakdowns"), orderBy("slNo", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToData<OperationBreakdownData>(doc));
}

export const addOperationBreakdown = async(data: Omit<OperationBreakdownData, 'id' | 'slNo'>): Promise<OperationBreakdownData> => {
    const snapshot = await getDocs(collection(db, "operationBreakdowns"));
    const slNo = snapshot.docs.length + 1;
    const docRef = await addDoc(collection(db, "operationBreakdowns"), { ...data, slNo });
    return { id: docRef.id, slNo, ...data };
}

export const updateOperationBreakdown = async(id: string, data: Partial<Omit<OperationBreakdownData, 'id' | 'slNo'>>): Promise<void> => {
    await updateDoc(doc(db, "operationBreakdowns", id), data);
}

export const deleteOperationBreakdown = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "operationBreakdowns", id));
}


// --- STORAGE ---
export const uploadEmployeeFile = (file: File, employeeId: string, type: 'photo' | 'nid' | 'nidBack' | 'officeId') => {
    return uploadFile(file, `employees/${employeeId}/${type}`);
};