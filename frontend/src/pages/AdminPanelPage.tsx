import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  Download,
  RotateCcw,
  PlusCircle,
  UserCheck,
  UserX,
  FileSpreadsheet,
  TrendingUp,
  Users,
  AlertTriangle,
  IndianRupee,
  Activity,
  Store,
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Sprout,
  Shield,
  Layers,
  PackagePlus,
  Edit,
} from 'lucide-react';
import { getCleanImageUrl, getFallbackImage } from '../utils/imageUtils';

export const AdminPanelPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'marketplace' | 'inventory' | 'audit'>('analytics');
  
  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  
  // Adjust Stock & Edit Product Modal State
  const [adjustStockItem, setAdjustStockItem] = useState<{ id: number; name: string; stock: number } | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fertilizers',
    price_per_unit: 500,
    unit: 'kg',
    stock: 50,
    reorder_level: 15,
    description: '',
    image_url: '',
  });

  // Add Produce Listing Modal State
  const [showAddProduceModal, setShowAddProduceModal] = useState(false);
  const [newProduce, setNewProduce] = useState({
    title: '',
    crop_name: 'Wheat',
    quantity: 50,
    unit: 'Quintals',
    price_per_unit: 2200,
    location: 'Lasalgaon, Nashik, Maharashtra',
    description: '',
  });

  // 1. Fetch Analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin_analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-panel/analytics/');
      return res.data;
    },
  });

  // 2. Fetch Users List
  const { data: users = [] } = useQuery({
    queryKey: ['admin_users_list'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-panel/users/');
      return res.data;
    },
  });

  // 3. Fetch Marketplace Listings
  const { data: marketplaceListings = [] } = useQuery({
    queryKey: ['admin_marketplace'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-panel/marketplace/');
      return res.data;
    },
  });

  // 4. Fetch Inventory Oversight
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['admin_inventory'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-panel/inventory/');
      return res.data;
    },
  });

  // 5. Fetch Audit Trail Logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin_audit_logs', auditFilter],
    queryFn: async () => {
      const res = await apiClient.get(`/admin-panel/audit-logs/?action=${auditFilter}`);
      return res.data;
    },
  });

  // 6. Fetch Soft Deleted Items
  const { data: softDeletedItems = [] } = useQuery({
    queryKey: ['admin_soft_deleted'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-panel/soft-deleted/');
      return res.data;
    },
  });

  // 7. Fetch Selected Farmer Detail Modal
  const { data: farmerDetail } = useQuery({
    queryKey: ['admin_farmer_detail', selectedFarmer?.id],
    queryFn: async () => {
      if (!selectedFarmer?.id) return null;
      const res = await apiClient.get(`/admin-panel/users/${selectedFarmer.id}/`);
      return res.data;
    },
    enabled: !!selectedFarmer?.id,
  });

  // Mutations
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiClient.post('/admin-panel/promote-demote/', { user_id: userId, role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users_list'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ user_id, is_active }: { user_id: number; is_active: boolean }) => {
      const res = await apiClient.post('/admin-panel/toggle-user-status/', { user_id, is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users_list'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      const cleaned = {
        ...payload,
        image_url: getCleanImageUrl(payload.image_url, payload.name || payload.category),
      };
      const res = await apiClient.post('/admin-panel/inventory/', { action: 'create', ...cleaned });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
      setShowAddProductModal(false);
      setNewProduct({
        name: '',
        category: 'Fertilizers',
        price_per_unit: 500,
        unit: 'kg',
        stock: 50,
        reorder_level: 15,
        description: '',
        image_url: '',
      });
    },
  });

  const createProduceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const cleaned = {
        ...payload,
        image_url: getCleanImageUrl(payload.image_url, payload.crop_name || payload.title),
      };
      const res = await apiClient.post('/admin-panel/marketplace/', { action: 'create', ...cleaned });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
      setShowAddProduceModal(false);
      setNewProduce({
        title: '',
        crop_name: 'Wheat',
        quantity: 50,
        unit: 'Quintals',
        price_per_unit: 2200,
        location: 'Ludhiana, Punjab',
        description: '',
      });
    },
  });

  const moderateMarketplaceMutation = useMutation({
    mutationFn: async ({ listing_id, action }: { listing_id: number; action: string }) => {
      const res = await apiClient.post('/admin-panel/marketplace/', { listing_id, action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.image_url) {
        payload.image_url = getCleanImageUrl(payload.image_url, payload.name || payload.category);
      }
      const res = await apiClient.post('/admin-panel/inventory/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
      setAdjustStockItem(null);
      setEditingProduct(null);
    },
  });

  const softDeleteRestoreMutation = useMutation({
    mutationFn: async ({ entity_type, entity_id, action }: { entity_type: string; entity_id: number; action: string }) => {
      const res = await apiClient.post('/admin-panel/manage-soft-delete/', { entity_type, entity_id, action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_soft_deleted'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin_users_list'] });
      queryClient.invalidateQueries({ queryKey: ['admin_marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_logs'] });
    },
  });

  const handleExportCSV = async (entity: string) => {
    try {
      const response = await apiClient.get(`/admin-panel/export/${entity}/`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgriSense_${entity}_Export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const COLORS = ['#2E6F40', '#C86D3B', '#D99B26', '#2563EB', '#8B5CF6'];

  const filteredUsers = users.filter((u: any) =>
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.state?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#2E6F40]">
            <ShieldAlert className="w-4 h-4 text-[#2E6F40]" /> Governance & Control Portal
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] mt-1">Admin Control Center</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Manage RBAC roles, farmer accounts, produce moderation, inventory stock, audit trails, and recovery.
          </p>
        </div>

        {/* CSV Export Quick Action */}
        <div className="flex flex-wrap gap-2">
          <ClayButton size="sm" variant="outline" icon={<FileSpreadsheet className="w-4 h-4 text-[#2E6F40]" />} onClick={() => handleExportCSV('farmers')}>
            Export Farmers CSV
          </ClayButton>
          <ClayButton size="sm" variant="outline" icon={<FileSpreadsheet className="w-4 h-4 text-[#C86D3B]" />} onClick={() => handleExportCSV('orders')}>
            Export Orders CSV
          </ClayButton>
          <ClayButton size="sm" variant="outline" icon={<FileSpreadsheet className="w-4 h-4 text-[#D99B26]" />} onClick={() => handleExportCSV('products')}>
            Export Products CSV
          </ClayButton>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-[#E5E0D8] pb-2 overflow-x-auto">
        {[
          { key: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
          { key: 'users', label: 'Farmers & RBAC', icon: Users },
          { key: 'marketplace', label: 'Marketplace Moderation', icon: Store },
          { key: 'inventory', label: 'E-Store Oversight', icon: ShoppingBag },
          { key: 'audit', label: 'Audit Trail & Recovery', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#2E6F40] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6C665D] hover:bg-[#EBE7DF] hover:text-[#2C2825]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ClayCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E6F40] flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#6C665D] uppercase">Active Farmers</span>
                <h3 className="text-2xl font-black text-[#2C2825]">{analytics.active_farmers}</h3>
              </div>
            </ClayCard>

            <ClayCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2E6F40] flex items-center justify-center shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#6C665D] uppercase">E-Commerce Revenue</span>
                <h3 className="text-2xl font-black text-[#2C2825]">₹{analytics.total_revenue?.toFixed(2)}</h3>
              </div>
            </ClayCard>

            <ClayCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#6C665D] uppercase">Total Registered Parcels</span>
                <h3 className="text-2xl font-black text-[#2C2825]">{analytics.total_parcels}</h3>
              </div>
            </ClayCard>

            <ClayCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#D99B26] flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#6C665D] uppercase">Disease Scans (30 Days)</span>
                <h3 className="text-2xl font-black text-[#2C2825]">{analytics.disease_diagnoses_count}</h3>
              </div>
            </ClayCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClayCard className="p-6">
              <h3 className="text-sm font-bold text-[#2C2825] mb-4 flex items-center justify-between">
                <span>Orders Distribution by Status</span>
                <span className="text-xs font-semibold text-[#6C665D]">E-Commerce Sales</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.orders_by_status}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2E6F40" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>

            <ClayCard className="p-6 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-[#2C2825] mb-4 flex items-center justify-between">
                <span>Top Catalog & Produce Crop Distribution</span>
                <span className="text-xs font-semibold text-[#6C665D]">Listings Share</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.top_crops} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.top_crops?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>
          </div>

          <ClayCard className="p-6">
            <h3 className="text-sm font-bold text-[#2C2825] mb-4">Soil Quality Distribution across Registered Parcels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analytics.soil_health_distribution?.map((soilCat: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-center">
                  <span className="text-xs font-extrabold text-[#6C665D] uppercase block mb-1">{soilCat.status}</span>
                  <span className="text-2xl font-black text-[#2E6F40]">{soilCat.count} Parcels</span>
                </div>
              ))}
            </div>
          </ClayCard>
        </div>
      )}

      {/* Tab 2: Farmers & RBAC User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <ClayCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[#2C2825]">Farmer Account Governance & RBAC</h3>
                <p className="text-xs font-semibold text-[#6C665D]">Manage user roles, verify account status, and inspect farmer land parcels.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#6C665D]" />
                <input
                  type="text"
                  placeholder="Search farmer or state..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="clay-input pl-9 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#2C2825] font-bold border-b border-[#E5E0D8]">
                    <th className="p-3">User Details</th>
                    <th className="p-3">State / Phone</th>
                    <th className="p-3">Role (RBAC)</th>
                    <th className="p-3">Parcels / Orders</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="p-3">
                        <div className="font-extrabold text-[#2C2825]">{u.username}</div>
                        <div className="text-[11px] text-[#6C665D]">{u.email || 'No email'}</div>
                      </td>
                      <td className="p-3 text-[#6C665D]">
                        <div>{u.state || 'N/A'}</div>
                        <div className="text-[10px]">{u.phone || 'N/A'}</div>
                      </td>
                      <td className="p-3">
                        <select
                          className="clay-input py-1 px-2 text-xs font-bold max-w-xs"
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                        >
                          <option value="farmer">Farmer</option>
                          <option value="agronomist">Agronomist</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#2E6F40]">{u.parcels_count} Parcels</div>
                        <div className="text-[10px] text-[#6C665D]">{u.orders_count} Orders</div>
                      </td>
                      <td className="p-3">
                        {u.is_active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ClayButton
                            size="sm"
                            variant="outline"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedFarmer(u)}
                          >
                            Inspect
                          </ClayButton>

                          {u.is_active ? (
                            <button
                              onClick={() => toggleUserStatusMutation.mutate({ user_id: u.id, is_active: false })}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleUserStatusMutation.mutate({ user_id: u.id, is_active: true })}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>

          {/* Farmer Inspection Detail Modal */}
          {selectedFarmer && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <ClayCard className="max-w-2xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#2C2825]">Farmer Account: @{selectedFarmer.username}</h3>
                    <span className="text-xs font-semibold text-[#6C665D]">Role: {selectedFarmer.role} | Joined: {new Date(selectedFarmer.date_joined).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => setSelectedFarmer(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {farmerDetail ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-[#2E6F40] mb-2 uppercase text-[11px]">Registered Land Parcels ({farmerDetail.lands.length})</h4>
                      {farmerDetail.lands.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[#FAF8F5] text-[#6C665D]">No land parcels registered yet.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {farmerDetail.lands.map((land: any) => (
                            <div key={land.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                              <div className="font-bold text-[#2C2825]">{land.name}</div>
                              <div className="text-[#6C665D]">{land.acreage} Acres • {land.soil_type}</div>
                              <div className="text-[10px] text-[#6C665D]">{land.location_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-[#C86D3B] mb-2 uppercase text-[11px]">Recent Orders ({farmerDetail.orders.length})</h4>
                      {farmerDetail.orders.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[#FAF8F5] text-[#6C665D]">No store orders found.</div>
                      ) : (
                        <div className="space-y-1">
                          {farmerDetail.orders.map((ord: any) => (
                            <div key={ord.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                              <span className="font-bold">{ord.order_number}</span>
                              <span className="font-black text-[#2E6F40]">₹{ord.total_amount}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-100 text-blue-800">{ord.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#6C665D]">Loading farmer inspection data...</div>
                )}

                <div className="pt-2 text-right">
                  <ClayButton size="sm" variant="outline" onClick={() => setSelectedFarmer(null)}>
                    Close Inspection
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Marketplace Moderation */}
      {activeTab === 'marketplace' && (
        <ClayCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#2C2825]">Marketplace Moderation</h3>
              <p className="text-xs font-semibold text-[#6C665D]">Approve, flag, remove, or add crop produce listings.</p>
            </div>

            <ClayButton
              size="sm"
              className="bg-[#2E6F40] text-white"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setShowAddProduceModal(true)}
            >
              Add Produce Listing
            </ClayButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#2C2825] font-bold border-b border-[#E5E0D8]">
                  <th className="p-3">Produce Title</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Crop / Quantity</th>
                  <th className="p-3">Price per Unit</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {marketplaceListings.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="p-3 font-extrabold text-[#2C2825]">{item.title}</td>
                    <td className="p-3 font-semibold text-[#6C665D]">@{item.seller_name}</td>
                    <td className="p-3 font-bold text-[#2E6F40]">{item.crop_name} ({item.quantity} {item.unit})</td>
                    <td className="p-3 font-black text-[#2C2825]">₹{item.price_per_unit}/{item.unit}</td>
                    <td className="p-3 text-[#6C665D]">{item.location}</td>
                    <td className="p-3">
                      {item.is_deleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800">Soft Deleted</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== 'Active' && (
                          <button
                            onClick={() => moderateMarketplaceMutation.mutate({ listing_id: item.id, action: 'approve' })}
                            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          >
                            Approve
                          </button>
                        )}
                        {item.status === 'Active' && (
                          <button
                            onClick={() => moderateMarketplaceMutation.mutate({ listing_id: item.id, action: 'flag' })}
                            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          >
                            Flag/Close
                          </button>
                        )}
                        {!item.is_deleted && (
                          <button
                            onClick={() => moderateMarketplaceMutation.mutate({ listing_id: item.id, action: 'delete' })}
                            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Produce Listing Modal */}
          {showAddProduceModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <ClayCard className="max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <h3 className="text-base font-bold text-[#2C2825]">Add Produce Listing</h3>
                  <button onClick={() => setShowAddProduceModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <ClayInput
                    label="Listing Title"
                    placeholder="e.g. Organic Basmati Rice Batch"
                    value={newProduce.title}
                    onChange={(e) => setNewProduce({ ...newProduce, title: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Crop Name</label>
                      <input
                        type="text"
                        className="clay-input text-xs"
                        placeholder="e.g. Wheat / Paddy"
                        value={newProduce.crop_name}
                        onChange={(e) => setNewProduce({ ...newProduce, crop_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Location</label>
                      <input
                        type="text"
                        className="clay-input text-xs"
                        placeholder="e.g. Lasalgaon, Nashik, Maharashtra"
                        value={newProduce.location}
                        onChange={(e) => setNewProduce({ ...newProduce, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <ClayInput
                      label="Quantity"
                      type="number"
                      value={newProduce.quantity}
                      onChange={(e) => setNewProduce({ ...newProduce, quantity: Number(e.target.value) })}
                    />
                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Unit</label>
                      <select
                        className="clay-input text-xs"
                        value={newProduce.unit}
                        onChange={(e) => setNewProduce({ ...newProduce, unit: e.target.value })}
                      >
                        <option value="Quintals">Quintals</option>
                        <option value="kg">kg</option>
                        <option value="Tons">Tons</option>
                      </select>
                    </div>
                    <ClayInput
                      label="Price / Unit (₹)"
                      type="number"
                      value={newProduce.price_per_unit}
                      onChange={(e) => setNewProduce({ ...newProduce, price_per_unit: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C2825] mb-1">Description (Optional)</label>
                    <textarea
                      rows={2}
                      className="clay-input text-xs w-full p-2"
                      placeholder="High quality crop produce freshly harvested..."
                      value={newProduce.description}
                      onChange={(e) => setNewProduce({ ...newProduce, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <ClayButton variant="outline" size="sm" onClick={() => setShowAddProduceModal(false)}>
                    Cancel
                  </ClayButton>
                  <ClayButton
                    size="sm"
                    className="bg-[#2E6F40] text-white"
                    onClick={() => createProduceMutation.mutate(newProduce)}
                    disabled={!newProduce.title || !newProduce.crop_name}
                  >
                    Save & Publish Listing
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}
        </ClayCard>
      )}

      {/* Tab 4: Inventory & E-Store Oversight */}
      {activeTab === 'inventory' && (
        <ClayCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#2C2825]">Agri E-Store Product & Inventory Control</h3>
              <p className="text-xs font-semibold text-[#6C665D]">Monitor low-stock products, add new store items, and update stock counts.</p>
            </div>

            <ClayButton
              size="sm"
              className="bg-[#2E6F40] text-white"
              icon={<PackagePlus className="w-4 h-4" />}
              onClick={() => setShowAddProductModal(true)}
            >
              Add New Store Product
            </ClayButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#2C2825] font-bold border-b border-[#E5E0D8]">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price per Unit</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {inventoryItems.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="p-3 font-extrabold text-[#2C2825]">{p.name}</td>
                    <td className="p-3 font-semibold text-[#6C665D]">{p.category}</td>
                    <td className="p-3 font-black text-[#2E6F40]">₹{p.price_per_unit}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">{p.stock} units</span>
                        {p.is_low_stock && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {p.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ClayButton
                          size="sm"
                          variant="outline"
                          icon={<Edit className="w-3.5 h-3.5 text-[#2E6F40]" />}
                          onClick={() => setEditingProduct({ ...p })}
                        >
                          Edit Details
                        </ClayButton>

                        <ClayButton
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjustStockItem(p);
                            setNewStockVal(p.stock);
                          }}
                        >
                          Adjust Stock
                        </ClayButton>

                        <button
                          onClick={() => updateInventoryMutation.mutate({ product_id: p.id, is_active: !p.is_active })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${
                            p.is_active ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <ClayCard className="max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <h3 className="text-base font-bold text-[#2C2825]">Add New E-Store Product</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <ClayInput
                    label="Product Name"
                    placeholder="e.g. Premium NPK Granular Fertilizer"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Category</label>
                      <select
                        className="clay-input text-xs"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Seeds">Seeds</option>
                        <option value="Pesticides">Pesticides</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Fuel">Fuel</option>
                        <option value="Crops">Crops</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Unit</label>
                      <input
                        type="text"
                        className="clay-input text-xs"
                        placeholder="e.g. kg / Litre / Kit / Pack"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <ClayInput
                      label="Price per Unit (₹)"
                      type="number"
                      value={newProduct.price_per_unit}
                      onChange={(e) => setNewProduct({ ...newProduct, price_per_unit: Number(e.target.value) })}
                    />
                    <ClayInput
                      label="Stock Quantity"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                    <ClayInput
                      label="Reorder Alert Level"
                      type="number"
                      value={newProduct.reorder_level}
                      onChange={(e) => setNewProduct({ ...newProduct, reorder_level: Number(e.target.value) })}
                    />
                  </div>

                  <ClayInput
                    label="Image URL (Optional)"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-bold text-[#2C2825] mb-1">Description (Optional)</label>
                    <textarea
                      rows={2}
                      className="clay-input text-xs w-full p-2"
                      placeholder="High grade agriculture input..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <ClayButton variant="outline" size="sm" onClick={() => setShowAddProductModal(false)}>
                    Cancel
                  </ClayButton>
                  <ClayButton
                    size="sm"
                    className="bg-[#2E6F40] text-white"
                    onClick={() => createProductMutation.mutate(newProduct)}
                    disabled={!newProduct.name}
                  >
                    Add Product to E-Store
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}

          {/* Adjust Stock Modal */}
          {adjustStockItem && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <ClayCard className="max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-[#2C2825]">Adjust Inventory Stock</h3>
                <p className="text-xs text-[#6C665D]">Updating stock for <strong>{adjustStockItem.name}</strong></p>

                <ClayInput
                  label="New Stock Quantity"
                  type="number"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <ClayButton variant="outline" size="sm" onClick={() => setAdjustStockItem(null)}>
                    Cancel
                  </ClayButton>
                  <ClayButton
                    size="sm"
                    className="bg-[#2E6F40]"
                    onClick={() => updateInventoryMutation.mutate({ product_id: adjustStockItem.id, stock: newStockVal })}
                  >
                    Save Stock Level
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <ClayCard className="max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <h3 className="text-base font-bold text-[#2C2825]">Edit Product Details & Image</h3>
                  <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Live Image Preview Banner */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center">
                  <img
                    src={getCleanImageUrl(editingProduct.image_url, editingProduct.name || editingProduct.category)}
                    alt="Live Image Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage(editingProduct.name || editingProduct.category);
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Live Image Preview
                  </div>
                </div>

                <div className="space-y-3">
                  <ClayInput
                    label="Product Name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Category</label>
                      <select
                        className="clay-input text-xs"
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      >
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Seeds">Seeds</option>
                        <option value="Pesticides">Pesticides</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Fuel">Fuel</option>
                        <option value="Crops">Crops</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C2825] mb-1">Unit</label>
                      <input
                        type="text"
                        className="clay-input text-xs"
                        value={editingProduct.unit}
                        onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ClayInput
                      label="Price per Unit (₹)"
                      type="number"
                      value={editingProduct.price_per_unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price_per_unit: Number(e.target.value) })}
                    />
                    <ClayInput
                      label="Stock Quantity"
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    />
                  </div>

                  <ClayInput
                    label="Image URL (Paste Unsplash or direct image link)"
                    placeholder="https://images.unsplash.com/..."
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-bold text-[#2C2825] mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="clay-input text-xs w-full p-2"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <ClayButton variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                    Cancel
                  </ClayButton>
                  <ClayButton
                    size="sm"
                    className="bg-[#2E6F40] text-white"
                    onClick={() => updateInventoryMutation.mutate({
                      product_id: editingProduct.id,
                      name: editingProduct.name,
                      category: editingProduct.category,
                      price_per_unit: editingProduct.price_per_unit,
                      unit: editingProduct.unit,
                      stock: editingProduct.stock,
                      image_url: editingProduct.image_url,
                      description: editingProduct.description,
                    })}
                  >
                    Save Changes & Update Image
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}
        </ClayCard>
      )}

      {/* Tab 5: Audit Trail & Soft-Delete Recovery */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <ClayCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2825]">Platform Audit Log Trail</h3>
                <p className="text-xs text-[#6C665D]">Immutable record of all admin role changes, soft-deletes, restorations, and exports.</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#6C665D]" />
                <select
                  className="clay-input py-1.5 text-xs font-bold"
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="RESTORE">RESTORE</option>
                  <option value="EXPORT">EXPORT</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#2C2825] font-bold border-b border-[#E5E0D8]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Log Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="p-3 text-[#6C665D] font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-extrabold text-[#2C2825]">@{log.performed_by_name || 'System'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.action === 'RESTORE' ? 'bg-emerald-100 text-emerald-800' :
                          log.action === 'CREATE' ? 'bg-purple-100 text-purple-800' :
                          log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#2E6F40]">{log.entity_name} ({log.entity_id || 'N/A'})</td>
                      <td className="p-3 text-[#6C665D]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>

          <ClayCard className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[#2C2825] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C86D3B]" /> Soft-Deleted Entity Recovery Desk
            </h3>
            <p className="text-xs text-[#6C665D]">Restore items that were soft-deleted across land parcels, produce listings, and store products.</p>

            {softDeletedItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] text-center text-xs text-[#6C665D]">
                No soft-deleted entities currently pending recovery.
              </div>
            ) : (
              <div className="space-y-2">
                {softDeletedItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between text-xs">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 mr-2">
                        {item.entity_type}
                      </span>
                      <span className="font-bold text-[#2C2825]">{item.title}</span>
                    </div>

                    <button
                      onClick={() => softDeleteRestoreMutation.mutate({ entity_type: item.entity_type, entity_id: item.id, action: 'restore' })}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-[#2E6F40] text-white hover:bg-[#1E5128] transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Entity
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>
        </div>
      )}
    </div>
  );
};
