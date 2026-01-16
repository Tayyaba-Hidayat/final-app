
import React, { useState, useEffect } from 'react';
import { User, Product, CartItem, AnalysisResult, Doctor, Appointment } from '../types';
import { DOCTORS } from '../constants';
import { db } from '../dbService';
import { analyzeSkinImage, dermaChat } from '../geminiService';
import Logo from './Logo';

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
  }, [activeTab]);

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
    setChatMessages(prev => [...prev, { role: 'model', text: resp || 'Connection interrupted.' }]);
  };

  const totalCart = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const NavItem = ({ icon, label, id }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsCheckout(false); setAnalysis(null); setSelectedDoctor(null); }}
      className={`flex flex-col items-center py-2 px-4 transition-all duration-300 ${activeTab === id ? 'text-pink-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] mt-1 font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <header className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-50">
        <Logo size="sm" />
        <button onClick={onLogout} className="bg-gray-50 w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-pink-50 transition-colors">
          <span className="text-gray-400 text-lg">🚪</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[80px] opacity-30 -mr-10 -mt-10"></div>
              <h3 className="font-black text-2xl mb-1">Hi, {user.name.split(' ')[0]}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">Skin Score: 92/100</p>
              <button onClick={() => setActiveTab('analysis')} className="bg-pink-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-900/40 active:scale-95 transition-all">
                Run Diagnostic
              </button>
            </div>

            <section>
              <div className="flex justify-between items-end mb-4">
                <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest">Recommended</h4>
                <button onClick={() => setActiveTab('shop')} className="text-pink-500 text-[10px] font-black uppercase tracking-widest">Store →</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {products.slice(0, 3).map(p => (
                  <div key={p.id} className="min-w-[160px] bg-white p-4 rounded-[32px] shrink-0 border border-gray-100 shadow-sm">
                    <img src={p.image} className="w-full h-28 object-cover rounded-2xl mb-3 shadow-inner" alt={p.name} />
                    <p className="text-xs font-black text-gray-800 truncate mb-1">{p.name}</p>
                    <p className="text-[10px] text-pink-500 font-black uppercase">${p.price}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setActiveTab('home')} className="text-gray-400 hover:text-pink-500">←</button>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">AI Analysis</h3>
            </div>
            
            {!analysis && (
              <div className="bg-pink-50 p-12 rounded-[48px] text-center border-4 border-dashed border-pink-200 group hover:border-pink-400 transition-colors">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">📸</div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">Place skin area in bright light</p>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="skin-upload" />
                <label htmlFor="skin-upload" className="cursor-pointer bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest inline-block shadow-2xl active:scale-95 transition-all">
                  Capture Frame
                </label>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white p-8 rounded-[40px] border border-pink-100 flex flex-col items-center gap-4 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                <div>
                  <p className="text-sm font-black text-gray-800 uppercase tracking-widest">Analyzing Pixels</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Lume Medical Intelligence v2.1</p>
                </div>
              </div>
            )}

            {analysis && (
              <div className="bg-white p-6 rounded-[48px] shadow-2xl shadow-pink-100 border border-gray-100 overflow-hidden animate-in zoom-in-95">
                <img src={analysis.imageUrl} className="w-full h-64 object-cover rounded-[32px] mb-6 shadow-inner" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-2xl text-gray-800 tracking-tight">{analysis.condition}</h3>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Medical Insight</p>
                  </div>
                  <div className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black">{(analysis.confidence * 100).toFixed(0)}% PROB</div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl mb-8">
                  <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{analysis.recommendation}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('booking')} className="bg-pink-500 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200">
                    Book Consult
                  </button>
                  <button onClick={() => setAnalysis(null)} className="bg-gray-100 text-gray-600 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest">
                    Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">The Lab Store</h3>
              <button onClick={() => setIsCheckout(true)} className="relative bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl">
                🛍️
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] rounded-full w-5 h-5 flex items-center justify-center font-black border-2 border-white">{cart.length}</span>}
              </button>
            </div>

            {!isCheckout ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[40px] border border-gray-100 group transition-all hover:shadow-xl hover:scale-[1.02]">
                    <div className="relative mb-4 overflow-hidden rounded-[28px]">
                      <img src={p.image} className="w-full h-40 object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-gray-800">★ {p.rating}</div>
                    </div>
                    <p className="text-xs font-black text-gray-800 mb-1 px-2 truncate">{p.name}</p>
                    <div className="flex justify-between items-center px-2">
                      <span className="font-black text-pink-600 text-sm">${p.price}</span>
                      <button onClick={() => addToCart(p)} className="bg-gray-100 text-gray-800 w-10 h-10 rounded-2xl flex items-center justify-center font-black hover:bg-pink-500 hover:text-white transition-all">+</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-8">
                <button onClick={() => setIsCheckout(false)} className="text-[10px] font-black text-pink-500 tracking-[0.2em] flex items-center gap-2">
                  <span className="text-xl">←</span> BACK TO LAB
                </button>
                <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-gray-50 space-y-6">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-gray-300 font-black text-xs uppercase tracking-widest">Cart Empty</div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl">
                            <div className="flex items-center gap-4">
                              <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                              <div>
                                <p className="text-xs font-black text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">QTY {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-black text-pink-500 text-xs">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-900 text-white p-8 rounded-[40px] space-y-4 shadow-2xl">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                          <span>Subtotal</span>
                          <span>${totalCart}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                          <span className="text-sm font-black uppercase tracking-[0.2em]">Total</span>
                          <span className="text-3xl font-black text-pink-400">${totalCart}</span>
                        </div>
                        <button onClick={() => { alert('Success! Your skin will thank you.'); setCart([]); setIsCheckout(false); }} className="w-full bg-pink-500 py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-900/40 active:scale-95 transition-all">
                          AUTHORIZE PAYMENT
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-280px)] flex flex-col bg-gray-50 rounded-[48px] overflow-hidden border border-gray-100 shadow-inner animate-in fade-in">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
              {chatMessages.length === 0 && (
                <div className="text-center space-y-6 mt-20 opacity-40">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">🤖</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-800">LumeBot Engine Online</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[32px] text-sm leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none shadow-pink-100' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white border-t border-gray-100 flex gap-3">
              <input 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Message LumeBot..."
                className="flex-1 border-none bg-gray-100 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-pink-400 transition-all"
              />
              <button onClick={handleChat} className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all">
                🚀
              </button>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            {!selectedDoctor ? (
              <>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Choose Specialist</h3>
                <div className="space-y-4">
                  {DOCTORS.map(doc => (
                    <div key={doc.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:border-pink-300 transition-all active:scale-[0.98]" onClick={() => setSelectedDoctor(doc)}>
                      <div className="relative">
                        <img src={doc.image} className="w-20 h-20 rounded-3xl object-cover shadow-lg" />
                        <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-4 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-gray-800 uppercase tracking-tighter">{doc.name}</p>
                        <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mt-1">{doc.specialty}</p>
                        <div className="flex gap-1 mt-3">
                          {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-[8px]">★</span>)}
                        </div>
                      </div>
                      <span className="text-gray-200 text-2xl font-black">›</span>
                    </div>
                  ))}
                </div>
              </>
            ) : !bookingConfirmed ? (
              <div className="bg-white space-y-8 animate-in slide-in-from-right-8">
                <button onClick={() => setSelectedDoctor(null)} className="text-[10px] font-black text-pink-500 tracking-widest flex items-center gap-2 uppercase">
                  <span className="text-xl">←</span> RESELECT
                </button>
                <div className="bg-gray-50 p-6 rounded-[40px] flex items-center gap-5 border border-gray-100">
                  <img src={selectedDoctor.image} className="w-20 h-20 rounded-[28px] shadow-xl" />
                  <div>
                    <h3 className="font-black text-lg text-gray-800 uppercase tracking-tighter">{selectedDoctor.name}</h3>
                    <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em]">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Preferred Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[32px] border-none focus:ring-4 focus:ring-pink-100 font-black text-sm uppercase tracking-widest transition-all" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Available Slots</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDoctor.availability.map(time => (
                      <button 
                        key={time}
                        onClick={() => setBookingTime(time)}
                        className={`py-5 rounded-3xl text-[10px] font-black transition-all border-2 ${bookingTime === time ? 'bg-pink-500 border-pink-500 text-white shadow-2xl shadow-pink-200' : 'border-gray-50 bg-gray-50 text-gray-400 hover:bg-white hover:border-pink-100'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={!bookingDate || !bookingTime}
                  onClick={handleBooking}
                  className="w-full bg-gray-900 disabled:bg-gray-100 text-white py-6 rounded-[40px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all mt-4"
                >
                  Confirm Booking
                </button>
              </div>
            ) : (
              <div className="text-center bg-pink-50 p-12 rounded-[64px] animate-in zoom-in-95">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-xl animate-bounce">✨</div>
                <h3 className="text-3xl font-black text-gray-800 mb-3 tracking-tighter">Success!</h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-loose px-4">Your appointment with {selectedDoctor.name} is scheduled and logged.</p>
                <button 
                  onClick={() => { setBookingConfirmed(false); setSelectedDoctor(null); setActiveTab('home'); }}
                  className="mt-10 bg-gray-900 text-white px-12 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl"
                >
                  Return
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-50 flex justify-around px-2 pb-10 pt-4 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.03)] z-20">
        <NavItem icon="🏠" label="Home" id="home" />
        <NavItem icon="🔬" label="Scan" id="analysis" />
        <NavItem icon="🛍️" label="Shop" id="shop" />
        <NavItem icon="📅" label="Clinics" id="booking" />
        <NavItem icon="🤖" label="Bot" id="chat" />
      </nav>
    </div>
  );
};

export default PatientDashboard;
