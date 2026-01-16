
import React, { useState, useEffect } from 'react';
import { User, Product, CartItem, AnalysisResult, Doctor, Appointment } from '../types';
import { DOCTORS } from '../constants';
import { db } from '../dbService';
import { analyzeSkinImage, dermaChat } from '../geminiService';

interface PatientDashboardProps {
  user: User;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, cart, setCart, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'analysis' | 'shop' | 'chat' | 'booking'>('home');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string, text: string }[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeSkinImage(base64);
      setAnalysis({ ...result, imageUrl: reader.result as string });
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleBooking = () => {
    if (!selectedDoctor || !bookingDate || !bookingTime) return;
    
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: bookingDate,
      time: bookingTime,
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    };
    
    db.saveAppointment(newAppt);
    setBookingConfirmed(true);
  };

  const handleChat = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = { role: 'user', text: inputMsg };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    const resp = await dermaChat(inputMsg, []);
    setChatMessages(prev => [...prev, { role: 'model', text: resp || 'Error getting response' }]);
  };

  const totalCart = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const NavItem = ({ icon, label, id }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsCheckout(false); }}
      className={`flex flex-col items-center py-2 px-4 transition-all duration-300 ${activeTab === id ? 'text-pink-600 scale-110' : 'text-gray-400'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] mt-1 font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-50">
        <div>
          <h2 className="text-xl font-extrabold text-pink-600">Lume Skin</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Skincare AI</p>
        </div>
        <button onClick={onLogout} className="bg-gray-50 p-2 rounded-full hover:bg-pink-50 transition-colors">
          🚪
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100">
              <h3 className="font-bold text-xl mb-1">Welcome, {user.name}</h3>
              <p className="text-pink-100 text-sm mb-4">You have no upcoming consultations today.</p>
              <button onClick={() => setActiveTab('analysis')} className="bg-white text-pink-500 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all">
                Start Skin Scan
              </button>
            </div>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">Best Sellers</h4>
                <button onClick={() => setActiveTab('shop')} className="text-pink-500 text-xs font-bold uppercase">View All</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                {products.slice(0, 3).map(p => (
                  <div key={p.id} className="min-w-[140px] bg-gray-50 p-3 rounded-3xl shrink-0">
                    <img src={p.image} className="w-full h-24 object-cover rounded-2xl mb-2" alt={p.name} />
                    <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-pink-500 font-bold mt-1">${p.price}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-bold text-gray-800">AI Analysis</h3>
            <div className="bg-pink-50 p-10 rounded-[40px] text-center border-4 border-dashed border-pink-200">
              <div className="text-4xl mb-4">📸</div>
              <p className="text-gray-500 text-sm mb-6 font-medium">Place your skin area in a well-lit spot</p>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="skin-upload" />
              <label htmlFor="skin-upload" className="cursor-pointer bg-pink-500 text-white px-8 py-4 rounded-3xl font-bold inline-block shadow-lg shadow-pink-200 active:scale-95 transition-all">
                Upload or Take Photo
              </label>
            </div>

            {isAnalyzing && (
              <div className="bg-white p-6 rounded-3xl border border-pink-100 flex items-center gap-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent"></div>
                <p className="text-sm font-bold text-pink-600">Processing medical-grade analysis...</p>
              </div>
            )}

            {analysis && (
              <div className="bg-white p-5 rounded-[32px] shadow-xl shadow-pink-50 border border-gray-100 overflow-hidden">
                <img src={analysis.imageUrl} className="w-full h-56 object-cover rounded-2xl mb-5" />
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-extrabold text-2xl text-gray-800">{analysis.condition}</h3>
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[10px] font-bold">{(analysis.confidence * 100).toFixed(0)}% Match</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl italic">"{analysis.recommendation}"</p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button onClick={() => setActiveTab('booking')} className="bg-pink-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-pink-100">
                    Book Consult
                  </button>
                  <button onClick={() => setActiveTab('shop')} className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm">
                    Find Products
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6">
            {!isCheckout ? (
              <>
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-bold text-gray-800 leading-none">Catalog</h3>
                  <button onClick={() => setIsCheckout(true)} className="relative bg-pink-50 p-3 rounded-2xl">
                    🛍️
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.length}</span>}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 group">
                      <div className="relative mb-3 overflow-hidden rounded-2xl">
                        <img src={p.image} className="w-full h-36 object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold">⭐ {p.rating}</div>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1">{p.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-pink-600 text-lg">${p.price}</span>
                        <button onClick={() => addToCart(p)} className="bg-gray-900 text-white w-8 h-8 rounded-xl flex items-center justify-center font-bold hover:bg-pink-500 transition-colors">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white space-y-6">
                <button onClick={() => setIsCheckout(false)} className="text-xs font-bold text-pink-500 flex items-center gap-1">
                  <span className="text-lg">←</span> RETURN TO STORE
                </button>
                <h3 className="text-2xl font-bold text-gray-800">Checkout</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-[40px]">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-bold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-400 font-bold">QTY: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-pink-600">${item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-900 text-white p-6 rounded-[32px] space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-gray-400 text-sm">Subtotal</span>
                        <span className="font-bold">${totalCart}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total Pay</span>
                        <span className="text-2xl font-extrabold text-pink-400">${totalCart}</span>
                      </div>
                      <button onClick={() => { alert('Order Placed! Your products will arrive soon.'); setCart([]); setIsCheckout(false); }} className="w-full bg-pink-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-pink-900/20 active:scale-95 transition-all">
                        CONFIRM & PAY
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-280px)] flex flex-col bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center space-y-4 mt-20">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">🤖</div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">LumeBot Online</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none shadow-lg shadow-pink-100' : 'bg-white text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-3">
              <input 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask LumeBot..."
                className="flex-1 border-none bg-gray-50 rounded-2xl px-5 text-sm focus:ring-2 focus:ring-pink-400 transition-all"
              />
              <button onClick={handleChat} className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                🚀
              </button>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6">
            {!selectedDoctor ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800">Specialists</h3>
                <div className="space-y-4">
                  {DOCTORS.map(doc => (
                    <div key={doc.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 cursor-pointer hover:border-pink-300 transition-all active:scale-[0.98]" onClick={() => setSelectedDoctor(doc)}>
                      <img src={doc.image} className="w-20 h-20 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <p className="font-extrabold text-gray-800">{doc.name}</p>
                        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">{doc.specialty}</p>
                        <div className="flex gap-1 mt-2">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                        </div>
                      </div>
                      <span className="text-gray-300">→</span>
                    </div>
                  ))}
                </div>
              </>
            ) : !bookingConfirmed ? (
              <div className="bg-white space-y-6 animate-in slide-in-from-right-4">
                <button onClick={() => setSelectedDoctor(null)} className="text-xs font-bold text-pink-500">← CHANGE DOCTOR</button>
                <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-3xl">
                  <img src={selectedDoctor.image} className="w-16 h-16 rounded-2xl" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{selectedDoctor.name}</h3>
                    <p className="text-xs text-pink-500 font-bold uppercase">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Appointment Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-400 font-bold" />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctor.availability.map(time => (
                      <button 
                        key={time}
                        onClick={() => setBookingTime(time)}
                        className={`py-3 px-1 text-[10px] font-extrabold rounded-xl border-2 transition-all ${bookingTime === time ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={!bookingDate || !bookingTime}
                  onClick={handleBooking}
                  className="w-full bg-pink-500 disabled:bg-gray-200 text-white py-5 rounded-[24px] font-bold text-sm shadow-xl shadow-pink-100 active:scale-95 transition-all"
                >
                  CONFIRM APPOINTMENT
                </button>
              </div>
            ) : (
              <div className="text-center bg-pink-50 p-10 rounded-[40px] animate-in zoom-in-75">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">✨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirmed!</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">Your session with {selectedDoctor.name} is scheduled. You'll receive a reminder soon.</p>
                <button 
                  onClick={() => { setBookingConfirmed(false); setSelectedDoctor(null); setActiveTab('home'); }}
                  className="mt-8 bg-gray-900 text-white px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest"
                >
                  Return Home
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-50 flex justify-around px-4 pb-8 pt-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <NavItem icon="🏠" label="Home" id="home" />
        <NavItem icon="🔬" label="AI Scan" id="analysis" />
        <NavItem icon="🛍️" label="Shop" id="shop" />
        <NavItem icon="📅" label="Clinics" id="booking" />
        <NavItem icon="🤖" label="Chat" id="chat" />
      </nav>
    </div>
  );
};

export default PatientDashboard;
