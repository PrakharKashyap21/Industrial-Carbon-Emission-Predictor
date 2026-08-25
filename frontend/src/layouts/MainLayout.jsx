import React from 'react';
import Header from '../components/Header';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Industrial Carbon Emission Prediction System &copy; {new Date().getFullYear()}</span>
          <span className="font-mono text-slate-500">AI-Powered Environmental & Emission Intelligence</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
