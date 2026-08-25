import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccessDenied = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-md text-center space-y-4">
        <div className="inline-flex p-4 bg-rose-950/80 text-rose-400 rounded-2xl border border-rose-800">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-white">403 — Access Authorization Denied</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your current user role does not possess authorization permissions for this restricted resource. Please contact your system administrator.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Industrial Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
