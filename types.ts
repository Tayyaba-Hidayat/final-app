
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  availability: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID';
}

export interface AnalysisResult {
  condition: string;
  confidence: number;
  recommendation: string;
  imageUrl: string;
}
