import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import { ClayModal } from '../components/ClayModal';
import {
  Landmark,
  ExternalLink,
  Phone,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [acreageFilter, setAcreageFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('Maharashtra');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  const { data: schemes = [], isLoading } = useQuery({
    queryKey: ['schemes', selectedType, acreageFilter, stateFilter],
    queryFn: async () => {
      let params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (acreageFilter) params.append('acreage', acreageFilter);
      if (stateFilter !== 'All') params.append('state', stateFilter);

      const res = await apiClient.get(`/schemes/?${params.toString()}`);
      return res.data;
    },
  });

  const filteredSchemes = schemes.filter((scheme: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      scheme.title.toLowerCase().includes(query) ||
      scheme.description.toLowerCase().includes(query) ||
      scheme.crop_category.toLowerCase().includes(query) ||
      scheme.target_state.toLowerCase().includes(query)
    );
  });

  const getSchemeBadgeStyle = (type: string) => {
    switch (type) {
      case 'subsidy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'portal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'helpline':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'advisory':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#2B6CB0]">
            <Landmark className="w-4 h-4 text-[#2B6CB0]" /> Official Govt Agriculture & Subsidy Portal
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] mt-1">Government Schemes & Direct Subsidies</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Explore 16+ active central & state government financial subsidies, crop insurance, solar grants, and helpline advisories.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] border border-emerald-300 text-[#2E6F40] text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2E6F40]" /> 100% Verified Govt Portals
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <ClayCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#2E6F40]">
            <Filter className="w-4 h-4" /> Eligibility Filtering & Keyword Search Engine
          </div>

          <div className="text-xs font-bold text-[#6C665D]">
            Showing <strong className="text-[#2C2825]">{filteredSchemes.length}</strong> scheme opportunities
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
              Search Schemes by Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#6C665D]" />
              <input
                type="text"
                placeholder="Search by scheme name, subsidy, solar, drip, Punjab..."
                className="clay-input pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
              Scheme Category
            </label>
            <select
              className="clay-input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Schemes ({schemes.length})</option>
              <option value="subsidy">Financial Subsidies & Grants</option>
              <option value="portal">Portals & Credit Loans</option>
              <option value="helpline">Emergency Helplines</option>
              <option value="advisory">Crop Advisories & Apps</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
              Target State / Region
            </label>
            <select
              className="clay-input"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="Maharashtra">Maharashtra (Priority Focus)</option>
              <option value="All">All States (National)</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold text-[#6C665D]">Quick Filter Tags:</span>
          {['PM-KISAN', 'PMFBY', 'Solar Pump', 'Micro-Irrigation', 'Happy Seeder', 'KCC Loan', 'Soil Health'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                searchQuery === tag
                  ? 'bg-[#2E6F40] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#2C2825] border border-[#E5E0D8] hover:bg-[#EBE7DF]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </ClayCard>

      {/* Schemes Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6C665D]">Loading official government scheme portal data...</div>
      ) : filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme: any) => (
            <ClayCard key={scheme.id} className="p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${getSchemeBadgeStyle(scheme.scheme_type)}`}>
                    {scheme.scheme_type}
                  </span>

                  <span className="text-[10px] font-extrabold text-[#6C665D] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5E0D8]">
                    Target State: {scheme.target_state}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#2C2825] leading-tight">{scheme.title}</h3>
                  <p className="text-xs text-[#6C665D] font-medium mt-1.5 leading-relaxed line-clamp-3">
                    {scheme.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-[11px] grid grid-cols-2 gap-2 text-[#2C2825]">
                  <div>
                    <span className="text-[#6C665D] block text-[10px] uppercase font-bold">Crop Scope:</span>
                    <strong className="text-[#2E6F40] font-bold">{scheme.crop_category}</strong>
                  </div>
                  <div>
                    <span className="text-[#6C665D] block text-[10px] uppercase font-bold">Land Eligibility:</span>
                    <strong className="text-[#2C2825] font-bold">
                      {scheme.min_land_acreage == 0 && scheme.max_land_acreage >= 500
                        ? 'All Landholdings'
                        : `${scheme.min_land_acreage} - ${scheme.max_land_acreage} Acres`}
                    </strong>
                  </div>
                </div>

                {scheme.contact_number && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                      Hotline: <strong>{scheme.contact_number}</strong>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold">24x7 Support</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <ClayButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  icon={<Info className="w-4 h-4 text-[#2E6F40]" />}
                  onClick={() => setSelectedScheme(scheme)}
                >
                  View Details & Guide
                </ClayButton>

                {scheme.link && (
                  <a href={scheme.link} target="_blank" rel="noreferrer" className="flex-1">
                    <ClayButton size="sm" className="w-full bg-[#2E6F40] hover:bg-[#1E5128]" icon={<ExternalLink className="w-4 h-4" />}>
                      Official Portal
                    </ClayButton>
                  </a>
                )}
              </div>
            </ClayCard>
          ))}
        </div>
      ) : (
        <ClayCard className="p-12 text-center text-xs text-[#6C665D] space-y-3">
          <HelpCircle className="w-8 h-8 text-[#6C665D] mx-auto" />
          <p className="font-extrabold text-[#2C2825] text-sm">No matching government schemes found for your current filter.</p>
          <p>Try resetting the search query or changing the state / category filter options.</p>
          <ClayButton
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setStateFilter('All');
              setAcreageFilter('');
            }}
          >
            Reset All Filters
          </ClayButton>
        </ClayCard>
      )}

      {/* Scheme Detail Guidance Modal */}
      {selectedScheme && (
        <ClayModal
          isOpen={!!selectedScheme}
          onClose={() => setSelectedScheme(null)}
          title={`Scheme Details: ${selectedScheme.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2">
              <span className={`text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${getSchemeBadgeStyle(selectedScheme.scheme_type)}`}>
                {selectedScheme.scheme_type}
              </span>
              <h4 className="text-base font-extrabold text-[#2C2825]">{selectedScheme.title}</h4>
              <p className="text-xs text-[#6C665D] leading-relaxed">{selectedScheme.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-[#2E6F40]">Target State</span>
                <span className="font-extrabold text-[#2C2825] text-xs">{selectedScheme.target_state}</span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-[#2E6F40]">Eligible Crop Scope</span>
                <span className="font-extrabold text-[#2C2825] text-xs">{selectedScheme.crop_category}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-[#2C2825] flex items-center gap-1.5 text-xs">
                <FileText className="w-4 h-4 text-[#2E6F40]" /> Mandatory Documents Required for Application
              </h5>
              <ul className="space-y-1 pl-5 list-disc text-[#6C665D]">
                <li>Aadhaar Card linked with active mobile number</li>
                <li>Land Possession Certificate / Patta / Khatauni Land Record Document</li>
                <li>Bank Passbook details (IFSC Code & Account Number for DBT Direct Benefit Transfer)</li>
                <li>Recent passport-size photograph of farmer</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-[#2C2825] flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2E6F40]" /> Step-by-Step Direct Application Guide
              </h5>
              <ol className="space-y-1 pl-5 list-decimal text-[#6C665D]">
                <li>Click on the <strong>Official Portal</strong> button below to open the government website.</li>
                <li>Locate the <strong>New Farmer Registration / Beneficiary Login</strong> section.</li>
                <li>Enter your 12-digit Aadhaar Number and complete OTP verification.</li>
                <li>Upload required land record scans and submit bank account details for direct subsidy credit.</li>
              </ol>
            </div>

            {selectedScheme.contact_number && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                Helpline Helpline / Grievance Redressal: {selectedScheme.contact_number}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E0D8]">
              <ClayButton variant="outline" onClick={() => setSelectedScheme(null)}>
                Close Window
              </ClayButton>

              {selectedScheme.link && (
                <a href={selectedScheme.link} target="_blank" rel="noreferrer">
                  <ClayButton className="bg-[#2E6F40] hover:bg-[#1E5128]" icon={<ExternalLink className="w-4 h-4" />}>
                    Open Official Portal
                  </ClayButton>
                </a>
              )}
            </div>
          </div>
        </ClayModal>
      )}
    </div>
  );
};
