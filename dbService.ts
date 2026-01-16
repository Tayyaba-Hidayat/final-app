
import { User, Product, Appointment, UserRole } from './types';
import { PRODUCTS, DOCTORS } from './constants';

const DB_KEYS = {
  USERS: 'derma_users',
  APPOINTMENTS: 'derma_appointments',
  PRODUCTS: 'derma_products',
};

export const db = {
  // Initialize DB with defaults if empty
  init: () => {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([
        { id: 'admin1', name: 'System Admin', role: UserRole.ADMIN, email: 'admin@derma.com' }
      ]));
    }
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEYS.APPOINTMENTS)) {
      localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify([]));
    }
  },

  // User Operations
  getUsers: (): User[] => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  addUser: (user: User) => {
    const users = db.getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  // Appointment Operations
  getAppointments: (): Appointment[] => JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS) || '[]'),
  saveAppointment: (appt: Appointment) => {
    const appts = db.getAppointments();
    appts.push(appt);
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));
  },
  updateAppointment: (id: string, updates: Partial<Appointment>) => {
    const appts = db.getAppointments().map(a => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));
  },
  deleteAppointment: (id: string) => {
    const appts = db.getAppointments().filter(a => a.id !== id);
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appts));
  },

  // Product Operations
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]'),
  updateProduct: (id: string, updates: Partial<Product>) => {
    const prods = db.getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(prods));
  }
};
