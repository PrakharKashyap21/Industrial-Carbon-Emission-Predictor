import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { FilterProvider } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';

export const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const publicPaths = ['/login', '/signup', '/access-denied'];
  const isPublicPage = publicPaths.includes(location.pathname) || !user;

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scrolling when mobile navigation drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        {children}
      </div>
    );
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  return (
    <FilterProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        {/* Sidebar (Renders desktop column & mobile overlay drawer) */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={closeMobileDrawer}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Header */}
          <Header onSidebarToggle={toggleSidebar} />

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto box-border">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="font-semibold text-slate-700">Industrial Carbon Emission Intelligence</span>
                <span>&copy; {new Date().getFullYear()}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
                <span className="hover:text-slate-600 transition-colors">Phase 17 UI Architecture</span>
                <span>&bull;</span>
                <span className="font-mono text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ensemble ML v1.4
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </FilterProvider>
  );
};

export default MainLayout;

