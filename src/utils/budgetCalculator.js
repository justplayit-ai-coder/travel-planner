// 經緯度地理位置快取庫（支援東北行程、東京、關西等預設熱門地點）
export const locationGeoCache = {
  '松山機場': [25.0697, 121.5524],
  '羽田機場': [35.5494, 139.7798],
  '名鐵濱松町飯店': [35.6568, 139.7562],
  '東京濱松町名鐵飯店': [35.6568, 139.7562],
  '新青森站': [40.8283, 140.6931],
  '青森站': [40.8296, 140.7335],
  '&LOVINA': [40.8296, 140.7335],
  '青森食堂': [40.8296, 140.7335],
  'ReLabo': [40.8255, 140.7410],
  '弘前城': [40.6081, 140.4641],
  '可否屋 葡瑠満': [40.6015, 140.4722],
  '葡瑠満': [40.6015, 140.4722],
  '弘前站': [40.5992, 140.4851],
  'APPLIESE': [40.5992, 140.4851],
  '津輕じょっぱり漁屋酒場': [40.8270, 140.7380],
  '旬料理 初花': [40.8265, 140.7390],
  '八甲田': [40.7077, 140.8306],
  'おさない': [40.8288, 140.7360],
  '睡魔之家': [40.8303, 140.7351],
  'A-FACTORY': [40.8309, 140.7342],
  '花秀': [40.8242, 140.7456],
  '盛岡站': [39.7018, 141.1362],
  '盛樓閣': [39.7020, 141.1375],
  '開運橋': [39.7028, 141.1412],
  'ホテル紫苑': [39.6738, 141.0028],
  '角館': [39.5995, 140.5621],
  '武家屋敷': [39.5995, 140.5621],
  '櫻之里': [39.5982, 140.5630],
  '田澤湖': [39.7188, 140.6698],
  '辰子像': [39.7188, 140.6698],
  '仙台站': [38.2601, 140.8820],
  '仙台市區飯店': [38.2608, 140.8825],
  '飯盛山': [37.5028, 139.9575],
  '榮螺堂': [37.5028, 139.9575],
  '鶴城': [37.4878, 139.9298],
  '田季野輪箱飯': [37.4965, 139.9272],
  '野口英世青春通': [37.4960, 139.9265],
  '末廣酒造': [37.4952, 139.9242],
  '會津若松': [37.5075, 139.9300],
  '定禪寺通': [38.2655, 140.8690],
  '光之樂章': [38.2655, 140.8690],
  '一之關': [38.9265, 141.1382],
  '猊鼻溪': [38.9897, 141.2562],
  '越後湯澤': [36.9358, 138.8095],
  'むらんごっつぉ': [36.9362, 138.8080],
  '湯澤高原': [36.9392, 138.8035],
  '東映飯店': [36.9405, 138.8055],
  '酒風呂': [36.9358, 138.8095],
  'CoCoLo': [36.9358, 138.8095],
  'ぽんしゅ館': [36.9358, 138.8095],
  '中野屋': [36.9345, 138.8090]
};

// 將項目金額轉換為新台幣
export const convertItemToTWD = (amount, currency, exchangeRate) => {
  const numericAmount = Number(amount) || 0;
  if (currency === 'TWD') {
    return numericAmount;
  }
  return Math.round(numericAmount * (Number(exchangeRate) || 0.205));
};

