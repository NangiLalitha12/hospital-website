
export interface HomeContent {
  id?: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImage: string;
  welcomeMessage: string;
  introText: string;
}

export interface Service {
  id?: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
  qualifications: string[];
}

export interface ContactInfo {
  id?: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  emergencyNumber: string;
  chatWidget: string;
  location?: string;
  getInTouchMessage?: string;
}

export interface Appointment {
  id?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  consultationFee?: number;
  feeStatus?: 'pending' | 'paid' | 'waived';
  feeNotes?: string;
}

export interface HealthRecord {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  uploadDate: Date;
  fileType: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Billing {
  id?: string;
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  status: 'pending' | 'paid' | 'waived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
