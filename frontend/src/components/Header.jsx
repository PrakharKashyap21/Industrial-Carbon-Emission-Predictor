import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Factory, Cpu, HelpCircle, Sliders, LayoutDashboard, Award, Users, User, LogOut, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-md shadow-cyan-600/20 text-white">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Industrial Carbon System
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Environmental & Emission Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-200">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
              Dashboard
            </Link>

            <Link
              to="/prediction-test"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                location.pathname === '/prediction-test'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 mr-1" />
              Predictions
            </Link>

            {role !== 'OPERATOR' && (
              <>
                <Link
                  to="/explain-prediction"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                    location.pathname === '/explain-prediction'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1" />
                  SHAP
                </Link>

                <Link
                  to="/what-if"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                    location.pathname === '/what-if'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  What-if
                </Link>

                <Link
                  to="/optimization"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                    location.pathname === '/optimization'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  Optimization
                </Link>

                <Link
                  to="/analytics"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                    location.pathname === '/analytics'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  Analytics
                </Link>
              </>
            )}

            <Link
              to="/monitoring"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                location.pathname === '/monitoring'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 mr-1" />
              Monitoring
            </Link>

            <Link
              to="/reports"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                location.pathname === '/reports' || location.pathname.startsWith('/reports/')
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-cyan-600" />
              Reports
            </Link>

            {role === 'ADMIN' && (
              <Link
                to="/users"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                  location.pathname === '/users'
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                Users
              </Link>
            )}
          </nav>
        )}

        {/* Desktop Profile & Hamburger Toggle */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 hover:border-cyan-500 transition-colors font-mono shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-cyan-600" />
                <span className="max-w-[100px] truncate">{user?.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  AI Engine
                </span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          {isAuthenticated && (
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2 text-cyan-600" />
              Dashboard
            </Link>

            <Link
              to="/prediction-test"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                location.pathname === '/prediction-test'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4 mr-2 text-cyan-600" />
              Predictions
            </Link>

            {role !== 'OPERATOR' && (
              <>
                <Link
                  to="/explain-prediction"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                    location.pathname === '/explain-prediction'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  SHAP Driver
                </Link>

                <Link
                  to="/what-if"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                    location.pathname === '/what-if'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sliders className="w-4 h-4 mr-2 text-cyan-600" />
                  What-if
                </Link>

                <Link
                  to="/optimization"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                    location.pathname === '/optimization'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Award className="w-4 h-4 mr-2 text-cyan-600" />
                  Optimization
                </Link>

                <Link
                  to="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                    location.pathname === '/analytics'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2 text-cyan-600" />
                  Analytics
                </Link>
              </>
            )}

            <Link
              to="/monitoring"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                location.pathname === '/monitoring'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Activity className="w-4 h-4 mr-2 text-cyan-600" />
              Monitoring
            </Link>

            <Link
              to="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center ${
                location.pathname === '/reports'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-2 text-cyan-600" />
              Reports
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-800"
            >
              <User className="w-4 h-4 text-cyan-600" />
              <span>{user?.name}</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
