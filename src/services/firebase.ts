
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
import { db } from '@/lib/firebase';
import { HomeContent, Service, Doctor, ContactInfo, Appointment } from '@/types';

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
