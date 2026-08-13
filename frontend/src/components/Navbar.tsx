import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  LayoutDashboard,
  Map,
  ShoppingBag,
  Landmark,
  ShieldAlert,
  Bell,
  LogOut,
  Menu,
  X,
  Store,
  Activity,
  User as UserIcon,
  ChevronDown,
  ShoppingBasket,
  FileText
} from 'lucide-react';
import { ClayButton } from './ClayButton';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farms', label: 'Land & Soil', icon: Map },
    { path: '/quick-recommendation', label: 'Quick AI', icon: Sprout },
    { path: '/disease-detection', label: 'Disease AI', icon: Activity },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/store', label: 'Agri Store', icon: ShoppingBag },
    { path: '/schemes', label: 'Gov Schemes', icon: Landmark },
  ];

  if (user?.role === 'admin' || user?.role === 'manager') {
    navLinks.push({ path: '/admin-panel', label: 'Admin Control', icon: ShieldAlert });
  }

  const roleColorMap: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-300',
    manager: 'bg-blue-100 text-blue-800 border-blue-300',
    agronomist: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    farmer: 'bg-amber-100 text-amber-900 border-amber-300',
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8] px-3 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-[#2E6F40] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-[#2C2825] tracking-tight">AgriSense</span>
            <span className="block text-[9px] uppercase tracking-widest text-[#2E6F40] font-extrabold">Precision Ag</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#EBE7DF] p-1.5 rounded-2xl border border-[#E5E0D8] overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#2E6F40] shadow-xs'
                    : 'text-[#6C665D] hover:text-[#2C2825] hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-2xl bg-[#FAF8F5] text-[#6C665D] hover:text-[#2C2825] border border-[#E5E0D8] shadow-xs relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C86D3B] rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 clay-card p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] mb-3">
                  <h4 className="text-sm font-bold text-[#2C2825]">Notifications</h4>
                  <span className="text-[10px] font-bold uppercase bg-[#E8F5E9] text-[#2E6F40] px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#2C2825]">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                    <div className="font-bold text-[#2E6F40]">Order Placed Successfully</div>
                    <div className="text-[11px] text-[#6C665D]">Order #AGR-8A2F1C confirmed.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                    <div className="font-bold text-[#C86D3B]">Weather Alert: High Rain</div>
                    <div className="text-[11px] text-[#6C665D]">Heavy precipitation forecast in your parcel zone.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Dropdown */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:bg-[#EBE7DF] transition-all shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#2E6F40] text-white flex items-center justify-center text-xs font-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-[#2C2825] leading-tight">{user.username}</span>
                  <span
                    className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border leading-tight ${
                      roleColorMap[user.role] || 'bg-gray-100'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6C665D]" />
              </button>

              {/* Profile Popover Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 clay-card p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2E6F40] text-white flex items-center justify-center text-base font-black">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-extrabold text-[#2C2825] truncate">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                      </div>
                      <div className="text-[11px] text-[#6C665D] truncate">{user.email || `@${user.username}`}</div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#2C2825] hover:bg-[#E8F5E9] hover:text-[#2E6F40] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#2E6F40]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/farms"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#2C2825] hover:bg-[#FAF8F5] transition-colors"
                    >
                      <Map className="w-4 h-4 text-[#C86D3B]" />
                      <span>My Land Parcels</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#2C2825] hover:bg-[#FAF8F5] transition-colors"
                    >
                      <ShoppingBasket className="w-4 h-4 text-[#D99B26]" />
                      <span>My Orders</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-2xl bg-[#FAF8F5] text-[#6C665D] hover:text-[#2C2825] border border-[#E5E0D8] shadow-xs"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-4 bg-white rounded-2xl border border-[#E5E0D8] shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#E8F5E9] text-[#2E6F40]' : 'bg-[#FAF8F5] text-[#2C2825] hover:bg-[#EBE7DF]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#2E6F40]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2E6F40] underline flex items-center gap-1"
              >
                <UserIcon className="w-3.5 h-3.5" /> My Profile ({user.username})
              </Link>
              <ClayButton
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Logout
              </ClayButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
