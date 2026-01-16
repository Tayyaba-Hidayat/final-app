
import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { db } from '../dbService';
import Logo from './Logo';

const AdminDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<'stats' | 'users' | 'approvals' | 'catalog'>('stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setProducts(db.getProducts());
    setUsers(db.getUsers());
  }, []);

  const handlePriceUpdate = (id: string) => {
    const newPrice = prompt("Enter new price for SKU:");
    if (newPrice && !isNaN(Number(newPrice))) {
      db.updateProduct(id, { price: Number(newPrice) });
      setProducts(db.getProducts());
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      <header className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-100">
        <Logo size="sm" />
        <button onClick={onLogout} className="text-xs font-bold text-gray-400 hover:text-pink-500 transition-colors">LOGOUT</button>
      </header>

      <div className="bg-pink-600 text-white px-6 py-6 shrink-0 shadow-lg">
        <h2 className="text-lg font-bold mb-1 tracking-tight">System Administration</h2>
        <p className="text-[10px] uppercase font-bold text-pink-200 tracking-widest">Master Key Access</p>
      </div>

      <div className="flex bg-white mx-4 -mt-4 p-1 rounded-2xl shadow-xl overflow-x-auto shrink-0 scrollbar-hide z-10 border border-gray-100">
        {['stats', 'users', 'approvals', 'catalog'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${tab === t ? 'text-pink-600 bg-pink-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'stats' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Users</p>
                <p className="text-2xl font-black text-gray-800">{users.length}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">SKUs</p>
                <p className="text-2xl font-black text-gray-800">{products.length}</p>
              </div>
            </div>
            <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-2xl">
              <h4 className="font-bold text-xs uppercase tracking-widest text-pink-400 mb-4">Traffic Monitor</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Server North-East: Healthy</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Database Latency: 4ms</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'catalog' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-black text-sm text-gray-800 uppercase ml-2 tracking-tighter">Inventory Control</h3>
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:border-pink-200 group">
                <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-[10px] text-pink-500 font-bold">${p.price}</p>
                </div>
                <button 
                  onClick={() => handlePriceUpdate(p.id)}
                  className="bg-gray-50 p-2.5 rounded-xl text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="font-black text-sm text-gray-800 uppercase ml-2 tracking-tighter">Permission Table</h3>
             {users.map((u, i) => (
               <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                   <p className="text-xs font-black text-gray-800">{u.email}</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{u.role}</p>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
