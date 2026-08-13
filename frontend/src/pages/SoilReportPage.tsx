import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { FileText, Download, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const SoilReportPage: React.FC = () => {
  const { soilId } = useParams<{ soilId: string }>();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', soilId],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/json/${soilId}/`);
      return res.data;
    },
    enabled: !!soilId,
  });

  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get(`/reports/pdf/${soilId}/`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Soil_Report_${report?.lab_reference || soilId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF report', err);
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-sm font-semibold text-[#6B6F63]">Generating Soil Report...</div>;
  }

  if (error || !report) {
    return (
      <div className="py-16 text-center text-sm text-rose-600 font-semibold">
        Report record not found or access denied.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link to="/farms">
          <ClayButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Farms
          </ClayButton>
        </Link>

        <ClayButton icon={<Download className="w-4 h-4" />} onClick={handleDownloadPDF}>
          Download Official PDF (#000002)
        </ClayButton>
      </div>

      {/* Main Print-Style Soil Health Report Card */}
      <ClayCard className="p-8 space-y-8 bg-white border border-[#E2DDD3] shadow-md">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#4C7A45] pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#4C7A45] tracking-tight">AgriSense Precision Agriculture</h1>
            <p className="text-sm font-bold text-[#6B6F63]">Soil Health & Crop Recommendation Report</p>
          </div>
          <div className="sm:text-right">
            <div className="text-lg font-black text-[#4C7A45]">Lab Ref: {report.lab_reference}</div>
            <div className="text-xs font-semibold text-[#6B6F63]">Date of Report: {report.sample_date}</div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD3] text-xs">
          <div>
            <span className="font-bold text-[#6B6F63] block uppercase text-[10px]">Farmer Name</span>
            <span className="font-extrabold text-[#2B2E28]">{report.farmer_name}</span>
          </div>
          <div>
            <span className="font-bold text-[#6B6F63] block uppercase text-[10px]">Land Parcel ID</span>
            <span className="font-extrabold text-[#2B2E28]">{report.land_id} ({report.land_name})</span>
          </div>
          <div>
            <span className="font-bold text-[#6B6F63] block uppercase text-[10px]">Acreage</span>
            <span className="font-extrabold text-[#2B2E28]">{report.acreage} Acres</span>
          </div>
          <div>
            <span className="font-bold text-[#6B6F63] block uppercase text-[10px]">Soil Type</span>
            <span className="font-extrabold text-[#2B2E28]">{report.soil_type}</span>
          </div>
        </div>

        {/* Section 1 — Soil Parameter Analysis */}
        <div>
          <h2 className="text-lg font-bold text-[#4C7A45] bg-[#EEF3EA] px-4 py-2 rounded-xl border-l-4 border-[#4C7A45] mb-4">
            Section 1 — Soil Parameter Analysis
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#E2DDD3]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F1EA] text-[#2B2E28] font-bold border-b border-[#E2DDD3]">
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Observed Value</th>
                  <th className="p-3">Standard Ideal Range</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD3]">
                {report.soil_analysis_table.map((row: any, i: number) => {
                  let badgeStyle = 'bg-emerald-100 text-emerald-800';
                  if (row.status === 'Low') badgeStyle = 'bg-amber-100 text-amber-800';
                  if (row.status === 'Medium') badgeStyle = 'bg-yellow-100 text-yellow-800';

                  return (
                    <tr key={i} className="hover:bg-[#FAF8F5]">
                      <td className="p-3 font-extrabold text-[#2B2E28]">{row.parameter}</td>
                      <td className="p-3 font-semibold">{row.observed_value}</td>
                      <td className="p-3 text-[#6B6F63]">{row.ideal_range}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${badgeStyle}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2 — Soil Health Interpretation */}
        <div>
          <h2 className="text-lg font-bold text-[#4C7A45] bg-[#EEF3EA] px-4 py-2 rounded-xl border-l-4 border-[#4C7A45] mb-3">
            Section 2 — Soil Health Interpretation
          </h2>
          <ul className="space-y-2 pl-2">
            {report.soil_narratives.map((note: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs font-semibold text-[#2B2E28]">
                <Info className="w-4 h-4 text-[#4C7A45] shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3 — Crop Recommendation */}
        <div>
          <h2 className="text-lg font-bold text-[#4C7A45] bg-[#EEF3EA] px-4 py-2 rounded-xl border-l-4 border-[#4C7A45] mb-3">
            Section 3 — Crop Recommendation
          </h2>
          {report.top_recommended_crop && (
            <div className="p-5 rounded-2xl bg-[#E2F1E1] border border-[#4C7A45] space-y-1">
              <div className="text-base font-black text-[#2D6A2E] flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recommended Crop: {report.top_recommended_crop.crop_name} ({report.top_recommended_crop.category} — Score: {report.top_recommended_crop.score}/10)
              </div>
              <p className="text-xs font-semibold text-[#6B6F63] pl-7">
                Basis: {report.top_recommended_crop.basis}
              </p>
            </div>
          )}
        </div>

        {/* Section 4 — Fertilizer Advisory (Evaluated Crops) */}
        <div>
          <h2 className="text-lg font-bold text-[#4C7A45] bg-[#EEF3EA] px-4 py-2 rounded-xl border-l-4 border-[#4C7A45] mb-4">
            Section 4 — Fertilizer Advisory (Full Catalog Breakdown)
          </h2>
          
          <div className="space-y-6">
            {report.all_evaluated_crops.map((crop: any) => (
              <div key={crop.crop_id} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD3] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2DDD3] pb-2">
                  <span className="text-sm font-extrabold text-[#2B2E28]">
                    {crop.crop_name} <span className="text-xs text-[#6B6F63] font-normal">(Season: {crop.season})</span>
                  </span>
                  <span className="text-xs font-black text-[#4C7A45] bg-[#E2F1E1] px-3 py-1 rounded-full">
                    Score: {crop.score}/10 &bull; {crop.category}
                  </span>
                </div>

                {/* Dosage Table */}
                <div className="overflow-x-auto rounded-xl border border-[#E2DDD3]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F4F1EA] font-bold text-[#2B2E28]">
                        <th className="p-2 border-b border-[#E2DDD3]">Nutrient</th>
                        <th className="p-2 border-b border-[#E2DDD3]">Recommended Dosage (kg/acre)</th>
                        <th className="p-2 border-b border-[#E2DDD3]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD3]">
                      {crop.dosage_table.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold">{row.nutrient}</td>
                          <td className="p-2 font-extrabold text-[#4C7A45]">{row.recommended_dosage}</td>
                          <td className="p-2 text-[#6B6F63]">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recommended Products */}
                <div>
                  <span className="text-[11px] font-bold text-[#2B2E28] uppercase tracking-wider block mb-1">
                    Recommended Products:
                  </span>
                  <ul className="list-disc pl-5 text-xs text-[#6B6F63] space-y-0.5">
                    {crop.recommended_products.map((prod: string, pIdx: number) => (
                      <li key={pIdx} className="font-semibold text-[#2B2E28]">{prod}</li>
                    ))}
                  </ul>
                </div>

                {/* Analysis Line */}
                <div className="text-[11px] text-[#6B6F63] italic bg-white p-2.5 rounded-xl border border-[#E2DDD3]">
                  {crop.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ClayCard>
    </div>
  );
};
