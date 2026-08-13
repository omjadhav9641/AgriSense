import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cropService } from '../api/cropService';
import type { CropRecommendationInput } from '../api/cropService';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import { Sparkles, CloudSun, ArrowRight, CheckCircle2, Sliders, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickRecommendationPage: React.FC = () => {
  const [formData, setFormData] = useState<CropRecommendationInput>({
    nitrogen: 120,
    phosphorus: 60,
    potassium: 40,
    temperature: 24.5,
    humidity: 65,
    ph: 6.5,
    rainfall: 85,
    top_n: 5,
  });

  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Fetch farmer lands to auto-fill weather context if available
  const { data: landsData } = useQuery({
    queryKey: ['lands_quick_ai'],
    queryFn: async () => {
      const res = await apiClient.get('/farms/lands/');
      return res.data;
    },
  });

  const lands = Array.isArray(landsData) ? landsData : (landsData?.results || []);
  const activeLand = lands[0];

  const handleAutoFillWeather = async () => {
    if (!activeLand) return;
    try {
      const res = await apiClient.get(`/weather/?lat=${activeLand.latitude}&lng=${activeLand.longitude}`);
      if (res.data?.current) {
        setFormData((prev) => ({
          ...prev,
          temperature: parseFloat(res.data.current.temperature.toFixed(1)),
          humidity: parseFloat(res.data.current.humidity.toFixed(0)),
        }));
      }
    } catch (err) {
      console.error('Weather auto-fill error:', err);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    try {
      const result = await cropService.getQuickRecommendation(formData);
      setPredictionResult(result);
    } catch (err) {
      console.error('Quick AI prediction failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#2E6F40]">
            <Sparkles className="w-4 h-4 text-[#2E6F40]" /> Fast AI Microservice Inference
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] mt-1">Quick AI Crop Recommendation</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Exploratory ML crop model based on N, P, K soil nutrients and live atmospheric weather conditions.
          </p>
        </div>

        {activeLand && (
          <ClayButton variant="outline" size="sm" icon={<CloudSun className="w-4 h-4 text-[#2563EB]" />} onClick={handleAutoFillWeather}>
            Auto-fill Parcel Weather ({activeLand.location_name})
          </ClayButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs Column */}
        <ClayCard className="lg:col-span-1 p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3 text-sm font-bold text-[#2C2825]">
            <Sliders className="w-4 h-4 text-[#2E6F40]" /> Soil & Atmospheric Parameters
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ClayInput
                label="Nitrogen (N)"
                type="number"
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
              />
              <ClayInput
                label="Phos. (P)"
                type="number"
                value={formData.phosphorus}
                onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
              />
              <ClayInput
                label="Potash (K)"
                type="number"
                value={formData.potassium}
                onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ClayInput
                label="Soil pH Level"
                type="number"
                step="0.1"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 0 })}
              />
              <ClayInput
                label="Rainfall (mm)"
                type="number"
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ClayInput
                label="Temp (°C)"
                type="number"
                step="0.5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
              />
              <ClayInput
                label="Humidity (%)"
                type="number"
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <ClayButton type="submit" className="w-full mt-2 bg-[#2E6F40] hover:bg-[#1E5128]" loading={isEvaluating} icon={<Sparkles className="w-4 h-4" />}>
              Run AI Model Inference
            </ClayButton>
          </form>

          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-[11px] text-[#6C665D]">
            <strong>Note:</strong> Quick AI is an exploratory path. For official lab compliance and full fertilizer dosing, view your <Link to="/farms" className="text-[#2E6F40] font-bold underline">Parcel Soil Health Report</Link>.
          </div>
        </ClayCard>

        {/* Prediction Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {predictionResult ? (
            <div>
              <h2 className="text-xl font-extrabold text-[#2C2825] mb-4">ML Ranked Suitable Crops</h2>

              <div className="space-y-4">
                {predictionResult.predictions?.map((item: any, idx: number) => (
                  <ClayCard key={idx} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E6F40] font-black text-lg flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#2C2825]">{item.crop_name}</h3>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            item.confidence_score >= 80 ? 'bg-[#E8F5E9] text-[#2E6F40] border border-[#2E6F40]/20' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {item.fit_category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#6C665D] mt-1">{item.rationale}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 self-end sm:self-center">
                      <span className="text-2xl font-black text-[#2E6F40] block">
                        {item.confidence_score}%
                      </span>
                      <span className="text-[10px] font-bold text-[#6C665D] uppercase">Match Score</span>
                    </div>
                  </ClayCard>
                ))}
              </div>
            </div>
          ) : (
            <ClayCard className="p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <Sparkles className="w-12 h-12 text-[#2E6F40] mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#2C2825]">Ready for ML Inference</h3>
              <p className="text-xs text-[#6C665D] max-w-sm mt-1">
                Adjust parameters on the left or auto-fill live weather data, then click "Run AI Model Inference" to evaluate.
              </p>
            </ClayCard>
          )}
        </div>
      </div>
    </div>
  );
};
