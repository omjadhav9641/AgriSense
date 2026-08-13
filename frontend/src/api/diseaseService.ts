import { apiClient } from './client';

export const diseaseService = {
  diagnoseLeaf: async (formData: FormData) => {
    const res = await apiClient.post('/disease/diagnose/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getDiagnosisHistory: async () => {
    const res = await apiClient.get('/disease/history/');
    return res.data;
  }
};
