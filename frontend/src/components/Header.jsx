import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Factory, Cpu, HelpCircle, Sliders, LayoutDashboard, Award, Users, User, LogOut, LineChart, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const { user, role, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 gap-3">
          <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-md shadow-cyan-600/20 text-white">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Industrial Carbon Emission System
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                AI-Powered Environmental & Emission Intelligence
              </p>
            </div>
          </Link>

          {isAuthenticated && (
            <nav className="flex flex-wrap items-center gap-1.5 pl-0 lg:pl-4 lg:border-l border-slate-200">
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
        </div>

        {/* User Profile & Auth Controls */}
        <div className="flex items-center space-x-3 self-end md:self-auto shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 hover:border-cyan-500 transition-colors font-mono shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-cyan-600" />
                <span>{user?.name}</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  AI Emission Engine
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
        </div>
      </div>
    </header>
  );
};

export default Header;
