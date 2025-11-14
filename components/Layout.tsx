
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import SliderMenu from './SliderMenu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSliderOpen, setSliderOpen] = useState(false);

  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSliderOpen]);

  const toggleSlider = () => {
    setSliderOpen(!isSliderOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Header onMenuClick={toggleSlider} />
      <SliderMenu isOpen={isSliderOpen} onClose={() => setSliderOpen(false)} />
      <main className="pt-[60px] pb-[80px] overflow-y-auto">
        <div className="p-4">
            {children}
        </div>
        <div className="h-10"></div> {/* Bottom padding */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
