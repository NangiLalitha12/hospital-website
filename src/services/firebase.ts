import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { HomeContent, Service, Doctor, ContactInfo, Appointment, HealthRecord, ContactMessage, User } from '@/types';

// Home Content
export const getHomeContent = async (): Promise<HomeContent | null> => {
  try {
    const docRef = doc(db, 'content', 'home');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as HomeContent : null;
  } catch (error) {
    console.error('Error fetching home content:', error);
    return null;
  }
};

export const updateHomeContent = async (content: HomeContent) => {
  const docRef = doc(db, 'content', 'home');
  await setDoc(docRef, content, { merge: true });
};

// Services
export const getServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

export const addService = async (service: Omit<Service, 'id'>) => {
  await addDoc(collection(db, 'services'), service);
};

export const updateService = async (id: string, service: Partial<Service>) => {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, service);
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id));
};

// Doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

export const addDoctor = async (doctor: Omit<Doctor, 'id'>) => {
  await addDoc(collection(db, 'doctors'), doctor);
};

export const updateDoctor = async (id: string, doctor: Partial<Doctor>) => {
  const docRef = doc(db, 'doctors', id);
  await updateDoc(docRef, doctor);
};

export const deleteDoctor = async (id: string) => {
  await deleteDoc(doc(db, 'doctors', id));
};

// Contact Info
export const getContactInfo = async (): Promise<ContactInfo | null> => {
  try {
    const docRef = doc(db, 'content', 'contact');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ContactInfo : null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
};

export const updateContactInfo = async (contact: ContactInfo) => {
  const docRef = doc(db, 'content', 'contact');
  await setDoc(docRef, contact, { merge: true });
};

// Health Records
export const getHealthRecords = async (): Promise<HealthRecord[]> => {
  try {
    console.log('Fetching health records from Firebase...');
    const q = query(collection(db, 'healthRecords'), orderBy('uploadDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing record:', doc.id, data);
      return { 
        id: doc.id, 
        ...data,
        uploadDate: data.uploadDate?.toDate ? data.uploadDate.toDate() : new Date(data.uploadDate || Date.now())
      } as HealthRecord;
    });
    console.log('Fetched health records:', records.length);
    return records;
  } catch (error) {
    console.error('Error fetching health records:', error);
    return [];
  }
};

export const addHealthRecord = async (record: Omit<HealthRecord, 'id'>) => {
  try {
    console.log('Adding health record to Firebase:', record);
    const docRef = await addDoc(collection(db, 'healthRecords'), {
      ...record,
      uploadDate: new Date()
    });
    console.log('Health record added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding health record:', error);
    throw error;
  }
};

export const updateHealthRecord = async (id: string, record: Partial<HealthRecord>) => {
  try {
    console.log('Updating health record:', id, record);
    const docRef = doc(db, 'healthRecords', id);
    await updateDoc(docRef, {
      ...record,
      updatedAt: new Date()
    });
    console.log('Health record updated successfully');
  } catch (error) {
    console.error('Error updating health record:', error);
    throw error;
  }
};

export const deleteHealthRecord = async (id: string) => {
  try {
    console.log('Deleting health record:', id);
    await deleteDoc(doc(db, 'healthRecords', id));
    console.log('Health record deleted successfully');
  } catch (error) {
    console.error('Error deleting health record:', error);
    throw error;
  }
};

export const uploadHealthRecordFile = async (file: File, fileName: string): Promise<string> => {
  try {
    console.log('Uploading file:', fileName, 'Size:', file.size);
    const storageRef = ref(storage, `health-records/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File uploaded successfully, URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Contact Messages
export const getMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as ContactMessage));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const addMessage = async (message: Omit<ContactMessage, 'id'>) => {
  await addDoc(collection(db, 'messages'), {
    ...message,
    createdAt: new Date(),
    seen: false
  });
};

export const deleteMessage = async (id: string) => {
  await deleteDoc(doc(db, 'messages', id));
};

export const updateMessage = async (id: string, updates: Partial<ContactMessage>) => {
  const docRef = doc(db, 'messages', id);
  await updateDoc(docRef, updates);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (user: Omit<User, 'id'>) => {
  await addDoc(collection(db, 'users'), {
    ...user,
    createdAt: new Date()
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

// Appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Appointment));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  await addDoc(collection(db, 'appointments'), {
    ...appointment,
    createdAt: new Date()
  });
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  const docRef = doc(db, 'appointments', id);
  await updateDoc(docRef, { status });
};

export const updateAppointmentFee = async (id: string, fee: number, feeStatus: string, notes?: string) => {
  const docRef = doc(db, 'appointments', id);
  await updateDoc(docRef, { 
    consultationFee: fee,
    feeStatus,
    feeNotes: notes || ''
  });
};

export const getPatientAppointments = async (email: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'), 
      where('patientEmail', '==', email),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Appointment));
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return [];
  }
};

export const deleteAppointment = async (id: string) => {
  await deleteDoc(doc(db, 'appointments', id));
};

// Billing
export const getBillingRecords = async (): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'), 
      where('status', 'in', ['confirmed', 'completed']),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Appointment));
  } catch (error) {
    console.error('Error fetching billing records:', error);
    return [];
  }
};

export const generateBillingReport = async (startDate: Date, endDate: Date): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Appointment));
  } catch (error) {
    console.error('Error generating billing report:', error);
    return [];
  }
};
