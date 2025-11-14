
import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#1B2445] text-white flex items-center justify-between px-4 z-50 shadow-md">
      <button onClick={onMenuClick} className="p-2 hover:bg-[#2a3760] rounded-full transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
        Pacific Attires
      </h1>
      <div className="w-[45px]"></div>
    </header>
  );
};

export default Header;
