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
  '預約', '自由活動', '拍照', '直達', '轉乘', '銜接', '時間', '班次', '備案',
  '普通', '快速', '特急', '新幹線', '專車', '巴士', '計程車', '跳表', '包車',
  '直飛', '直航', '去程', '回程', '連泊', '雙人房', '和室', '大餐', '美食'
]);

// 旅遊常用交通動詞與連接介詞正則 (用於切分航線與起訖點)
const TRANSIT_VERBS_REGEX = /(?:飛往|飛到|飛|搭乘.*?至|搭乘.*?到|搭.*?至|搭.*?到|步行至|步行到|直奔|前往|抵達|銜接|轉乘至|轉乘到|返抵|返回|至|到|往|回|返|~|～|->|→)/g;

// 地名實體特徵後綴 (常見旅遊地標、車站、景點、住宿)
const LANDMARK_SUFFIX_REGEX = /([\u4e00-\u9fa5a-zA-Z0-9]{2,14}(?:機場|空港|車站|站|駅|飯店|酒店|旅館|溫泉|神社|大社|寺|城|山|湖|溪|谷|橋|高原|纜車|塔|市場|食堂|居酒屋|Outlet|廣場|公園|館|屋|店))/g;

// 從一段隨意輸入的多行文字中，智慧擷取出所有潛在地點名稱
export const extractLocationKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  const foundSet = new Set();
  const rawText = text.trim();

  // 1. 第一層：掃描已知靜態地標庫 (按長度排序，優先匹配最完整地名)
  const allKnownKeys = Object.keys(locationGeoCache).sort((a, b) => b.length - a.length);
  for (const key of allKnownKeys) {
    if (rawText.includes(key)) {
      foundSet.add(key);
    }
  }

  // 2. 第二層：掃描 LocalStorage 動態快取庫
  const dynamicCache = getDynamicGeoCache();
  const dynamicKeys = Object.keys(dynamicCache).sort((a, b) => b.length - a.length);
  for (const key of dynamicKeys) {
    if (rawText.includes(key)) {
      foundSet.add(key);
    }
  }

  // 3. 第三層：利用動詞切分長句，並利用後綴正則萃取潛在地點
  const preprocessed = rawText.replace(TRANSIT_VERBS_REGEX, '\n');
  const segments = preprocessed
    .split(/[\n;；,，+&＆/-]/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    // 過濾純時間、純車次、純數字（例如 09:36-12:34、4h 45m、15m、100円）
    if (/^\d{1,2}:\d{2}/.test(seg)) continue;
    if (/^\d+h\s*\d+m/i.test(seg)) continue;
    if (/^\d+m$/i.test(seg)) continue;
    if (/^\d+[円元分]/.test(seg)) continue;
    if (seg.length < 2 || seg.length > 30) continue;

    // 後綴特徵比對
    let match;
    const regexClone = new RegExp(LANDMARK_SUFFIX_REGEX);
    while ((match = regexClone.exec(seg)) !== null) {
      const candidate = match[1].trim();
      if (!STOP_WORDS.has(candidate)) {
        foundSet.add(candidate);
      }
    }

    // 清理括號與前綴短詞
    let cleaned = seg.replace(/^[【\[(（].*?[】\])）]/g, '').trim();
    cleaned = cleaned.replace(/[【\[(（].*?[】\])）]$/g, '').trim();
    cleaned = cleaned.replace(/^(前往|搭乘|抵達|遊覽|散策|參訪|至|在)\s*/g, '').trim();

    if (cleaned.length >= 2 && cleaned.length <= 15 && !STOP_WORDS.has(cleaned) && !/^\d+/.test(cleaned)) {
      foundSet.add(cleaned);
    }
  }

  // 4. 清洗與過濾噪聲 (若集合中已存在「羽田機場」，過濾掉更長且帶噪聲的「羽田機場 18:25」)
  const candidateList = Array.from(foundSet);
  const cleanResults = candidateList.filter(item => {
    // 檢查是否有另一個更高精確度的短地名被包含在此項目中且此項目包含數字/符號
    for (const other of candidateList) {
      if (other !== item && item.includes(other)) {
        if (/\d+/.test(item) || item.length > other.length + 5) {
          return false;
        }
      }
    }
    return true;
  });

  return cleanResults.slice(0, 10);
};

// 查詢單一地點座標（優先查靜態庫 -> 查 LocalStorage -> 線上 OpenStreetMap Nominatim）
export const resolveLocationCoords = async (rawKeyword) => {
  if (!rawKeyword || typeof rawKeyword !== 'string') return null;
  const keyword = rawKeyword.trim();

  // 1. 查詢內建靜態快取
  for (const [key, coords] of Object.entries(locationGeoCache)) {
    if (keyword === key || keyword.includes(key) || key.includes(keyword)) {
      return { keyword: key, coords, source: 'static' };
    }
  }

  // 2. 查詢 LocalStorage 動態快取
  const dynamicCache = getDynamicGeoCache();
  for (const [key, coords] of Object.entries(dynamicCache)) {
    if (keyword === key || keyword.includes(key) || key.includes(keyword)) {
      return { keyword: key, coords, source: 'cached' };
    }
  }

  // 3. 呼叫 OpenStreetMap Nominatim 進行動態線上地理編碼
  try {
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
