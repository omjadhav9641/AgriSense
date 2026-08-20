import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayInput } from '../components/ClayInput';
import { PasswordInput } from '../components/PasswordInput';
import { ClayButton } from '../components/ClayButton';
import { Sprout, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login/', { username, password });
      login(res.data.access, res.data.refresh, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#2E6F40] mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <Sprout className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] tracking-tight">AgriSense</h1>
          <p className="text-sm font-semibold text-[#6C665D] mt-1">Precision Agriculture Intelligence Platform</p>
        </div>

        <ClayCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C2825] text-center mb-2">Welcome Back</h2>

            {error && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            <ClayInput
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <ClayButton
              type="submit"
              className="w-full mt-2 bg-[#2E6F40] hover:bg-[#1E5128]"
              disabled={loading}
              icon={<LogIn className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </ClayButton>

            <div className="text-center pt-2 text-xs text-[#6C665D]">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#2E6F40] hover:underline">
                Register as Farmer
              </Link>
            </div>
          </form>
        </ClayCard>
      </div>
    </div>
  );
};