// 計算整趟旅程的所有花費統計
export const calculateTripBudget = (trip) => {
  if (!trip) return null;

  const rate = Number(trip.exchangeRate) || 0.205;

  const categories = {
    airfare: { name: '機票', foreign: 0, twd: 0 },
    accommodation: { name: '住宿', foreign: 0, twd: 0 },
    meals: { name: '餐食', foreign: 0, twd: 0 },
    tickets: { name: '行程門票', foreign: 0, twd: 0 },
    transit: { name: '交通', foreign: 0, twd: 0 },
    miscellaneous: { name: '雜支', foreign: 0, twd: 0 }
  };

  // 1. 機票獨立計入
  if (trip.airfareAmount) {
    const airfareTWD = convertItemToTWD(trip.airfareAmount, trip.airfareCurrency || 'TWD', rate);
    if (trip.airfareCurrency === 'TWD') {
      categories.airfare.twd += airfareTWD;
    } else {
      categories.airfare.foreign += Number(trip.airfareAmount) || 0;
      categories.airfare.twd += airfareTWD;
    }
  }

  // 2. 累加每日花費
  (trip.days || []).forEach(day => {
    // 交通
    if (day.transit?.expenseAmount) {
      const amt = Number(day.transit.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.transit.currency, rate);
      if (day.transit.currency === 'TWD') categories.transit.twd += twd;
      else {
        categories.transit.foreign += amt;
        categories.transit.twd += twd;
      }
    }

    // 上午行程門票
    if (day.morning?.expenseAmount) {
      const amt = Number(day.morning.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.morning.currency, rate);
      if (day.morning.currency === 'TWD') categories.tickets.twd += twd;
      else {
        categories.tickets.foreign += amt;
        categories.tickets.twd += twd;
      }
    }

    // 下午行程門票
    if (day.afternoon?.expenseAmount) {
      const amt = Number(day.afternoon.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.afternoon.currency, rate);
      if (day.afternoon.currency === 'TWD') categories.tickets.twd += twd;
      else {
        categories.tickets.foreign += amt;
        categories.tickets.twd += twd;
      }
    }

    // 晚上行程門票
    if (day.evening?.expenseAmount) {
      const amt = Number(day.evening.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.evening.currency, rate);
      if (day.evening.currency === 'TWD') categories.tickets.twd += twd;
      else {
        categories.tickets.foreign += amt;
        categories.tickets.twd += twd;
      }
    }

    // 午餐
    if (day.lunch?.expenseAmount) {
      const amt = Number(day.lunch.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.lunch.currency, rate);
      if (day.lunch.currency === 'TWD') categories.meals.twd += twd;
      else {
        categories.meals.foreign += amt;
        categories.meals.twd += twd;
      }
    }

    // 晚餐
    if (day.dinner?.expenseAmount) {
      const amt = Number(day.dinner.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.dinner.currency, rate);
      if (day.dinner.currency === 'TWD') categories.meals.twd += twd;
      else {
        categories.meals.foreign += amt;
        categories.meals.twd += twd;
      }
    }

    // 住宿
    if (day.accommodation?.expenseAmount) {
      const amt = Number(day.accommodation.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.accommodation.currency, rate);
      if (day.accommodation.currency === 'TWD') categories.accommodation.twd += twd;
      else {
        categories.accommodation.foreign += amt;
        categories.accommodation.twd += twd;
      }
    }

    // 雜支
    if (day.miscellaneous?.expenseAmount) {
      const amt = Number(day.miscellaneous.expenseAmount) || 0;
      const twd = convertItemToTWD(amt, day.miscellaneous.currency, rate);
      if (day.miscellaneous.currency === 'TWD') categories.miscellaneous.twd += twd;
      else {
        categories.miscellaneous.foreign += amt;
        categories.miscellaneous.twd += twd;
      }
    }
  });

  // 計算總計
  let grandTotalForeign = 0;
  let grandTotalTWD = 0;

  Object.values(categories).forEach(cat => {
    grandTotalForeign += cat.foreign;
    grandTotalTWD += cat.twd;
  });

  return {
    categories,
    grandTotalForeign,
    grandTotalTWD,
    exchangeRate: rate,
    currencyName: trip.currencyName || 'JPY'
  };
};

