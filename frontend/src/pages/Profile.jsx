import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Mail, Factory, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signup');
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-xl font-extrabold text-xl flex items-center justify-center shadow-xs">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Assigned System Role
            </span>
            <div className="text-sm font-bold text-slate-800 font-mono">{user.role}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center">
              <Factory className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Authorized Plant Scope
            </span>
            <div className="text-sm font-bold text-slate-800 font-mono">
              {user.plant_ids && user.plant_ids.length > 0 ? `Plant #${user.plant_ids.join(', #')}` : 'All Plants (Admin)'}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
