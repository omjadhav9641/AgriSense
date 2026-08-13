import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { SoilScoreGauge } from '../components/SoilScoreGauge';
import {
  MapPin,
  CloudSun,
  FileText,
  ShoppingBag,
  Landmark,
  ArrowRight,
  Wind,
  Droplets,
  Navigation,
  Sparkles,
  Activity,
  Store,
  AlertCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Selected weather source: 'gps' or `land_${land.id}`
  const [weatherSource, setWeatherSource] = useState<string>('gps');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(true);

  // Fetch farmer lands
  const { data: landsData } = useQuery({
    queryKey: ['lands'],
    queryFn: async () => {
      const res = await apiClient.get('/farms/lands/');
      return res.data;
    },
  });

  const lands = Array.isArray(landsData) ? landsData : (landsData?.results || []);
  const primaryLand = lands[0];
  const latestSoil = primaryLand?.latest_soil_data;

  // Request browser Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setIsGpsLoading(false);
      if (primaryLand) setWeatherSource(`land_${primaryLand.id}`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let placeName = `GPS (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;

        try {
          // Reverse geocode using OpenStreetMap Nominatim
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'User-Agent': 'AgriSense/1.0' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state;
            if (city) {
              placeName = `${city}, ${addr.country || ''}`.trim().replace(/,\s*$/, '');
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding warning:', e);
        }

        setGpsLocation({ lat, lng, name: placeName });
        setIsGpsLoading(false);
      },
      (error) => {
        console.warn('Geolocation permission denied or unavailable:', error.message);
        setGpsError('Location permission denied or unavailable');
        setIsGpsLoading(false);
        if (primaryLand) {
          setWeatherSource(`land_${primaryLand.id}`);
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  // Determine active weather coordinates & location name
  let targetLat: number | null = null;
  let targetLng: number | null = null;
  let activeLocationLabel = '';

  if (weatherSource === 'gps') {
    if (gpsLocation) {
      targetLat = gpsLocation.lat;
      targetLng = gpsLocation.lng;
      activeLocationLabel = gpsLocation.name;
    } else if (primaryLand) {
      targetLat = primaryLand.latitude;
      targetLng = primaryLand.longitude;
      activeLocationLabel = `${primaryLand.name} (${primaryLand.location_name})`;
    }
  } else if (weatherSource.startsWith('land_')) {
    const selectedLandId = parseInt(weatherSource.replace('land_', ''), 10);
    const selectedLand = lands.find((l: any) => l.id === selectedLandId);
    if (selectedLand) {
      targetLat = selectedLand.latitude;
      targetLng = selectedLand.longitude;
      activeLocationLabel = `${selectedLand.name} (${selectedLand.location_name})`;
    }
  }

  // Fetch weather data for target coordinates
  const { data: weather, isLoading: isWeatherLoading } = useQuery({
    queryKey: ['weather', targetLat, targetLng],
    queryFn: async () => {
      if (targetLat === null || targetLng === null) return null;
      const res = await apiClient.get(`/weather/?lat=${targetLat}&lng=${targetLng}`);
      return res.data;
    },
    enabled: targetLat !== null && targetLng !== null,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Redesigned Unified Full-Bleed Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] md:min-h-[420px] flex items-center justify-center border border-[#E5E0D8]">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
          alt="AgriSense Precision Field Visual"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000"
        />

        {/* Gradient Scrim for optimal text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25 md:from-black/80 md:via-black/50 md:to-black/15" />

        {/* Unified Hero Overlay */}
        <div className="relative z-10 w-full max-w-5xl px-6 py-10 md:px-12 md:py-14 text-left space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E8F5E9] bg-[#2E6F40]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#A3E635]" /> Welcome back, {user?.role || 'Farmer'}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md max-w-3xl">
            AgriSense Precision Agriculture Portal
          </h1>

          <p className="text-sm md:text-base font-medium text-stone-200 leading-relaxed max-w-2xl drop-shadow-xs">
            Real-time parcel diagnostics, ML leaf pathology detection, live Open-Meteo microclimate analytics, and direct produce marketplace.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {latestSoil && (
              <Link to={`/report/${latestSoil.id}`}>
                <ClayButton className="bg-[#2E6F40] hover:bg-[#1E5128] text-white shadow-lg text-sm px-6 py-3.5" icon={<FileText className="w-4.5 h-4.5" />}>
                  View Baseline Report #000002
                </ClayButton>
              </Link>
            )}
            <Link to="/farms">
              <ClayButton variant="outline" className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 text-sm px-6 py-3.5" icon={<MapPin className="w-4.5 h-4.5" />}>
                Manage Land Parcels
              </ClayButton>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Visual Hierarchy: Weather Widget (Sky Blue) + Soil Health Index Card (Crop Green / Earth) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Weather Widget (2 cols) */}
        <ClayCard className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E0D8] pb-4 mb-5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shadow-xs">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2C2825]">Live Local & Parcel Weather</h3>
                  <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> {activeLocationLabel || 'Detecting location...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-extrabold text-[#6C665D] uppercase tracking-wider">Weather For:</label>
                <select
                  className="clay-input text-xs font-bold py-2 px-3 rounded-xl bg-white border border-[#E5E0D8] focus:ring-[#2563EB]"
                  value={weatherSource}
                  onChange={(e) => setWeatherSource(e.target.value)}
                >
                  <option value="gps">
                    📍 My Live Location {gpsLocation ? `(${gpsLocation.name})` : '(GPS)'}
                  </option>
                  {lands.map((l: any) => (
                    <option key={l.id} value={`land_${l.id}`}>
                      🌱 Parcel: {l.name} ({l.location_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {targetLat === null && targetLng === null ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] space-y-2">
                <AlertCircle className="w-8 h-8 text-[#C86D3B] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#2C2825]">No Location Available</h4>
                <p className="text-xs text-[#6C665D]">
                  Add a land parcel or allow browser location access to view live weather forecasts.
                </p>
              </div>
            ) : isWeatherLoading || isGpsLoading ? (
              <div className="py-12 text-center text-xs text-[#6C665D] font-semibold">Fetching live Open-Meteo weather data...</div>
            ) : weather ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F8FF] p-4 md:p-5 rounded-2xl border border-[#DBEAFE]">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl md:text-5xl font-black text-[#2C2825]">
                      {weather.current?.temperature?.toFixed(1)}°C
                    </span>
                    <div className="text-xs text-[#6C665D] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                        <Droplets className="w-4 h-4" /> Humidity: {weather.current?.humidity}%
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <Wind className="w-4 h-4 text-slate-500" /> Wind: {weather.current?.wind_speed} km/h
                      </div>
                    </div>
                  </div>

                  {weather.alerts?.summary?.length > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold max-w-xs shadow-xs">
                      ⚠️ {weather.alerts.summary[0]}
                    </div>
                  )}
                </div>

                {/* 5-Day Microclimate Strip */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#6C665D] mb-3">
                    5-Day Microclimate Forecast
                  </h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {weather.daily?.temperature_2m_max?.slice(0, 5).map((maxTemp: number, i: number) => {
                      const isToday = i === 0;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-2xl text-center transition-all ${
                            isToday
                              ? 'bg-[#DBEAFE] border-2 border-[#2563EB] shadow-xs scale-102'
                              : 'bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#2563EB]/40 hover:scale-102'
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase block ${isToday ? 'text-[#2563EB]' : 'text-[#6C665D]'}`}>
                            {isToday ? 'Today (Day 1)' : `Day ${i + 1}`}
                          </span>
                          <span className="text-base font-black text-[#2C2825] block mt-1">
                            {maxTemp.toFixed(0)}°C
                          </span>
                          <span className="text-[10px] text-[#2563EB] font-extrabold block mt-0.5">
                            {weather.daily?.temperature_2m_min?.[i]?.toFixed(0)}° Min
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#6C665D]">Weather data unavailable for selected location.</div>
            )}
          </div>
        </ClayCard>

        {/* Soil Health Score Gauge Card */}
        <ClayCard className="p-6 md:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-[#2C2825]">
                Soil Health Index
              </h3>
              <span className="text-xs font-black text-[#1E5128] bg-[#E8F5E9] border border-[#2E6F40]/20 px-2.5 py-0.5 rounded-full">
                Optimal
              </span>
            </div>

            {latestSoil ? (
              <div className="text-center space-y-4">
                <SoilScoreGauge score={latestSoil.health_score} statusText="Soil Index Optimal" />

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6C665D] font-semibold">Lab Reference:</span>
                    <span className="font-bold text-[#2C2825]">{latestSoil.lab_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C665D] font-semibold">Soil pH Value:</span>
                    <span className="font-extrabold text-[#2E6F40]">{latestSoil.ph} (Optimal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C665D] font-semibold">Tested Date:</span>
                    <span className="font-bold text-[#2C2825]">{latestSoil.sample_date}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#6C665D]">No soil records available.</div>
            )}
          </div>

          {latestSoil && (
            <Link to={`/recommendations/${latestSoil.id}`} className="w-full mt-4">
              <ClayButton variant="secondary" className="w-full py-3 text-xs uppercase tracking-wider bg-[#C86D3B] hover:bg-[#9E4A20]" icon={<ArrowRight className="w-4 h-4" />}>
                View AI Recommendation
              </ClayButton>
            </Link>
          )}
        </ClayCard>
      </div>

      {/* 3. Category Navigation Grid with Semantic Tints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/quick-recommendation">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E6F40] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Quick AI Match</h4>
                <p className="text-xs text-[#6C665D] font-semibold">Fast ML Crop Inference</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>

        <Link to="/disease-detection">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Plant Disease AI</h4>
                <p className="text-xs text-[#6C665D] font-semibold">Photo Leaf Pathology</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>

        <Link to="/marketplace">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#9E6B0D] flex items-center justify-center shrink-0 shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Produce Marketplace</h4>
                <p className="text-xs text-[#6C665D] font-semibold">Direct Produce Sales</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>

        <Link to="/farms">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF2E9] text-[#C86D3B] flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Land & Soil Parcels</h4>
                <p className="text-xs text-[#6C665D] font-semibold">{lands.length} Registered Parcels</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>

        <Link to="/store">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#9E6B0D] flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Agri E-Store</h4>
                <p className="text-xs text-[#6C665D] font-semibold">Fertilizers & Seeds</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>

        <Link to="/schemes">
          <ClayCard hoverable className="p-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8FF] text-[#2B6CB0] flex items-center justify-center shrink-0 shadow-xs">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C2825] text-base">Gov Portals</h4>
                <p className="text-xs text-[#6C665D] font-semibold">e-NAM & PM-KISAN</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#6C665D] shrink-0" />
          </ClayCard>
        </Link>
      </div>
    </div>
  );
};
