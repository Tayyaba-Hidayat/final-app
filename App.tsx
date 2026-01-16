
import React, { useState, useEffect } from 'react';
import { User, UserRole, CartItem } from './types';
import { db } from './dbService';
import LoginView from './components/LoginView';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    db.init();
    // Check for existing session
    const savedUser = localStorage.getItem('derma_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('derma_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('derma_session');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.PATIENT:
        return <PatientDashboard user={user} cart={cart} setCart={setCart} onLogout={handleLogout} />;
      case UserRole.DOCTOR:
        return <DoctorDashboard user={user} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case UserRole.STAFF:
        return <StaffDashboard user={user} onLogout={handleLogout} />;
      default:
        return <div className="p-4 text-center mt-20 font-bold text-red-500">Access Denied</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden">
      {renderDashboard()}
    </div>
  );
};

export default App;
