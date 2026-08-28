import React, { useState } from 'react';
import { Factory, Lock, Mail, User, Shield, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register({ name, email, password, role });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-600 rounded-xl shadow-md text-white mb-1">
          <Factory className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Your Account</h2>
        <p className="text-xs text-slate-500">Join the Industrial Carbon Emission Prediction Platform</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-700 font-semibold block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prakhar Kashyap"
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </div>
        </div>

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

        <div className="space-y-1">
          <label className="text-slate-700 font-semibold block">Primary Role</label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none appearance-none"
            >
              <option value="OPERATOR">Plant Operator</option>
              <option value="ANALYST">Senior Carbon Analyst</option>
              <option value="PLANT_MANAGER">Plant Manager</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating Account...' : 'Sign Up & Get Started'}</span>
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