// 提取旅程中所有有效坐標供地圖繪製 (支援單欄位多地點如「松山機場飛羽田機場」與交通欄位)
export const extractTripMapLocations = (trip, activeDayIndex = null) => {
  if (!trip || !trip.days) return [];

  // 動態匯入或直接取 LocalStorage 快取
  let dynamicCache = {};
  try {
    const dynamicSaved = localStorage.getItem('travel_planner_dynamic_geo_cache_v1');
    if (dynamicSaved) {
      dynamicCache = JSON.parse(dynamicSaved);
    }
  } catch (e) {}

  const locations = [];
  const daysToProcess = activeDayIndex !== null 
    ? trip.days.filter(d => d.dayIndex === activeDayIndex)
    : trip.days;

  daysToProcess.forEach(day => {
    // 納入交通起訖、各時段行程、餐飲與住宿
    const candidatePlaces = [
      { name: [day.transit?.details, day.transit?.trainCode].filter(Boolean).join(' '), period: '交通移動', time: '交通' },
      { name: [day.morning?.location, day.morning?.details].filter(Boolean).join(' '), period: '上午行程', time: '上午' },
      { name: [day.lunch?.location, day.lunch?.restaurant].filter(Boolean).join(' '), period: '午餐', time: '中午' },
      { name: [day.afternoon?.location, day.afternoon?.details].filter(Boolean).join(' '), period: '下午行程', time: '下午' },
      { name: [day.dinner?.location, day.dinner?.restaurant].filter(Boolean).join(' '), period: '晚餐', time: '晚間' },
      { name: [day.evening?.location, day.evening?.details].filter(Boolean).join(' '), period: '晚上行程', time: '夜間' },
      { name: day.accommodation?.name, period: '夜間住宿', time: '過夜' }
    ];

    const daySeenCoords = new Set();

    candidatePlaces.forEach((item, slotIdx) => {
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) return;

      const fullText = item.name.trim();
      const extractedKeywords = [];

      // 1. 先檢驗靜態庫與動態庫中是否有直接包含的地標
      const allKnownKeys = [
        ...Object.keys(locationGeoCache),
        ...Object.keys(dynamicCache)
      ].sort((a, b) => b.length - a.length);

      for (const key of allKnownKeys) {
        if (fullText.includes(key)) {
          if (!extractedKeywords.includes(key)) {
            extractedKeywords.push(key);
          }
        }
      }

      // 2. 若無已知地名，或文字中有交通動詞/連接詞，切分進行關鍵字萃取
      const transitVerbs = /(?:飛往|飛到|飛|搭乘.*?至|搭乘.*?到|搭.*?至|搭.*?到|步行至|步行到|直奔|前往|抵達|銜接|轉乘至|轉乘到|返抵|返回|至|到|往|回|返|~|～|->|→)/g;
      const landmarkSuffix = /([\u4e00-\u9fa5a-zA-Z0-9]{2,14}(?:機場|空港|車站|站|駅|飯店|酒店|旅館|溫泉|神社|大社|寺|城|山|湖|溪|谷|橋|高原|纜車|塔|市場|食堂|居酒屋|Outlet|廣場|公園|館|屋|店))/g;
      
      const segments = fullText.replace(transitVerbs, '\n').split(/[\n;；,，+&＆/-]/);
      for (const seg of segments) {
        const trimmed = seg.trim();
        if (trimmed.length >= 2 && trimmed.length <= 20) {
          let match;
          const re = new RegExp(landmarkSuffix);
          while ((match = re.exec(trimmed)) !== null) {
            const cand = match[1].trim();
            if (!extractedKeywords.includes(cand)) {
              extractedKeywords.push(cand);
            }
          }
          if (trimmed.length <= 12 && !extractedKeywords.includes(trimmed)) {
            extractedKeywords.push(trimmed);
          }
        }
      }

      // 如果完全沒切出關鍵字，保底用原始文字
      if (extractedKeywords.length === 0) {
        extractedKeywords.push(fullText);
      }

      // 3. 逐一比對每個候選地點並加入 locations
      extractedKeywords.forEach((kw, kwIdx) => {
        let matchedCoord = null;
        let matchedName = kw;

        // 查靜態庫
        for (const [k, coords] of Object.entries(locationGeoCache)) {
          if (kw === k || kw.includes(k) || k.includes(kw)) {
            matchedCoord = coords;
            matchedName = k;
            break;
          }
        }

        // 查動態庫
        if (!matchedCoord) {
          for (const [k, coords] of Object.entries(dynamicCache)) {
            if (kw === k || kw.includes(k) || k.includes(kw)) {
              matchedCoord = coords;
              matchedName = k;
              break;
            }
          }
        }

        if (matchedCoord) {
          const coordKey = `${matchedCoord[0].toFixed(4)},${matchedCoord[1].toFixed(4)}`;
          // 避免同一天重複推入一模一樣的坐標
          if (!daySeenCoords.has(coordKey)) {
            daySeenCoords.add(coordKey);
            locations.push({
              id: `day-${day.dayIndex}-${slotIdx}-${kwIdx}-${matchedName}`,
              dayIndex: day.dayIndex,
              date: day.date,
              name: matchedName,
              rawText: fullText,
              period: item.period,
              lat: matchedCoord[0],
              lng: matchedCoord[1]
            });
          }
        }
      });
    });
  });

  return locations;
};
