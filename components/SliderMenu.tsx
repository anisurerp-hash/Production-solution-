
import React from 'react';
import { useAppContext } from '../App';
import { signOutUser } from '../services/firebaseService';
import { Page } from '../types';

interface SliderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconClass = "h-6 w-6 text-[#1B2445]";

const icons = {
    cutting: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>,
    sewing: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 7.5L12 4 8.5 7.5M12 4v16m-4-6a4 4 0 014-4h0a4 4 0 014 4v0" /></svg>,
    finishing: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    target: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S3.732 16.057 2.458 12z" /></svg>,
    efficiency: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 14v-1m0 1v.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    circleTime: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    smv: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    capacity: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
    manpower: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    fiveS: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    sharpTools: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
};


const SliderMenu: React.FC<SliderMenuProps> = ({ isOpen, onClose }) => {
  const { user, navigate } = useAppContext();

  const handleLogout = async () => {
    onClose();
    await signOutUser();
    navigate(Page.Login);
  };

  const menuItems = [
    // Production Related
    { icon: icons.cutting, text: 'Cutting', page: null },
    { icon: icons.sewing, text: 'Sewing', page: null },
    { icon: icons.finishing, text: 'Finishing', page: null },
    // Target & Efficiency
    { icon: icons.target, text: 'Target', page: null },
    { icon: icons.efficiency, text: 'Efficiency', page: null },
    { icon: icons.circleTime, text: 'Circle Time', page: null },
    // Technical Parameters
    { icon: icons.smv, text: 'SMV', page: null },
    { icon: icons.capacity, text: 'Capacity', page: null },
    { icon: icons.manpower, text: 'Manpower', page: null },
    // System Management
    { icon: icons.fiveS, text: '5S', page: null },
    { icon: icons.sharpTools, text: 'Sharp Tools', page: null },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full bg-white w-[250px] max-w-[85%] z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Slider Header */}
          <div className="h-[60px] bg-[#1B2445] flex items-center px-4 text-white flex-shrink-0">
            <button onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 flex flex-col items-center text-center flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
               {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
               ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
               )}
            </div>
            <h3 className="font-bold text-lg text-gray-800">{user?.fullName || 'Guest User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'no-email@example.com'}</p>
            <p className="text-sm text-gray-500">{user?.phone || 'No phone number'}</p>
          </div>

          <div className="border-t border-gray-200 mx-4 flex-shrink-0"></div>
          
          {/* Menu Items */}
          <nav className="flex-grow overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1B2445 #f1f1f1' }}>
            <ul className="py-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="flex items-center gap-4 px-6 py-3 text-[#1B2445] hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
            {/* Logout Button */}
            <div className="flex-shrink-0 border-t border-gray-200">
                <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 text-[#e74c3c] w-full text-left hover:bg-gray-100 transition-colors"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default SliderMenu;
