
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { db } from '../dbService';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || email.split('@')[0],
        role: selectedRole,
        email: email
      };
      db.addUser(newUser);
      onLogin(newUser);
    } else {
      // Find existing user or mock one for speed
      const users = db.getUsers();
      const existing = users.find(u => u.email === email);
      if (existing) {
        onLogin(existing);
      } else {
        // Fallback for easy testing: just log in with the entered details
        onLogin({
          id: 'temp-' + Date.now(),
          name: email.split('@')[0],
          role: selectedRole,
          email: email
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-baby-pink flex flex-col justify-center px-8 py-12 max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">Lume Skin</h1>
          <p className="text-gray-400 mt-1 text-sm">{isSignUp ? 'Create your medical account' : 'Welcome back to health'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-2xl border-none bg-gray-50 p-4 shadow-inner focus:ring-2 focus:ring-pink-400 transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-2xl border-none bg-gray-50 p-4 shadow-inner focus:ring-2 focus:ring-pink-400 transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-2xl border-none bg-gray-50 p-4 shadow-inner focus:ring-2 focus:ring-pink-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Access Role</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="mt-1 block w-full rounded-2xl border-none bg-gray-50 p-4 shadow-inner focus:ring-2 focus:ring-pink-400 appearance-none"
            >
              <option value={UserRole.PATIENT}>Patient</option>
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.STAFF}>Receptionist</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 transition-all active:scale-[0.98]"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-pink-500 hover:text-pink-700"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
