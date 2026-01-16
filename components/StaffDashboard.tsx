
import React, { useState, useEffect } from 'react';
import { User, Appointment } from '../types';
import { db } from '../dbService';
import Logo from './Logo';

const StaffDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<'appointments' | 'schedule' | 'reminders'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(db.getAppointments());
    // Auto refresh every 30 seconds
    const interval = setInterval(() => setAppointments(db.getAppointments()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = (id: string) => {
    if (confirm('Cancel this entry?')) {
      db.deleteAppointment(id);
      setAppointments(db.getAppointments());
    }
  };

  const handlePayment = (id: string) => {
    db.updateAppointment(id, { paymentStatus: 'PAID' });
    setAppointments(db.getAppointments());
    alert('Payment Confirmed.');
  };

  const handleBroadcast = () => {
    alert('SMS & Email alerts queued for ' + appointments.length + ' patients.');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center shrink-0">
        <Logo size="sm" />
        <button onClick={onLogout} className="text-xs font-bold text-gray-400 hover:text-pink-500">EXIT</button>
      </header>

      <div className="bg-gray-900 text-white px-6 py-8 shadow-2xl rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500 blur-[60px] opacity-20"></div>
        <h2 className="text-lg font-black uppercase tracking-tighter">Front Desk Console</h2>
        <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.3em] mt-1">Status: Active Service</p>
      </div>

      <div className="flex bg-gray-50 mx-4 -mt-5 p-1 rounded-2xl shrink-0 shadow-xl border border-white">
        {['appointments', 'schedule', 'reminders'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
        {tab === 'appointments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-800">Live Patient Queue</h3>
              <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[9px] font-black">{appointments.length} REQS</span>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">Queue Cleared</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(app => (
                  <div key={app.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-gray-800 uppercase tracking-tight">{app.patientName}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{app.date} • {app.time}</p>
                      </div>
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${app.paymentStatus === 'PAID' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {app.paymentStatus}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {app.paymentStatus === 'UNPAID' && (
                        <button onClick={() => handlePayment(app.id)} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all">
                          Verify Pay
                        </button>
                      )}
                      <button onClick={() => handleCancel(app.id)} className="flex-1 bg-pink-50 text-pink-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-800">Clinician Roster</h3>
            {['Dr. Sarah Smith', 'Dr. John Doe'].map(name => (
              <div key={name} className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-black text-gray-800 uppercase tracking-tighter">{name}</p>
                  <div className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Shift: 09:00 - 18:00</p>
                <button 
                  onClick={() => alert('Calendar synced.')}
                  className="mt-6 w-full bg-white text-gray-800 border-2 border-gray-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:border-pink-200 transition-all"
                >
                  Manage Slots
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'reminders' && (
          <div className="bg-pink-50 p-12 rounded-[64px] text-center space-y-8 animate-in zoom-in-95 shadow-inner">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-xl text-4xl">📢</div>
            <div className="space-y-3">
              <p className="text-gray-800 font-black text-xs uppercase tracking-[0.3em]">Mass Communications</p>
              <p className="text-gray-400 text-[10px] font-bold leading-loose px-4 uppercase">Direct dispatch to all patients in queue.</p>
            </div>
            <button 
              onClick={handleBroadcast}
              className="w-full bg-pink-500 text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-pink-200 active:scale-95 transition-all"
            >
              Fire Broadcast
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;
