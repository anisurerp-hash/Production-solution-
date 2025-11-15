import React from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';

interface FooterButtonProps {
    targetPage: Page;
    // FIX: Changed JSX.Element to React.ReactNode to fix "Cannot find namespace 'JSX'" error.
    icon: React.ReactNode;
}

const Footer: React.FC = () => {
    const { navigate, currentPage } = useAppContext();

    const FooterButton: React.FC<FooterButtonProps> = ({ targetPage, icon }) => {
        const isActive = currentPage === targetPage;
        return (
            <button
                onClick={() => navigate(targetPage)}
                className={`flex flex-col items-center justify-center w-16 h-16 transition-transform transform hover:scale-110`}
                aria-label={Page[targetPage]}
            >
                <div className={`w-[45px] h-[45px] rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-gray-300' : 'bg-white'}`}>
                    <div className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#1B2445]'}`}>
                        {icon}
                    </div>
                </div>
            </button>
        );
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-[60px] bg-[#1B2445] flex items-center justify-around z-50 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
            <FooterButton
                targetPage={Page.Home}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                }
            />
            <FooterButton
                targetPage={Page.Calculator}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-4 14h-2v-2h2v2zm0-4h-2v-2h2v2zm-4 4H9v-2h2v2zm0-4H9v-2h2v2zm4-4h-2V9h2v2zm-4 0H9V9h2v2zm4-4h-2V5h2v2zm-4 0H9V5h2v2z"/>
                    </svg>
                }
            />
            <FooterButton
                targetPage={Page.Settings}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                    </svg>
                }
            />
            <FooterButton
                targetPage={Page.Messages}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                }
            />
            <FooterButton
                targetPage={Page.Contacts}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.02.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                }
            />
        </footer>
    );
};

export default Footer;