import React, { useState } from 'react';
import { Factory, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const fillQuickUser = (eMail, pw) => {
    setEmail(eMail);
    setPassword(pw);
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-600 rounded-xl shadow-md text-white mb-1">
          <Factory className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to Carbon Intelligence</h2>
        <p className="text-xs text-slate-500">Multi-User Authentication & Role-Based Access</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-700 font-semibold block">Work Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@plant.com"
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 font-semibold block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In to Industrial Platform'}</span>
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
          Create an account (Sign Up)
        </Link>
      </div>

      {/* Quick Demo Credentials */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">Quick Demo Credentials:</span>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <button
            onClick={() => fillQuickUser('admin@plant.com', 'admin123')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-emerald-700 font-bold text-left cursor-pointer"
          >
            Admin (Full Access)
          </button>
          <button
            onClick={() => fillQuickUser('manager@plant.com', 'manager123')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-teal-700 font-bold text-left cursor-pointer"
          >
            Plant Manager
          </button>
          <button
            onClick={() => fillQuickUser('analyst@plant.com', 'analyst123')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-amber-700 font-bold text-left cursor-pointer"
          >
            Senior Analyst
          </button>
          <button
            onClick={() => fillQuickUser('operator@plant.com', 'operator123')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-bold text-left cursor-pointer"
          >
            Plant Operator
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
