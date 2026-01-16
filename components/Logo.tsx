
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dimensions = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-12' : 'h-8';
  return (
    <div className={`flex items-center gap-2 ${dimensions}`}>
      <div className="relative h-full aspect-square bg-pink-500 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600 to-transparent opacity-50"></div>
        <span className="text-white font-black text-sm relative z-10">L</span>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full opacity-30 blur-sm"></div>
      </div>
      <span className={`font-black tracking-tighter text-gray-800 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
        Lume<span className="text-pink-500">Skin</span>
      </span>
    </div>
  );
};

export default Logo;
