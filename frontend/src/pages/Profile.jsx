import React from 'react';
import { User, Shield, Mail, Factory, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <div className="p-4 bg-cyan-950 text-cyan-400 rounded-2xl border border-cyan-800/80 font-extrabold text-xl font-mono">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{user.name}</h1>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Assigned System Role
            </span>
            <div className="text-base font-extrabold text-cyan-300 font-mono">{user.role}</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block flex items-center">
              <Factory className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Authorized Plant Scope
            </span>
            <div className="text-base font-extrabold text-slate-200 font-mono">
              {user.plant_ids && user.plant_ids.length > 0 ? `Plant #${user.plant_ids.join(', #')}` : 'All Plants (Admin)'}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center space-x-1.5"
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
