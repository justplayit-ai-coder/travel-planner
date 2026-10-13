import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to auto-fit map bounds
const MapBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
};

const MapVisualizer = ({ locations }) => {
  const defaultCenter = [23.5, 121]; // Default to Taiwan
  const zoom = 7;

  // Extract latlngs for polyline
  const routePoints = locations.map(loc => [loc.lat, loc.lng]);

  return (
    <div className="map-container glass-panel">
      <MapContainer center={defaultCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc, index) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>{loc.name}</strong><br/>
              {loc.date && <span>Date: {loc.date}</span>}
            </Popup>
          </Marker>
        ))}

        {locations.length > 1 && (
          <Polyline 
            positions={routePoints} 
            color="var(--primary)" 
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        <MapBounds locations={locations} />
      </MapContainer>
    </div>
  );
};

export default MapVisualizer;
