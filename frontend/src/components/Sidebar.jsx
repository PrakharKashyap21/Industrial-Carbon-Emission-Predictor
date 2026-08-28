import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  SlidersHorizontal,
  Zap,
  BarChart3,
  Lightbulb,
  Activity,
  FileSpreadsheet,
  Users,
  User,
  Factory,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const userRole = user?.role?.toUpperCase() || 'OPERATOR';

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PREDICT',
      items: [
        { label: 'CO₂ Prediction', path: '/prediction-test', icon: Cpu },
        { label: 'What-if Analysis', path: '/what-if', icon: SlidersHorizontal },
        { label: 'Optimization', path: '/optimization', icon: Zap },
      ],
    },
    {
      title: 'ANALYZE',
      items: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'ML Model Registry', path: '/model-insights', icon: Cpu },
        { label: 'SHAP Explainability', path: '/explain-prediction', icon: Lightbulb },
        { label: 'Monitoring', path: '/monitoring', icon: Activity },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'ADMIN',
      roles: ['ADMIN'],
      items: [
        { label: 'User Management', path: '/users', icon: Users },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-base">
                <Factory className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-bold text-white text-sm tracking-tight block">Carbon Intelligence</span>
                <span className="text-[10px] text-emerald-400 font-mono block">Industrial Emission AI</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Factory className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {sections.map((section, idx) => {
            if (section.roles && !section.roles.includes(userRole)) {
              return null;
            }

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {section.title}
                  </h4>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <NavLink
          to="/profile"
          className={`flex items-center gap-3 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.username || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded-xs uppercase">
                  {userRole}
                </span>
              </div>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
