
import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1B2445] text-white">
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Production Solution</h1>
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mb-8 text-sm">Powered by SewTech</p>
    </div>
  );
};

export default LoadingPage;
