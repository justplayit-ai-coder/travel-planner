import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { extractTripMapLocations } from '../utils/budgetCalculator';
import { Layers, MapPin, Navigation } from 'lucide-react';

// 修復 Leaflet 預設 Marker 圖示遺失問題
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 自動調整地圖視野至包含所有標記點
function AutoFitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [locations, map]);
  return null;
}

export default function LeafletMapVisualizer({ trip, activeDayIndex, onCloseMap }) {
  const [filterDay, setFilterDay] = useState(activeDayIndex || null);

  useEffect(() => {
    if (activeDayIndex) {
      setFilterDay(activeDayIndex);
    }
  }, [activeDayIndex]);

  const mapLocations = useMemo(() => {
    return extractTripMapLocations(trip, filterDay);
  }, [trip, filterDay]);

  const defaultCenter = mapLocations.length > 0 
    ? [mapLocations[0].lat, mapLocations[0].lng] 
    : [38.5, 140.5]; // 預設日本東北或台灣

  const routePolyline = mapLocations.map(loc => [loc.lat, loc.lng]);

  return (
    <div className="map-panel glass-panel">
      <div className="map-toolbar">
        <div className="map-title-wrap">
          <Navigation size={18} className="map-nav-icon" />
          <span className="map-title">行程地理視覺化地圖 (Leaflet + OSM)</span>
        </div>

        {/* 天數過濾器 */}
        <div className="map-filters">
          <button 
            onClick={() => setFilterDay(null)}
            className={`map-filter-chip ${filterDay === null ? 'active' : ''}`}
          >
            全部天數
          </button>
          {(trip.days || []).map(d => (
            <button
              key={d.dayIndex}
              onClick={() => setFilterDay(d.dayIndex)}
              className={`map-filter-chip ${filterDay === d.dayIndex ? 'active' : ''}`}
            >
              Day {d.dayIndex}
            </button>
          ))}
        </div>
      </div>

      <div className="leaflet-wrapper">
        <MapContainer 
          center={defaultCenter} 
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 貢獻者'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapLocations.map((loc, idx) => (
            <Marker key={loc.id || idx} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="map-popup-card">
                  <div className="popup-day-tag">Day {loc.dayIndex} · {loc.period}</div>
                  <strong className="popup-name">{loc.name}</strong>
                  <div className="popup-date">{loc.date}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {routePolyline.length > 1 && (
            <Polyline
              positions={routePolyline}
              color="#6366f1"
              weight={4}
              opacity={0.8}
              dashArray="6, 8"
            />
          )}

          <AutoFitBounds locations={mapLocations} />
        </MapContainer>
      </div>

      {mapLocations.length === 0 && (
        <div className="no-markers-hint">
          目前地點尚無快取經緯度，請於行程中填入日本景點如「新青森站、弘前城、八甲田山」等或自訂地址。
        </div>
      )}
    </div>
  );
}
