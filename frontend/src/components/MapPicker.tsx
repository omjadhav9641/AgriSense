import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<{
  position: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position[0] !== 0 ? <Marker position={position} /> : null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onLocationSelect }) => {
  const defaultPos: [number, number] = [latitude || 20.5937, longitude || 78.9629]; // Default to India center

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-[#E2DDD3]">
      <MapContainer
        center={defaultPos}
        zoom={latitude ? 11 : 5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={[latitude, longitude]} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};
