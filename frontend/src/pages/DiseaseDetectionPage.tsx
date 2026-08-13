import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diseaseService } from '../api/diseaseService';
import { apiClient } from '../api/client';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { UploadCloud, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Image as ImageIcon, History, XCircle, HelpCircle } from 'lucide-react';

export const DiseaseDetectionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLandId, setSelectedLandId] = useState<string>('');
  const [saveToHistory, setSaveToHistory] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'detector' | 'history'>('detector');

  // Fetch farmer lands
  const { data: landsData } = useQuery({
    queryKey: ['lands_disease'],
    queryFn: async () => {
      const res = await apiClient.get('/farms/lands/');
      return res.data;
    },
  });

  const lands = Array.isArray(landsData) ? landsData : (landsData?.results || []);

  // Fetch diagnosis history
  const { data: historyData } = useQuery({
    queryKey: ['disease_history'],
    queryFn: async () => {
      return await diseaseService.getDiagnosisHistory();
    },
    enabled: activeTab === 'history',
  });

  const history = Array.isArray(historyData) ? historyData : (historyData?.results || []);

  const diagnoseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('Please select an image file first.');
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedLandId) formData.append('land_id', selectedLandId);
      formData.append('save_to_history', saveToHistory ? 'true' : 'false');
      return await diseaseService.diagnoseLeaf(formData);
    },
    onSuccess: (data) => {
      if (data.status === 'success' || data.status === 'uncertain') {
        queryClient.invalidateQueries({ queryKey: ['disease_history'] });
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      diagnoseMutation.reset();
    }
  };

  const resultData = diagnoseMutation.data;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#2E6F40]">
            <Activity className="w-4 h-4 text-[#DC2626]" /> AI Computer Vision Pathology
          </div>
          <h1 className="text-3xl font-black text-[#2C2825] mt-1">Plant Disease Leaf Detection</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Upload a photo of an affected leaf for instant AI disease identification and treatment guidance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('detector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'detector' ? 'bg-[#2E6F40] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#6C665D] hover:bg-[#EBE7DF]'
            }`}
          >
            Upload Photo
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-[#2E6F40] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#6C665D] hover:bg-[#EBE7DF]'
            }`}
          >
            Farm Diagnosis History
          </button>
        </div>
      </div>

      {activeTab === 'detector' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Box */}
          <ClayCard className="p-6 space-y-5">
            <h3 className="text-base font-extrabold text-[#2C2825] border-b border-[#E5E0D8] pb-3">
              Upload Leaf Photo
            </h3>

            <div className="border-2 border-dashed border-[#2E6F40]/40 rounded-2xl p-6 text-center hover:bg-[#F8F6F0] transition-all relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Leaf Preview" className="max-h-56 mx-auto rounded-xl shadow-xs object-cover border border-[#E5E0D8]" />
                  <p className="text-xs font-bold text-[#2E6F40]">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E6F40] flex items-center justify-center mx-auto">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#2C2825] block">Click or Drag Leaf Image Here</span>
                    <span className="text-xs text-[#6C665D] font-semibold block mt-1">Supports JPG, PNG, WEBP leaf photos</span>
                  </div>
                </div>
              )}
            </div>

            {/* Farm Parcel Selector */}
            {lands.length > 0 && (
              <div>
                <label className="text-xs font-bold text-[#6C665D] uppercase tracking-wider pl-1 mb-1 block">
                  Associate with Land Parcel
                </label>
                <select
                  className="clay-input"
                  value={selectedLandId}
                  onChange={(e) => setSelectedLandId(e.target.value)}
                >
                  <option value="">No parcel association (General check)</option>
                  {lands.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.land_id} - {l.acreage} Acres)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveHistory"
                checked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                className="w-4 h-4 rounded text-[#2E6F40] focus:ring-[#2E6F40]"
              />
              <label htmlFor="saveHistory" className="text-xs font-semibold text-[#2C2825] cursor-pointer">
                Save diagnosis to my farm records history
              </label>
            </div>

            <ClayButton
              className="w-full bg-[#2E6F40] hover:bg-[#1E5128]"
              disabled={!selectedFile}
              loading={diagnoseMutation.isPending}
              onClick={() => diagnoseMutation.mutate()}
              icon={<ShieldAlert className="w-4 h-4" />}
            >
              Analyze Leaf & Diagnose Pathology
            </ClayButton>
          </ClayCard>

          {/* Results Card */}
          <div>
            {resultData ? (
              resultData.status === 'not_a_leaf' || resultData.status === 'invalid_input' ? (
                /* Rejection State for Non-Plant Images */
                <ClayCard className="p-6 space-y-5 border-2 border-rose-300 bg-rose-50/50">
                  <div className="flex items-center gap-3 text-rose-700">
                    <XCircle className="w-8 h-8 shrink-0" />
                    <div>
                      <h3 className="text-lg font-extrabold text-rose-900">Non-Plant Photo Rejected</h3>
                      <p className="text-xs font-semibold text-rose-800 mt-0.5">
                        {resultData.error_message || "This photo doesn't look like a plant leaf — please upload a clear image of an affected crop leaf."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/80 rounded-xl border border-rose-200 text-xs space-y-2 text-[#2C2825]">
                    <h4 className="font-bold uppercase tracking-wider text-rose-800">Photo Requirements:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-[#6C665D] font-semibold">
                      <li>Upload a close-up photo of a crop leaf showing clear symptoms.</li>
                      <li>Avoid uploading screenshots, code editors, documents, or non-plant objects.</li>
                      <li>Ensure adequate daylight and crisp camera focus.</li>
                    </ul>
                  </div>
                </ClayCard>
              ) : resultData.status === 'uncertain' ? (
                /* Uncertain Diagnosis State (<65% confidence) */
                <ClayCard className="p-6 space-y-5 border-2 border-amber-300 bg-amber-50/50">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-7 h-7 text-amber-700 shrink-0" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                          Uncertain Diagnosis
                        </span>
                        <h2 className="text-xl font-black text-[#2C2825] mt-1">
                          Ambiguous Leaf Symptoms
                        </h2>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-amber-900 block">
                        {resultData.confidence_score}%
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-amber-800">Low Confidence</span>
                    </div>
                  </div>

                  {resultData.top_candidates && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-[#2C2825]">Top Pathology Possibilities</h4>
                      {resultData.top_candidates.map((cand: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-200 text-xs font-bold text-[#2C2825]">
                          <span>#{idx + 1} {cand.disease_name}</span>
                          <span className="text-amber-800 font-extrabold">{cand.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#2C2825] mb-1">Agronomist Recommendation</h4>
                    <p className="text-xs text-[#6C665D] font-semibold leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                      {resultData.symptoms}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {resultData.treatment_guidance?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#2C2825] bg-white p-2.5 rounded-xl border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </ClayCard>
              ) : (
                /* High Confidence Success Diagnosis */
                <ClayCard className="p-6 space-y-5 border border-[#2E6F40]/40">
                  <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#E8F5E9] text-[#2E6F40] border border-[#2E6F40]/20 px-2.5 py-0.5 rounded-full">
                        AI Diagnosis Result
                      </span>
                      <h2 className="text-2xl font-black text-[#2C2825] mt-1">
                        {resultData.disease_name}
                      </h2>
                      <span className="text-xs font-bold text-[#6C665D]">
                        Crop: {resultData.crop_affected}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-[#2E6F40] block">
                        {resultData.confidence_score}%
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        resultData.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        Severity: {resultData.severity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#2C2825] mb-1">Observed Symptoms</h4>
                    <p className="text-xs text-[#6C665D] font-semibold leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8]">
                      {resultData.symptoms}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#2C2825] mb-2">Recommended Treatment Protocol</h4>
                    <div className="space-y-2">
                      {resultData.treatment_guidance?.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#2C2825] bg-[#E8F5E9]/60 p-2.5 rounded-xl border border-[#2E6F40]/30">
                          <CheckCircle2 className="w-4 h-4 text-[#2E6F40] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {resultData.preventive_measures && (
                    <div className="pt-3 border-t border-[#E5E0D8]">
                      <h4 className="text-xs font-bold uppercase text-[#2C2825] mb-1">Preventive Measures</h4>
                      <p className="text-xs text-[#6C665D] leading-relaxed">
                        {resultData.preventive_measures}
                      </p>
                    </div>
                  )}
                </ClayCard>
              )
            ) : (
              <ClayCard className="p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                <ImageIcon className="w-12 h-12 text-[#2E6F40] mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-[#2C2825]">Awaiting Leaf Photo</h3>
                <p className="text-xs text-[#6C665D] max-w-sm mt-1">
                  Upload a clear close-up picture of the affected leaf to receive automated disease diagnosis and treatment steps.
                </p>
              </ClayCard>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <ClayCard className="p-6 overflow-x-auto">
          <h3 className="text-base font-bold text-[#2C2825] mb-4">Saved Leaf Disease Records</h3>
          {history.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F3EE] text-[#2C2825] font-bold border-b border-[#E5E0D8]">
                  <th className="p-3">Diagnosed Date</th>
                  <th className="p-3">Disease / Pathology</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Parcel</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {history.map((record: any) => (
                  <tr key={record.id}>
                    <td className="p-3 text-[#6C665D]">{new Date(record.diagnosed_at).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-[#2C2825]">{record.disease_name}</td>
                    <td className="p-3 text-[#6C665D]">{record.crop_affected}</td>
                    <td className="p-3 font-bold">{record.land_name || 'General'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        record.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {record.severity}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#2E6F40]">{record.confidence_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-[#6C665D]">No disease records saved in history yet.</div>
          )}
        </ClayCard>
      )}
    </div>
  );
};
