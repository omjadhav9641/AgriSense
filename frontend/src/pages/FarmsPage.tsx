import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { ClayInput } from '../components/ClayInput';
import { ClayModal } from '../components/ClayModal';
import { MapPicker } from '../components/MapPicker';
import { MapPin, Plus, FileText, Sparkles, Trash2, AlertCircle } from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddLandOpen, setIsAddLandOpen] = useState(false);
  const [isAddSoilOpen, setIsAddSoilOpen] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Land Form State
  const [landForm, setLandForm] = useState({
    land_id: `LND-${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    acreage: '10.0',
    soil_type: 'Loamy',
    location_name: '',
    latitude: 30.9010,
    longitude: 75.8573,
  });

  // New Soil Test Record Form State
  const [soilForm, setSoilForm] = useState({
    ph: 6.5,
    nitrogen: 240.0,
    phosphorus: 14.0,
    potassium: 140.0,
    organic_carbon: 0.45,
    moisture: 18.0,
    sample_date: new Date().toISOString().split('T')[0],
    lab_reference: `#${Math.floor(100000 + Math.random() * 900000)}`,
    tested_by: 'Central Soil Lab',
  });

  // Fetch Lands Query
  const { data: lands = [], isLoading } = useQuery({
    queryKey: ['lands'],
    queryFn: async () => {
      const res = await apiClient.get('/farms/lands/');
      return res.data;
    },
  });

  // Add Land Mutation
  const addLandMutation = useMutation({
    mutationFn: async (data: typeof landForm) => {
      setFormError(null);
      const res = await apiClient.post('/farms/lands/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
      setIsAddLandOpen(false);
      setFormError(null);
      setLandForm({
        land_id: `LND-${Math.floor(100000 + Math.random() * 900000)}`,
        name: '',
        acreage: '10.0',
        soil_type: 'Loamy',
        location_name: '',
        latitude: 30.9010,
        longitude: 75.8573,
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save land parcel.';
      setFormError(msg);
    },
  });

  // Add Soil Mutation
  const addSoilMutation = useMutation({
    mutationFn: async (data: typeof soilForm & { land: number }) => {
      setFormError(null);
      const res = await apiClient.post('/farms/soil-records/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
      setIsAddSoilOpen(false);
      setFormError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to log soil record.';
      setFormError(msg);
    },
  });

  // Soft Delete Land Mutation
  const deleteLandMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/farms/lands/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2C2825]">Land Parcels & Soil Records</h1>
          <p className="text-sm font-semibold text-[#6C665D]">
            Track farmland acreage, soil nutrient levels, and map pin coordinates.
          </p>
        </div>
        <ClayButton
          className="bg-[#2E6F40] hover:bg-[#1E5128]"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormError(null);
            setLandForm((prev) => ({
              ...prev,
              land_id: `LND-${Math.floor(100000 + Math.random() * 900000)}`,
            }));
            setIsAddLandOpen(true);
          }}
        >
          Add New Land Parcel
        </ClayButton>
      </div>

      {/* Parcels Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6C665D]">Loading land parcels...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lands.map((land: any) => {
            const soil = land.latest_soil_data;

            return (
              <ClayCard key={land.id} className="p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E6F40] bg-[#E8F5E9] border border-[#2E6F40]/20 px-2.5 py-0.5 rounded-full">
                        {land.land_id}
                      </span>
                      <h3 className="text-xl font-bold text-[#2C2825] mt-1">{land.name}</h3>
                      <p className="text-xs text-[#6C665D] flex items-center gap-1 mt-0.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#C86D3B]" /> {land.location_name} &bull; {land.acreage} Acres &bull; {land.soil_type}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteLandMutation.mutate(land.id)}
                      className="p-2 text-[#6C665D] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Soft delete parcel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Latest Soil Record Details */}
                  {soil ? (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2C2825]">Lab Ref: {soil.lab_reference}</span>
                        <span className="text-[#6C665D]">Tested: {soil.sample_date}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-white border border-[#E5E0D8]">
                          <span className="text-[10px] text-[#6C665D] font-bold block uppercase">pH</span>
                          <span className="font-black text-[#2E6F40]">{soil.ph}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#E5E0D8]">
                          <span className="text-[10px] text-[#6C665D] font-bold block uppercase">Nitrogen</span>
                          <span className="font-black text-[#2C2825]">{soil.nitrogen} ppm</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#E5E0D8]">
                          <span className="text-[10px] text-[#6C665D] font-bold block uppercase">Phosphorus</span>
                          <span className="font-black text-[#2C2825]">{soil.phosphorus} ppm</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] text-center text-xs text-[#6C665D]">
                      No soil health records logged yet for this parcel.
                    </div>
                  )}
                </div>

                {/* Parcel Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E0D8]">
                  {soil ? (
                    <>
                      <Link to={`/report/${soil.id}`} className="flex-1">
                        <ClayButton variant="outline" size="sm" className="w-full" icon={<FileText className="w-4 h-4" />}>
                          Soil PDF Report
                        </ClayButton>
                      </Link>
                      <Link to={`/recommendations/${soil.id}`} className="flex-1">
                        <ClayButton size="sm" className="w-full bg-[#2E6F40] hover:bg-[#1E5128]" icon={<Sparkles className="w-4 h-4" />}>
                          AI Advisory
                        </ClayButton>
                      </Link>
                    </>
                  ) : (
                    <ClayButton
                      size="sm"
                      className="w-full bg-[#2E6F40] hover:bg-[#1E5128]"
                      onClick={() => {
                        setFormError(null);
                        setSelectedLandId(land.id);
                        setIsAddSoilOpen(true);
                      }}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Log Soil Test Record
                    </ClayButton>
                  )}
                </div>
              </ClayCard>
            );
          })}
        </div>
      )}

      {/* Modal: Add Land Parcel with Leaflet Map Picker */}
      <ClayModal isOpen={isAddLandOpen} onClose={() => setIsAddLandOpen(false)} title="Register New Land Parcel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addLandMutation.mutate(landForm);
          }}
          className="space-y-4"
        >
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <ClayInput
            label="Parcel ID Code"
            value={landForm.land_id}
            onChange={(e) => setLandForm({ ...landForm, land_id: e.target.value })}
            required
          />

          <ClayInput
            label="Parcel / Farm Name"
            placeholder="e.g. Green Fields Block B"
            value={landForm.name}
            onChange={(e) => setLandForm({ ...landForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <ClayInput
              label="Acreage (Acres)"
              type="number"
              step="0.01"
              value={landForm.acreage}
              onChange={(e) => setLandForm({ ...landForm, acreage: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-[#6C665D] uppercase tracking-wider pl-1">
                Soil Type
              </label>
              <select
                className="clay-input"
                value={landForm.soil_type}
                onChange={(e) => setLandForm({ ...landForm, soil_type: e.target.value })}
              >
                <option value="Loamy">Loamy Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Black">Black Soil</option>
                <option value="Red">Red Soil</option>
                <option value="Clay">Clay Soil</option>
                <option value="Sandy">Sandy Soil</option>
              </select>
            </div>
          </div>

          <ClayInput
            label="Location Name"
            placeholder="e.g. Nashik, Maharashtra"
            value={landForm.location_name}
            onChange={(e) => setLandForm({ ...landForm, location_name: e.target.value })}
            required
          />

          {/* Leaflet Map Picker */}
          <div>
            <label className="text-xs font-semibold text-[#6C665D] uppercase tracking-wider pl-1 mb-1.5 block">
              Set Coordinates via Map Pin
            </label>
            <MapPicker
              latitude={landForm.latitude}
              longitude={landForm.longitude}
              onLocationSelect={(lat, lng) => setLandForm({ ...landForm, latitude: lat, longitude: lng })}
            />
            <div className="text-[11px] text-[#6C665D] mt-1 pl-1 font-semibold">
              Selected Lat: {landForm.latitude.toFixed(4)}, Lng: {landForm.longitude.toFixed(4)}
            </div>
          </div>

          <ClayButton type="submit" className="w-full mt-4 bg-[#2E6F40] hover:bg-[#1E5128]" disabled={addLandMutation.isPending}>
            {addLandMutation.isPending ? 'Saving Parcel...' : 'Create Parcel'}
          </ClayButton>
        </form>
      </ClayModal>

      {/* Modal: Log Soil Test Record */}
      <ClayModal isOpen={isAddSoilOpen} onClose={() => setIsAddSoilOpen(false)} title="Log Soil Laboratory Test">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedLandId) {
              addSoilMutation.mutate({ ...soilForm, land: selectedLandId });
            }
          }}
          className="space-y-4"
        >
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <ClayInput
              label="Lab Reference #"
              value={soilForm.lab_reference}
              onChange={(e) => setSoilForm({ ...soilForm, lab_reference: e.target.value })}
              required
            />
            <ClayInput
              label="Sample Date"
              type="date"
              value={soilForm.sample_date}
              onChange={(e) => setSoilForm({ ...soilForm, sample_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ClayInput
              label="Soil pH"
              type="number"
              step="0.1"
              value={soilForm.ph}
              onChange={(e) => setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) })}
              required
            />
            <ClayInput
              label="Nitrogen (ppm)"
              type="number"
              step="1"
              value={soilForm.nitrogen}
              onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseFloat(e.target.value) })}
              required
            />
            <ClayInput
              label="Phosphorus (ppm)"
              type="number"
              step="1"
              value={soilForm.phosphorus}
              onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ClayInput
              label="Potassium (ppm)"
              type="number"
              step="1"
              value={soilForm.potassium}
              onChange={(e) => setSoilForm({ ...soilForm, potassium: parseFloat(e.target.value) })}
              required
            />
            <ClayInput
              label="Organic Carbon (%)"
              type="number"
              step="0.01"
              value={soilForm.organic_carbon}
              onChange={(e) => setSoilForm({ ...soilForm, organic_carbon: parseFloat(e.target.value) })}
              required
            />
            <ClayInput
              label="Moisture (%)"
              type="number"
              step="0.1"
              value={soilForm.moisture}
              onChange={(e) => setSoilForm({ ...soilForm, moisture: parseFloat(e.target.value) })}
              required
            />
          </div>

          <ClayButton type="submit" className="w-full mt-4 bg-[#2E6F40] hover:bg-[#1E5128]" disabled={addSoilMutation.isPending}>
            {addSoilMutation.isPending ? 'Logging Record...' : 'Save Soil Test Record'}
          </ClayButton>
        </form>
      </ClayModal>
    </div>
  );
};
