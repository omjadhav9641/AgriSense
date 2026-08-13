import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '../api/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import { ClayModal } from '../components/ClayModal';
import { Store, Plus, MapPin, Tag, Phone, Mail, User, Filter, CheckCircle2, MessageSquare } from 'lucide-react';
import { getCleanImageUrl, getFallbackImage } from '../utils/imageUtils';

export const MarketplacePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'my_listings'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inquireModalListing, setInquireModalListing] = useState<any>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    crop_name: 'Wheat',
    quantity: 50,
    unit: 'Quintals',
    price_per_unit: 2200,
    location: 'Lasalgaon APMC, Nashik, Maharashtra',
    description: '',
    contact_phone: user?.phone || '',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  });

  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('');
  const [inquiryErrorMsg, setInquiryErrorMsg] = useState('');

  const [inquiryForm, setInquiryForm] = useState({
    buyer_name: user?.username || '',
    buyer_contact: user?.email || user?.phone || '',
    message: 'Hello, I am interested in purchasing this produce batch. Please confirm availability and pickup details.',
    offered_price: 0,
  });

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['marketplace_listings', selectedCrop, activeTab],
    queryFn: async () => {
      return await marketplaceService.getListings({
        crop: selectedCrop !== 'All' ? selectedCrop : undefined,
        my_listings: activeTab === 'my_listings',
      });
    },
  });

  const listings = Array.isArray(listingsData) ? listingsData : (listingsData?.results || []);

  const createMutation = useMutation({
    mutationFn: marketplaceService.createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      setIsCreateModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: marketplaceService.deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
    },
  });

  const inquireMutation = useMutation({
    mutationFn: (id: number) => marketplaceService.inquire(id, inquiryForm),
    onSuccess: () => {
      setInquireModalListing(null);
      setInquirySuccessMsg('Your inquiry and offer have been successfully sent to the farmer!');
      setTimeout(() => setInquirySuccessMsg(''), 6000);
    },
    onError: (err: any) => {
      let msg = 'Failed to send inquiry. Please check your information.';
      if (typeof err.response?.data === 'string') {
        msg = 'Server error occurred while submitting inquiry.';
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setInquiryErrorMsg(msg);
    },
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9E6B0D]">
            <Store className="w-4 h-4 text-[#D99B26]" /> Direct Farmer-to-Buyer Marketplace
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] mt-1">Produce Marketplace</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Sell harvested crops directly to bulk buyers, food processors, and wholesale merchants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-[#2E6F40] text-white shadow-xs' : 'text-[#6C665D]'
              }`}
            >
              Browse All Produce
            </button>
            <button
              onClick={() => setActiveTab('my_listings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'my_listings' ? 'bg-[#2E6F40] text-white shadow-xs' : 'text-[#6C665D]'
              }`}
            >
              My Listings
            </button>
          </div>

          <ClayButton className="bg-[#2E6F40] hover:bg-[#1E5128]" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Post Produce Listing
          </ClayButton>
        </div>
      </div>

      {inquirySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{inquirySuccessMsg}</span>
          </div>
          <button onClick={() => setInquirySuccessMsg('')} className="text-emerald-700 font-extrabold">✕</button>
        </div>
      )}

      {/* Crop Filter Bar */}
      <ClayCard className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6C665D]">
          <Filter className="w-4 h-4 text-[#2E6F40]" /> Crop Filter:
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Wheat', 'Rice', 'Tomato', 'Potato', 'Sugarcane', 'Maize'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCrop === crop
                  ? 'bg-[#2E6F40] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6C665D] hover:bg-[#EBE7DF]'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </ClayCard>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6C665D]">Loading produce listings...</div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing: any) => (
            <ClayCard key={listing.id} hoverable className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full bg-[#E5E0D8]">
                  <img
                    src={getCleanImageUrl(listing.image_url, listing.crop_name || listing.title)}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage(listing.crop_name || listing.title);
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-[#2C2825] shadow-xs border border-[#E5E0D8]">
                    ₹{listing.price_per_unit} / {listing.unit}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#2E6F40]/90 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {listing.crop_name}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-extrabold text-[#2C2825] leading-snug">{listing.title}</h3>

                  <div className="flex items-center justify-between text-xs text-[#6C665D] font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#2E6F40]" /> Quantity: {listing.quantity} {listing.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C86D3B]" /> {listing.location}
                    </span>
                  </div>

                  {listing.description && (
                    <p className="text-xs text-[#6C665D] line-clamp-2">{listing.description}</p>
                  )}

                  <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-[#6C665D]">
                    <span>Seller: <strong className="text-[#2C2825]">{listing.seller_name}</strong></span>
                    {listing.contact_phone && (
                      <span className="flex items-center gap-1 text-[#2E6F40] font-bold">
                        <Phone className="w-3 h-3" /> {listing.contact_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                {activeTab === 'my_listings' ? (
                  <ClayButton
                    variant="outline"
                    size="sm"
                    className="w-full text-rose-700 hover:bg-rose-50"
                    onClick={() => deleteMutation.mutate(listing.id)}
                  >
                    Delete Listing
                  </ClayButton>
                ) : (
                  <ClayButton
                    size="sm"
                    className="w-full bg-[#2E6F40] hover:bg-[#1E5128]"
                    icon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => {
                      setInquiryErrorMsg('');
                      setInquireModalListing(listing);
                      setInquiryForm({
                        buyer_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Om',
                        buyer_contact: user?.phone || user?.email || 'om@farmer.org',
                        message: 'Hello, I am interested in purchasing this produce batch. Please confirm availability and pickup details.',
                        offered_price: listing.price_per_unit,
                      });
                    }}
                  >
                    Contact Farmer / Buy Batch
                  </ClayButton>
                )}
              </div>
            </ClayCard>
          ))}
        </div>
      ) : (
        <ClayCard className="p-12 text-center text-xs text-[#6C665D]">
          No active produce listings found. Click "Post Produce Listing" to add one!
        </ClayCard>
      )}

      {/* Create Listing Modal */}
      <ClayModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post Harvested Produce for Sale"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(createForm);
          }}
          className="space-y-4"
        >
          <ClayInput
            label="Listing Title"
            placeholder="e.g. Sharbati Grain Wheat Harvest"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
                Crop Commodity
              </label>
              <select
                className="clay-input"
                value={createForm.crop_name}
                onChange={(e) => setCreateForm({ ...createForm, crop_name: e.target.value })}
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Maize">Maize</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>

            <ClayInput
              label="Location / Mandi Zone"
              value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ClayInput
              label="Quantity"
              type="number"
              value={createForm.quantity}
              onChange={(e) => setCreateForm({ ...createForm, quantity: parseFloat(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
                Unit
              </label>
              <select
                className="clay-input"
                value={createForm.unit}
                onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
              >
                <option value="Quintals">Quintals</option>
                <option value="Tons">Tons</option>
                <option value="Kg">Kg</option>
                <option value="Bags">Bags</option>
              </select>
            </div>
            <ClayInput
              label="Price / Unit (₹)"
              type="number"
              value={createForm.price_per_unit}
              onChange={(e) => setCreateForm({ ...createForm, price_per_unit: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <ClayInput
            label="Contact Phone"
            value={createForm.contact_phone}
            onChange={(e) => setCreateForm({ ...createForm, contact_phone: e.target.value })}
          />

          <ClayInput
            label="Photo URL"
            value={createForm.image_url}
            onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
          />

          <div>
            <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
              Description / Quality Notes
            </label>
            <textarea
              className="clay-input min-h-[80px]"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <ClayButton variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </ClayButton>
            <ClayButton type="submit" className="bg-[#2E6F40] hover:bg-[#1E5128]" loading={createMutation.isPending}>
              Publish Listing
            </ClayButton>
          </div>
        </form>
      </ClayModal>

      {/* Buyer Inquiry Modal */}
      {inquireModalListing && (
        <ClayModal
          isOpen={!!inquireModalListing}
          onClose={() => setInquireModalListing(null)}
          title={`Inquire Batch: ${inquireModalListing.title}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInquiryErrorMsg('');
              inquireMutation.mutate(inquireModalListing.id);
            }}
            className="space-y-4"
          >
            {inquiryErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center justify-between">
                <span>{inquiryErrorMsg}</span>
                <button onClick={() => setInquiryErrorMsg('')} type="button" className="text-rose-800 font-bold">✕</button>
              </div>
            )}
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6C665D] font-semibold">Seller:</span>
                <span className="font-bold text-[#2C2825]">{inquireModalListing.seller_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C665D] font-semibold">Listed Price:</span>
                <span className="font-bold text-[#2E6F40]">₹{inquireModalListing.price_per_unit} / {inquireModalListing.unit}</span>
              </div>
            </div>

            <ClayInput
              label="Your Name"
              value={inquiryForm.buyer_name}
              onChange={(e) => setInquiryForm({ ...inquiryForm, buyer_name: e.target.value })}
              required
            />

            <ClayInput
              label="Your Phone / Email"
              value={inquiryForm.buyer_contact}
              onChange={(e) => setInquiryForm({ ...inquiryForm, buyer_contact: e.target.value })}
              required
            />

            <ClayInput
              label="Offered Price (₹ / unit)"
              type="number"
              value={inquiryForm.offered_price}
              onChange={(e) => setInquiryForm({ ...inquiryForm, offered_price: parseFloat(e.target.value) || 0 })}
            />

            <div>
              <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
                Inquiry Message
              </label>
              <textarea
                className="clay-input min-h-[90px]"
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <ClayButton variant="outline" type="button" onClick={() => setInquireModalListing(null)}>
                Cancel
              </ClayButton>
              <ClayButton type="submit" className="bg-[#2E6F40] hover:bg-[#1E5128]" loading={inquireMutation.isPending}>
                Send Inquiry to Farmer
              </ClayButton>
            </div>
          </form>
        </ClayModal>
      )}
    </div>
  );
};
