import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayInput } from '../components/ClayInput';
import { ClayButton } from '../components/ClayButton';
import { Sprout, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    state: 'Maharashtra',
    role: 'farmer',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register/', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.username?.[0] || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#4C7A45] mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <Sprout className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-[#2B2E28] tracking-tight">AgriSense</h1>
          <p className="text-sm font-semibold text-[#6B6F63] mt-1">Create Your Account</p>
        </div>

        <ClayCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <ClayInput
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <ClayInput
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <ClayInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <ClayInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <ClayInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <ClayInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-[#6B6F63] uppercase tracking-wider pl-1">
                  State / Region
                </label>
                <input
                  name="state"
                  className="clay-input"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <ClayButton
              type="submit"
              className="w-full mt-4"
              disabled={loading}
              icon={<UserPlus className="w-4 h-4" />}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </ClayButton>

            <div className="text-center pt-2 text-xs text-[#6B6F63]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#4C7A45] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </ClayCard>
      </div>
    </div>
  );
};
