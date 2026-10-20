import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { AlertOctagon, LogIn, ShieldAlert, Sparkles, UserCheck, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome to X-Pired!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      await login(demoEmail, 'password123');
      showToast('Logged in successfully via demo account!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 mb-3">
            <AlertOctagon className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            X-Pired
          </h1>
          <p className="text-xs text-rose-600 font-extrabold uppercase tracking-widest mt-0.5">
            Time’s Up. Toss It Out
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Proactive Expiry Tracking & Waste Prevention System
          </p>
        </div>

        {/* Demo Fast Login Buttons (For Evaluation & Demo) */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
            🚀 1-Click Demo Evaluation Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('owner@xpired.com')}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Store Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('staff@xpired.com')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Store Staff</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Owner: Rohit Chauhan • Staff: Atharva Chavan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. owner@xpired.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need a new store account?{' '}
          <Link to="/register" className="font-bold text-rose-600 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
