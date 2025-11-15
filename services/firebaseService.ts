

import { 
    User,
    Employee,
    InputData,
    OutputData,
    OperationBreakdownData,
    HourlyProductionData,
    OTListData,
} from '../types';
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
    query,
    where,
    // FIX: Added missing imports for CRUD operations.
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

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

export const createUserWithEmailAndPassword = async (email: string, password: string, additionalData: Omit<User, 'uid' | 'email'>): Promise<User | null> => {
  const userCredential = await fbCreateUser(auth, email, password);
  const firebaseUser = userCredential.user;
  if (firebaseUser) {
    const newUser: User = {
        uid: firebaseUser.uid,
        email,
        ...additionalData,
    };
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

// FIX: Added all missing CRUD functions.
// --- CRUD Operations ---

// Generic get function
const getData = async <T>(collectionName: string): Promise<T[]> => {
    const collRef = collection(db, collectionName);
    try {
        const q = query(collRef, orderBy("slNo", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (e) {
        // Fallback if slNo field doesn't exist for ordering
        console.warn(`Could not order by 'slNo' for ${collectionName}, fetching without order.`, e);
        const querySnapshot = await getDocs(collRef);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    }
};

// Generic add function
const addData = async (collectionName: string, data: object): Promise<void> => {
    const collRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collRef);
    const slNo = querySnapshot.size + 1;
    await addDoc(collRef, { ...data, slNo, createdAt: Timestamp.now() });
};

// Generic update function
const updateData = async (collectionName: string, id: string, data: object): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
};

// Generic delete function
const deleteData = async (collectionName: string, id: string): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
};


// Employees
export const getEmployees = () => getData<Employee>('employees');
export const addEmployee = (data: Omit<Employee, 'id' | 'slNo'>) => addData('employees', data);
export const updateEmployee = (id: string, data: Partial<Omit<Employee, 'id' | 'slNo'>>) => updateData('employees', id, data);
export const deleteEmployee = (id: string) => deleteData('employees', id);

// Inputs
export const getInputs = () => getData<InputData>('inputs');
export const addInput = (data: Omit<InputData, 'id' | 'slNo'>) => addData('inputs', data);
export const updateInput = (id: string, data: Partial<Omit<InputData, 'id' | 'slNo'>>) => updateData('inputs', id, data);
export const deleteInput = (id: string) => deleteData('inputs', id);

// Outputs
export const getOutputs = () => getData<OutputData>('outputs');
export const addOutput = (data: Omit<OutputData, 'id' | 'slNo'>) => addData('outputs', data);
export const updateOutput = (id: string, data: Partial<Omit<OutputData, 'id' | 'slNo'>>) => updateData('outputs', id, data);
export const deleteOutput = (id: string) => deleteData('outputs', id);

// Operation Breakdowns
export const getOperationBreakdowns = () => getData<OperationBreakdownData>('operationBreakdowns');
export const addOperationBreakdown = (data: Omit<OperationBreakdownData, 'id' | 'slNo'>) => addData('operationBreakdowns', data);
export const updateOperationBreakdown = (id: string, data: Partial<Omit<OperationBreakdownData, 'id' | 'slNo'>>) => updateData('operationBreakdowns', id, data);
export const deleteOperationBreakdown = (id: string) => deleteData('operationBreakdowns', id);

// Hourly Productions
export const getHourlyProductions = () => getData<HourlyProductionData>('hourlyProductions');
export const addHourlyProduction = (data: Omit<HourlyProductionData, 'id' | 'slNo'>) => addData('hourlyProductions', data);
export const updateHourlyProduction = (id: string, data: Partial<Omit<HourlyProductionData, 'id' | 'slNo'>>) => updateData('hourlyProductions', id, data);
export const deleteHourlyProduction = (id: string) => deleteData('hourlyProductions', id);

// OT Lists
export const getOTLists = () => getData<OTListData>('otLists');
export const addOTList = (data: Omit<OTListData, 'id' | 'slNo'>) => addData('otLists', data);
export const updateOTList = (id: string, data: Partial<Omit<OTListData, 'id' | 'slNo'>>) => updateData('otLists', id, data);
export const deleteOTList = (id: string) => deleteData('otLists', id);