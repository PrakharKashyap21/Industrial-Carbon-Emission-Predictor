import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Factory,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import { getHealthCheck } from '../services/api';

export const Header = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const { selectedPlantId, setSelectedPlantId, dateRange, setDateRange, plants } = useFilter();
  const navigate = useNavigate();
  const location = useLocation();

  const [healthStatus, setHealthStatus] = useState({ online: true, latency: 12 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const res = await getHealthCheck();
      if (isMounted) {
        if (res.success) {
          setHealthStatus({ online: true, latency: res.latency || 15 });
        } else {
          setHealthStatus({ online: false, latency: 0 });
        }
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/signup');
  };

  // Map route to title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Industrial Carbon Overview';
    if (path.startsWith('/prediction-test') || path.startsWith('/predictions')) return 'CO₂ Emission Prediction';
    if (path.startsWith('/explain-prediction') || path.startsWith('/model-insights')) return 'SHAP & Feature Contributions';
    if (path.startsWith('/what-if')) return 'What-If Scenario Simulation';
    if (path.startsWith('/optimization')) return 'Emission Optimization Engine';
    if (path.startsWith('/analytics')) return 'Industrial Analytics & Trends';
    if (path.startsWith('/monitoring')) return 'Model & Data Monitoring';
    if (path.startsWith('/reports')) return 'Carbon Intelligence Reports';
    if (path.startsWith('/users')) return 'User & RBAC Administration';
    if (path.startsWith('/profile')) return 'User Profile & Settings';
    return 'Industrial Carbon Emission System';
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile sidebar toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getPageTitle()}</span>
            </h1>
          </div>
        </div>

        {/* Center/Right: Global Filters & Controls */}
        <div className="flex items-center gap-3">
          {/* Plant Selector Filter */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Factory className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Authorized Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.plant_name} ({p.plant_code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>

          {/* System Health Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>AI Backend: <strong className="font-mono">{healthStatus.latency}ms</strong></span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 font-semibold text-slate-800 flex justify-between items-center">
                  <span>System Alerts</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Active</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Model Monitoring Healthy</p>
                      <p className="text-[11px] text-slate-500">Feature PSI values within normal range.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{user?.username || 'Operator'}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email || 'user@plant.com'}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-xs uppercase">
                    Role: {user?.role || 'OPERATOR'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
