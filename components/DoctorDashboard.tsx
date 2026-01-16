
import React, { useState } from 'react';
import { User } from '../types';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients' | 'consult'>('schedule');
  const [isOnline, setIsOnline] = useState(false);
  const [schedule, setSchedule] = useState([
    { day: 'Monday', time: '09:00 AM - 05:00 PM', active: true },
    { day: 'Tuesday', time: '09:00 AM - 05:00 PM', active: true },
    { day: 'Wednesday', time: '10:00 AM - 04:00 PM', active: true },
    { day: 'Thursday', time: '09:00 AM - 05:00 PM', active: true },
    { day: 'Friday', time: '09:00 AM - 02:00 PM', active: true },
  ]);

  const toggleDay = (index: number) => {
    setSchedule(prev => prev.map((s, i) => i === index ? { ...s, active: !s.active } : s));
  };

  const saveSchedule = () => {
    alert('Weekly schedule has been successfully updated and synced.');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-pink-600">Lume Doctor</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.name}</p>
        </div>
        <button onClick={onLogout} className="bg-gray-50 p-2 rounded-xl text-xs font-bold text-gray-500 transition-colors hover:bg-pink-50">EXIT</button>
      </header>

      <div className="flex bg-gray-50 p-1 m-4 rounded-2xl shrink-0">
        {['schedule', 'patients', 'consult'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Weekly Timing</h3>
            {schedule.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-gray-800">{s.day}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{s.time}</p>
                </div>
                <button 
                  onClick={() => toggleDay(i)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${s.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  {s.active ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
            ))}
            <button 
              onClick={saveSchedule}
              className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-pink-100 active:scale-95 transition-all mt-4"
            >
              SYNC CHANGES
            </button>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Assigned Records</h3>
            {[
              { name: 'Sarah Miller', condition: 'Acne Vulgaris', lastVisit: '2 days ago' },
              { name: 'Tom Hardy', condition: 'Eczema', lastVisit: '1 week ago' },
              { name: 'Alice Wong', condition: 'Psoriasis', lastVisit: '3 days ago' },
            ].map((p, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="font-extrabold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 font-medium">Condition: {p.condition}</p>
                <p className="text-[10px] text-pink-500 font-bold uppercase mt-2">Last seen: {p.lastVisit}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => alert(`Opening records for ${p.name}...`)} className="flex-1 bg-pink-50 text-pink-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">Update</button>
                  <button onClick={() => alert(`Viewing detailed profile for ${p.name}...`)} className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'consult' && (
          <div className="text-center py-12 space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ${isOnline ? 'bg-green-100 scale-110 shadow-xl shadow-green-50' : 'bg-pink-100'}`}>
              <span className="text-5xl">{isOnline ? '🎧' : '📞'}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-800">{isOnline ? 'Waiting for Call...' : 'Consultation Hub'}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest px-8 leading-relaxed">
                {isOnline ? 'System is searching for active patient requests' : 'Switch online to begin receiving patient call requests'}
              </p>
            </div>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`px-12 py-4 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isOnline ? 'bg-red-500 text-white shadow-red-100' : 'bg-pink-500 text-white shadow-pink-100'}`}
            >
              {isOnline ? 'Go Offline' : 'Go Online Now'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
