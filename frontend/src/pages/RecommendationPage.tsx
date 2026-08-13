import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { Sparkles, ShoppingBag, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export const RecommendationPage: React.FC = () => {
  const { soilId } = useParams<{ soilId: string }>();

  const { data: rec, isLoading } = useQuery({
    queryKey: ['recommendation', soilId],
    queryFn: async () => {
      const res = await apiClient.get(`/recommendations/evaluate/${soilId}/`);
      return res.data;
    },
    enabled: !!soilId,
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm font-semibold text-[#6B6F63]">Evaluating AI Recommendation Engine...</div>;
  }

  if (!rec) {
    return <div className="py-16 text-center text-sm font-semibold text-rose-600">Failed to load recommendation data.</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <Link to="/farms">
          <ClayButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Parcels
          </ClayButton>
        </Link>

        <Link to="/store">
          <ClayButton variant="secondary" size="sm" icon={<ShoppingBag className="w-4 h-4" />}>
            Shop Recommended Products
          </ClayButton>
        </Link>
      </div>

      {/* Top Winner Card */}
      {rec.top_recommended_crop && (
        <ClayCard className="p-0 overflow-hidden bg-gradient-to-br from-[#E2F1E1] to-[#FAF8F5] border border-[#4C7A45] shadow-md">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Top Crop Image Hero */}
            {rec.top_recommended_crop.image_url && (
              <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden bg-[#2B2E28]">
                <img
                  src={rec.top_recommended_crop.image_url}
                  alt={rec.top_recommended_crop.crop_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30" />
                <span className="absolute top-3 left-3 bg-[#4C7A45] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  Top Matched Crop
                </span>
              </div>
            )}

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-[#4C7A45]" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#4C7A45]">
                      #1 Top Suitable Recommendation
                    </span>
                    <h1 className="text-3xl font-black text-[#2B2E28] mt-0.5">
                      {rec.top_recommended_crop.crop_name}
                    </h1>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="text-2xl font-black text-[#2D6A2E] bg-white px-4 py-1.5 rounded-2xl border border-[#4C7A45] shadow-xs">
                    Score: {rec.top_recommended_crop.score} / 10
                  </span>
                  <span className="text-xs font-bold text-[#6B6F63]">
                    Season: {rec.top_recommended_crop.season}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#6B6F63] mt-3 leading-relaxed">
                  Basis: {rec.top_recommended_crop.basis}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#4C7A45]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D6A2E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4C7A45]" /> Optimal Soil & Climatic Compatibility
                </span>
              </div>
            </div>
          </div>
        </ClayCard>
      )}

      {/* Full Catalog Crop Rankings */}
      <div>
        <h2 className="text-xl font-bold text-[#2B2E28] mb-4">Evaluated Crop Catalog Rankings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rec.all_evaluated_crops.map((crop: any) => (
            <ClayCard key={crop.crop_id} className="p-5 space-y-4 overflow-hidden group">
              <div className="flex gap-4 items-start">
                {/* Crop Image Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F2EFE8] border border-[#E2DDD3] shrink-0 relative">
                  {crop.image_url ? (
                    <img
                      src={crop.image_url}
                      alt={crop.crop_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#6B6F63]">
                      {crop.crop_name}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#2B2E28] truncate">{crop.crop_name}</h3>
                      <span className="text-xs font-semibold text-[#6B6F63]">Season: {crop.season}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-[#4C7A45] block">
                        {crop.score} / 10
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E2F1E1] text-[#4C7A45]">
                        {crop.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#2B2E28] block">Fertilizer Advisory:</span>
                {crop.recommended_products.map((p: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E2DDD3] font-semibold text-[#2B2E28]">
                    {p}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-[#6B6F63] italic pt-2 border-t border-[#E2DDD3]">
                {crop.analysis}
              </div>
            </ClayCard>
          ))}
        </div>
      </div>
    </div>
  );
};
