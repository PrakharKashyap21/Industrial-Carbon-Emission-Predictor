import React from 'react';
import { Users, Shield, CheckCircle2, XCircle } from 'lucide-react';

export const UserTable = ({ users, onToggleStatus }) => {
  if (!users || users.length === 0) return null;

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">ADMIN</span>;
      case 'PLANT_MANAGER':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">PLANT MANAGER</span>;
      case 'ANALYST':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">ANALYST</span>;
      case 'OPERATOR':
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">OPERATOR</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-cyan-400" />
            System User Directory & Role-Based Access Audit
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Admin directory listing user accounts, assigned roles, plant authorization, and active status.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950/50">
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Assigned Plants</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-400">#{u.id}</td>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">{u.name}</td>
                <td className="py-3 px-4 text-slate-300">{u.email}</td>
                <td className="py-3 px-4 font-sans">{getRoleBadge(u.role)}</td>
                <td className="py-3 px-4 text-slate-400">
                  {u.plant_ids && u.plant_ids.length > 0 ? `Plant #${u.plant_ids.join(', #')}` : 'All Plants (Admin)'}
                </td>
                <td className="py-3 px-4 font-sans">
                  {u.is_active ? (
                    <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-rose-400 font-bold text-[11px]">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivated
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-sans">
                  <button
                    onClick={() => onToggleStatus(u.id, !u.is_active)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      u.is_active ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                    }`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
