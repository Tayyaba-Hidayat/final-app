
import React, { useState } from 'react';
import { User } from '../types';

const AdminDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<'users' | 'approvals' | 'catalog' | 'stats'>('stats');

  return (
    <div className="flex-1 flex flex-col h-screen">
      <header className="bg-pink-600 text-white px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button onClick={onLogout} className="text-xs bg-pink-700 px-3 py-1 rounded">Logout</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-pink-500 p-2 rounded-lg text-center">
            <p className="text-xs">Active Users</p>
            <p className="text-lg font-bold">1,240</p>
          </div>
          <div className="bg-pink-500 p-2 rounded-lg text-center">
            <p className="text-xs">Revenue</p>
            <p className="text-lg font-bold">$12k</p>
          </div>
          <div className="bg-pink-500 p-2 rounded-lg text-center">
            <p className="text-xs">Uptime</p>
            <p className="text-lg font-bold">99.9%</p>
          </div>
        </div>
      </header>

      <div className="flex bg-white shadow-sm overflow-x-auto">
        {['stats', 'users', 'approvals', 'catalog'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${tab === t ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h4 className="font-bold mb-3">System Performance</h4>
              <div className="h-2 bg-gray-100 rounded-full mb-4">
                <div className="h-full bg-green-500 w-[95%] rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500">API Response Time: 120ms</p>
              <p className="text-xs text-gray-500">Error Rate: 0.01%</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h4 className="font-bold mb-3">Recent Reports</h4>
              <div className="space-y-2">
                <p className="text-xs border-l-4 border-red-500 pl-2 py-1">Payment failed for user #902</p>
                <p className="text-xs border-l-4 border-yellow-500 pl-2 py-1">Product out of stock: Retinol Serum</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="font-bold">Pending Dermatologists</h3>
            {[
              { name: 'Dr. Michael Chen', exp: '10 years', cert: 'Dermatology Board' },
              { name: 'Dr. Sarah Lane', exp: '5 years', cert: 'Cosmetology Cert' },
            ].map((d, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                <p className="font-bold">{d.name}</p>
                <p className="text-xs text-gray-500">Experience: {d.exp}</p>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-bold">Approve</button>
                  <button className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-xs font-bold">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'catalog' && (
          <div className="grid grid-cols-1 gap-4">
            <button className="bg-pink-100 text-pink-600 py-3 rounded-xl font-bold border-2 border-dashed border-pink-300">
              + Add New Product
            </button>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold">Hydrating Cleanser</p>
                <p className="text-xs text-gray-400">Inventory: 45 units</p>
              </div>
              <button className="text-pink-500 text-sm">Edit</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
