import { apiClient } from './client';

export interface CropRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  top_n?: number;
}

export const cropService = {
  getQuickRecommendation: async (input: CropRecommendationInput) => {
    const res = await apiClient.post('/recommendations/quick-ai/', input);
    return res.data;
  },
  getEvaluatedReport: async (soilId: string | number) => {
    const res = await apiClient.get(`/recommendations/evaluate/${soilId}/`);
    return res.data;
  }
};
