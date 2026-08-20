import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import { User as UserIcon, Mail, Phone, MapPin, Shield, Check, AlertCircle, Sprout, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, login, token } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || '',
    address: user?.address || '',
    avatar_url: user?.avatar_url || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Query user's land parcels for stats
  const { data: lands = [] } = useQuery({
    queryKey: ['profile_lands'],
    queryFn: async () => {
      const res = await apiClient.get('/farms/lands/');
      return res.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await apiClient.patch('/auth/me/', formData);
      if (token) {
        login(token, localStorage.getItem('agrisense_refresh_token') || '', res.data);
      }
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#2E6F40]">
          <UserIcon className="w-4 h-4 text-[#2E6F40]" /> User Account Management
        </div>
        <h1 className="text-3xl font-black text-[#2C2825] mt-1">My Farmer Profile</h1>
        <p className="text-sm font-semibold text-[#6C665D]">
          Manage your personal information, contact details, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <ClayCard className="p-6 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-[#E8F5E9] text-[#2E6F40] mx-auto flex items-center justify-center font-black text-3xl border-4 border-white shadow-md overflow-hidden relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className={user.avatar_url ? 'hidden' : 'block'}>
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#2C2825]">
                {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </h2>
              <p className="text-xs font-semibold text-[#6C665D]">@{user.username}</p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#2E6F40]">
                Role: {user.role}
              </span>
            </div>

            <div className="pt-4 border-t border-[#E5E0D8] space-y-2 text-left text-xs font-medium text-[#6C665D]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C86D3B]" />
                <span className="truncate">{user.email || 'No email specified'}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C86D3B]" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.state && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C86D3B]" />
                  <span>{user.state}</span>
                </div>
              )}
            </div>
          </ClayCard>

          {/* Quick Stats Card */}
          <ClayCard className="p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-[#2C2825] border-b border-[#E5E0D8] pb-2">
              Account Highlights
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
                <Sprout className="w-5 h-5 text-[#2E6F40] mx-auto mb-1" />
                <span className="text-xl font-black text-[#2C2825] block">{lands.length}</span>
                <span className="text-[10px] font-bold text-[#6C665D] uppercase">Registered Parcels</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
                <FileText className="w-5 h-5 text-[#C86D3B] mx-auto mb-1" />
                <span className="text-xl font-black text-[#2C2825] block">
                  {lands.reduce((acc: number, l: any) => acc + (l.latest_soil_data ? 1 : 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-[#6C665D] uppercase">Soil Reports</span>
              </div>
            </div>

            <Link to="/farms" className="block pt-2">
              <ClayButton variant="outline" size="sm" className="w-full">
                Manage Land Parcels
              </ClayButton>
            </Link>
          </ClayCard>
        </div>

        {/* Right Column: Edit Profile Form */}
        <ClayCard className="lg:col-span-2 p-8">
          <h2 className="text-lg font-bold text-[#2C2825] border-b border-[#E5E0D8] pb-3 mb-6">
            Edit Personal Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#2E6F40]/30 text-[#2E6F40] text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClayInput
                label="First Name"
                placeholder="e.g. Om"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />

              <ClayInput
                label="Last Name"
                placeholder="e.g. Patel"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClayInput
                label="Email Address"
                type="email"
                placeholder="farmer@agrisense.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <ClayInput
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClayInput
                label="State / Region"
                placeholder="e.g. Punjab"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />

              <ClayInput
                label="Farm / Residential Address"
                placeholder="e.g. Village Ludhiana Sector 4"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <ClayInput
              label="Profile Picture URL"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              helperText="Enter a direct image link for your farmer avatar photo"
            />

            <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-end">
              <ClayButton
                type="submit"
                className="bg-[#2E6F40] hover:bg-[#1E5128] px-8"
                disabled={saving}
              >
                {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </ClayButton>
            </div>
          </form>
        </ClayCard>
      </div>
    </div>
  );
};
