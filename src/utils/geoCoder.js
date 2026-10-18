// 動態地理編碼與地點快取管理工具（結合本機快取與 OpenStreetMap Nominatim 服務）
import { locationGeoCache } from './budgetCalculator';

const LOCAL_STORAGE_GEO_KEY = 'travel_planner_dynamic_geo_cache_v1';

// 讀取本機持久化的動態座標庫
export const getDynamicGeoCache = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_GEO_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

// 儲存新的地點座標至本機快取
export const saveDynamicGeoCache = (keyword, coords) => {
  if (!keyword || !coords || coords.length !== 2) return;
  try {
    const cache = getDynamicGeoCache();
    cache[keyword.trim()] = coords;
    localStorage.setItem(LOCAL_STORAGE_GEO_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('無法寫入本機地理快取:', e);
  }
};

// 停用詞與非地點關鍵字過濾
const STOP_WORDS = new Set([
  '上午', '下午', '晚上', '早晨', '午餐', '晚餐', '抵達', '出發', '散策', 
  '搭乘', '前往', '辦理', '入住', '退房', '採買', '休息', '放鬆', '準備',
  '預約', '自由活動', '拍照', '直達', '轉乘', '銜接', '時間', '班次', '備案'
]);

// 從一段隨意輸入的多行文字中，智慧擷取出潛在的地點名稱
export const extractLocationKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  const candidates = [];
  // 1. 依行、分號、逗號、括號、箭頭切分 (連字號置於集合末尾，符合 ECMAScript 規範)
  const segments = text
    .replace(/->|→/g, '\n')
    .split(/[\n;；,，+&＆/-]/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    // 過濾純時間、純車次、純數字（例如 09:36-12:34、4h 45m、15m、100円）
    if (/^\d{1,2}:\d{2}/.test(seg)) continue;
    if (/^\d+h\s*\d+m/i.test(seg)) continue;
    if (/^\d+m$/i.test(seg)) continue;
    if (/^\d+[円元分]/.test(seg)) continue;
    if (seg.length < 2 || seg.length > 25) continue;

    // 清理括號與前綴
    let cleaned = seg.replace(/^[【\[(（].*?[】\])）]/g, '').trim();
    cleaned = cleaned.replace(/[【\[(（].*?[】\])）]$/g, '').trim();
    // 移除常見動詞前綴
    cleaned = cleaned.replace(/^(前往|搭乘|抵達|遊覽|散策|參訪|至|在)\s*/g, '').trim();

    if (cleaned.length >= 2 && !STOP_WORDS.has(cleaned)) {
      candidates.push(cleaned);
    }
  }

  // 去重並回傳前 5 個最有潛力的候選地點
  return Array.from(new Set(candidates)).slice(0, 5);
};

// 查詢單一地點座標（優先查靜態庫 -> 查 LocalStorage -> 線上 OpenStreetMap Nominatim）
export const resolveLocationCoords = async (rawKeyword) => {
  if (!rawKeyword || typeof rawKeyword !== 'string') return null;
  const keyword = rawKeyword.trim();

  // 1. 查詢內建靜態快取
  for (const [key, coords] of Object.entries(locationGeoCache)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return { keyword, coords, source: 'static' };
    }
  }

  // 2. 查詢 LocalStorage 動態快取
  const dynamicCache = getDynamicGeoCache();
  for (const [key, coords] of Object.entries(dynamicCache)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return { keyword, coords, source: 'cached' };
    }
  }

  // 3. 呼叫 OpenStreetMap Nominatim 進行動態線上地理編碼
  try {
    // 加上 Japan 優先檢索提示（若包含日文或東北相關關鍵字）
    const query = encodeURIComponent(keyword);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&accept-language=zh-TW,ja,en`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        const coords = [lat, lng];
        // 儲存至本機動態快取
        saveDynamicGeoCache(keyword, coords);
        return { keyword, coords, source: 'nominatim' };
      }
    }
  } catch (err) {
    console.warn(`地理編碼查詢失敗 [${keyword}]:`, err);
  }

  return null;
};
