import React, { useState } from 'react';
import { Factory, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white mb-2">
          <Factory className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Industrial Carbon Intelligence</h2>
        <p className="text-xs text-slate-400">Multi-User Authentication & Role-Based Access Control</p>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-3 text-xs text-rose-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Work Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@plant.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In to Industrial Platform'}</span>
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">Quick Demo Credentials:</span>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <button
            onClick={() => fillQuickUser('admin@plant.com', 'admin123')}
            className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-cyan-400 font-bold text-left"
          >
            Admin (Full Access)
          </button>
          <button
            onClick={() => fillQuickUser('manager@plant.com', 'manager123')}
            className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-emerald-400 font-bold text-left"
          >
            Plant Manager
          </button>
          <button
            onClick={() => fillQuickUser('analyst@plant.com', 'analyst123')}
            className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-amber-400 font-bold text-left"
          >
            Senior Analyst
          </button>
          <button
            onClick={() => fillQuickUser('operator@plant.com', 'operator123')}
            className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 font-bold text-left"
          >
            Plant Operator
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
