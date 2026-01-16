
import React, { useState, useEffect } from 'react';
import { User, Appointment } from '../types';
import { db } from '../dbService';

const StaffDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<'appointments' | 'schedule' | 'reminders'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(db.getAppointments());
  }, []);

  const handleCancel = (id: string) => {
    if (confirm('Really cancel this appointment?')) {
      db.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handlePayment = (id: string) => {
    db.updateAppointment(id, { paymentStatus: 'PAID' });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: 'PAID' } : a));
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-extrabold text-gray-800">Clinic Desk</h2>
          <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">Active: {user.name}</p>
        </div>
        <button onClick={onLogout} className="bg-gray-50 p-2 rounded-xl text-xs font-bold text-gray-500">OUT</button>
      </header>

      <div className="flex bg-gray-50 p-1 m-4 rounded-2xl">
        {['appointments', 'schedule', 'reminders'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 space-y-4">
        {tab === 'appointments' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-gray-800 uppercase text-xs tracking-wider">Queue System</h3>
              <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded text-[10px] font-bold">{appointments.length} TOTAL</span>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-20 text-gray-300 text-xs font-bold uppercase">No records found</div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-left-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-extrabold text-gray-800">{app.patientName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{app.date} • {app.time}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-1 rounded-lg font-bold ${app.paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {app.paymentStatus}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {app.paymentStatus === 'UNPAID' && (
                      <button onClick={() => handlePayment(app.id)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">
                        Collect Cash
                      </button>
                    )}
                    <button onClick={() => handleCancel(app.id)} className="flex-1 bg-pink-50 text-pink-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Physician Roster</h3>
            {['Dr. Sarah Smith', 'Dr. John Doe'].map(name => (
              <div key={name} className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-800">{name}</p>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Status: Accepting Appointments</p>
                <button className="mt-4 text-[10px] font-bold text-pink-500 border-b border-pink-500 uppercase tracking-widest pb-1">Modify Hours</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'reminders' && (
          <div className="bg-pink-50 p-10 rounded-[40px] text-center">
            <div className="text-3xl mb-4">📢</div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-6 leading-relaxed">Broadcast SMS/Push notifications to all patients with sessions today.</p>
            <button className="bg-pink-500 text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-pink-100 active:scale-95">
              Run Broadcast
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;
