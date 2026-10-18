import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { extractTripMapLocations } from '../utils/budgetCalculator';
import { extractLocationKeywords, resolveLocationCoords, saveDynamicGeoCache } from '../utils/geoCoder';
import { Navigation, X, Search, Plus, MapPin, Loader2, Sparkles } from 'lucide-react';

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

// 建立依行程順序 1, 2, 3... 編號的數字圖釘圖示
const createNumberedMarkerIcon = (number) => {
  return L.divIcon({
    className: 'custom-numbered-marker-wrapper',
    html: `
      <div class="marker-pin-badge">
        <span class="marker-number-text">${number}</span>
      </div>
    `,
    iconSize: [28, 34],
    iconAnchor: [14, 34],
    popupAnchor: [0, -32]
  });
};

export default function LeafletMapVisualizer({ trip, activeDayIndex, onCloseMap }) {
  const [filterDay, setFilterDay] = useState(activeDayIndex || null);
  const [geoVersion, setGeoVersion] = useState(0); // 供動態解析後觸發重新計算
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  useEffect(() => {
    if (activeDayIndex) {
      setFilterDay(activeDayIndex);
    }
  }, [activeDayIndex]);

  // 背景自動地理編碼：掃描行程卡片文字中的潛在地點並自動請求 OpenStreetMap 補充座標
  const scannedKeywordsRef = useRef(new Set());

  useEffect(() => {
    if (!trip || !trip.days) return;

    let isMounted = true;
    const pendingKeywords = [];

    trip.days.forEach(day => {
      const texts = [
        day.morning?.location, day.morning?.details,
        day.lunch?.location, day.lunch?.restaurant,
        day.afternoon?.location, day.afternoon?.details,
        day.dinner?.location, day.dinner?.restaurant,
        day.evening?.location, day.evening?.details,
        day.accommodation?.name,
        day.transit?.details
      ].filter(Boolean);

      texts.forEach(txt => {
        const words = extractLocationKeywords(txt);
        words.forEach(w => {
          if (!scannedKeywordsRef.current.has(w)) {
            scannedKeywordsRef.current.add(w);
            pendingKeywords.push(w);
          }
        });
      });
    });

    if (pendingKeywords.length === 0) return;

    // 非同步逐一解析，間隔 600ms 避免觸發 OpenStreetMap Rate Limit
    const resolvePending = async () => {
      setIsAutoDetecting(true);
      let foundAny = false;
      for (const kw of pendingKeywords) {
        if (!isMounted) break;
        try {
          const res = await resolveLocationCoords(kw);
          if (res && res.coords) {
            foundAny = true;
          }
        } catch (e) {}
        // 間隔延遲
        await new Promise(r => setTimeout(r, 600));
      }
      if (isMounted) {
        setIsAutoDetecting(false);
        if (foundAny) {
          setGeoVersion(v => v + 1);
        }
      }
    };

    resolvePending();

    return () => {
      isMounted = false;
    };
  }, [trip]);

  // 取得當前過濾天數之所有可視座標點位
  const mapLocations = useMemo(() => {
    return extractTripMapLocations(trip, filterDay);
  }, [trip, filterDay, geoVersion]);

  const defaultCenter = mapLocations.length > 0 
    ? [mapLocations[0].lat, mapLocations[0].lng] 
    : [38.5, 140.5];

  const routePolyline = mapLocations.map(loc => [loc.lat, loc.lng]);

  // 手動自訂地點即時搜尋
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const res = await resolveLocationCoords(searchQuery.trim());
      if (res && res.coords) {
        saveDynamicGeoCache(searchQuery.trim(), res.coords);
        setGeoVersion(v => v + 1);
        setSearchQuery('');
      } else {
        setSearchError('未找到該地點座標，請嘗試更具體之關鍵字（如加上城市或車站）');
      }
    } catch (err) {
      setSearchError('地點搜尋服務連線異常');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map-panel glass-panel">
      {/* 地圖工具列頂部 */}
      <div className="map-toolbar">
        <div className="map-title-wrap">
          <Navigation size={18} className="map-nav-icon" />
          <span className="map-title">地理路徑圖 (自動偵測)</span>
          {isAutoDetecting && (
            <span className="auto-detect-indicator" title="正在自動解析新輸入的地點座標...">
              <Loader2 size={13} className="spin-icon" />
              <span>偵測新地點中</span>
            </span>
          )}
        </div>

        {/* 天數過濾器與收合按鈕 */}
        <div className="map-toolbar-right">
          <div className="map-filters">
            <button 
              onClick={() => setFilterDay(null)}
              className={`map-filter-chip ${filterDay === null ? 'active' : ''}`}
            >
              全部
            </button>
            {(trip.days || []).map(d => (
              <button
                key={d.dayIndex}
                onClick={() => setFilterDay(d.dayIndex)}
                className={`map-filter-chip ${filterDay === d.dayIndex ? 'active' : ''}`}
              >
                D{d.dayIndex}
              </button>
            ))}
          </div>
          {onCloseMap && (
            <button onClick={onCloseMap} className="btn-icon map-close-btn" title="收起地圖">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 地點即時搜尋與圖釘釘選工具列 */}
      <form onSubmit={handleSearchLocation} className="map-search-bar">
        <div className="search-input-group">
          <Search size={14} className="search-icon" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="輸入任何新地點/景點立即標記 (例: 輕井澤Outlet、晴空塔)..."
            className="map-search-input"
          />
        </div>
        <button 
          type="submit" 
          disabled={isSearching || !searchQuery.trim()} 
          className="btn btn-sm btn-primary map-search-submit"
        >
          {isSearching ? <Loader2 size={13} className="spin-icon" /> : <Plus size={13} />}
          <span>標記至地圖</span>
        </button>
      </form>

      {searchError && (
        <div className="search-error-toast">{searchError}</div>
      )}

      {/* 地圖繪製核心容器 */}
      <div className="leaflet-wrapper">
        <MapContainer 
          center={defaultCenter} 
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapLocations.map((loc, idx) => (
            <Marker 
              key={loc.id || `${loc.lat}-${loc.lng}-${idx}`} 
              position={[loc.lat, loc.lng]}
              icon={createNumberedMarkerIcon(idx + 1)}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="popup-day-tag">
                    <span className="popup-order-badge">#{idx + 1}</span>
                    <span>Day {loc.dayIndex} · {loc.period}</span>
                  </div>
                  <strong className="popup-name">{loc.name}</strong>
                  {loc.rawText && loc.rawText !== loc.name && (
                    <div className="popup-raw-text">{loc.rawText}</div>
                  )}
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
          目前尚未解析到有效坐標。請於行程文字中輸入景點名稱（系統會自動線上解析），或於上方搜尋欄手動新增。
        </div>
      )}
    </div>
  );
}
