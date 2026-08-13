import { apiClient } from './client';

export interface MarketplaceListingInput {
  title: string;
  crop_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  description?: string;
  contact_phone?: string;
  image_url?: string;
}

export const marketplaceService = {
  getListings: async (params?: { crop?: string; location?: string; status?: string; my_listings?: boolean }) => {
    const res = await apiClient.get('/marketplace/listings/', { params });
    return res.data;
  },
  createListing: async (data: MarketplaceListingInput) => {
    const res = await apiClient.post('/marketplace/listings/', data);
    return res.data;
  },
  deleteListing: async (id: number) => {
    const res = await apiClient.delete(`/marketplace/listings/${id}/`);
    return res.data;
  },
  inquire: async (id: number, inquiryData: { buyer_name: string; buyer_contact: string; message: string; offered_price?: number }) => {
    const res = await apiClient.post(`/marketplace/listings/${id}/inquire/`, inquiryData);
    return res.data;
  }
};
