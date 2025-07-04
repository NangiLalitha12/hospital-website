
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
}
