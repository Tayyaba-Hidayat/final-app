
import React, { useState } from 'react';
import { User } from '../types';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients' | 'consult'>('schedule');
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

  return (
    <div className="flex-1 flex flex-col h-screen">
      <header className="bg-white border-b px-4 py-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-pink-600">Dr. Dashboard</h2>
        <button onClick={onLogout} className="text-sm text-gray-500">Logout</button>
      </header>

      <div className="flex border-b bg-white">
        <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'schedule' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}>Schedule</button>
        <button onClick={() => setActiveTab('patients')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'patients' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}>Patients</button>
        <button onClick={() => setActiveTab('consult')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'consult' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}>Consult</button>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="font-bold">Weekly Timing</h3>
            {schedule.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold">{s.day}</p>
                  <p className="text-xs text-gray-400">{s.time}</p>
                </div>
                <button 
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${s.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  {s.active ? 'Available' : 'Off'}
                </button>
              </div>
            ))}
            <button className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold mt-4">Save Changes</button>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h3 className="font-bold">Patient History</h3>
            {[
              { name: 'Sarah Miller', condition: 'Acne Vulgaris', lastVisit: '2 days ago' },
              { name: 'Tom Hardy', condition: 'Eczema', lastVisit: '1 week ago' },
              { name: 'Alice Wong', condition: 'Psoriasis', lastVisit: '3 days ago' },
            ].map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-gray-500">Condition: {p.condition}</p>
                <p className="text-xs text-pink-500 mt-1">Last seen: {p.lastVisit}</p>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-pink-100 text-pink-600 py-2 rounded-lg text-xs font-bold">Update Records</button>
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'consult' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">📞</span>
            </div>
            <h3 className="text-xl font-bold">Start Virtual Call</h3>
            <p className="text-gray-500 text-sm px-8">No active consultation requests at the moment.</p>
            <button className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold">Go Online</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
