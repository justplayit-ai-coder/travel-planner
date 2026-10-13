// 經緯度地理位置快取庫（支援東北行程、東京、關西等預設熱門地點）
export const locationGeoCache = {
  '松山機場': [25.0697, 121.5524],
  '羽田機場': [35.5494, 139.7798],
  '名鐵濱松町飯店': [35.6568, 139.7562],
  '新青森站': [40.8283, 140.6931],
  '&LOVINA': [40.8296, 140.7335],
  '青森站 &LOVINA': [40.8296, 140.7335],
  '弘前城': [40.6081, 140.4641],
  '弘前站 APPLIESE': [40.5992, 140.4851],
  '青森市區飯店 ReLabo': [40.8255, 140.7410],
  '八甲田山纜車': [40.7077, 140.8306],
  '古川市場': [40.8262, 140.7371],
  '青森市區 古川市場': [40.8262, 140.7371],
  '睡魔之家 WA RASSE': [40.8303, 140.7351],
  '花秀 Kashu': [40.8242, 140.7456],
  '八甲田丸': [40.8315, 140.7339],
  '盛岡站': [39.7018, 141.1362],
  '盛樓閣 盛岡冷麵': [39.7020, 141.1375],
  '盛岡開運橋': [39.7028, 141.1412],
  '盛岡つなぎ溫泉 ホテル紫苑': [39.6738, 141.0028],
  '紫苑 南部曲屋露天風呂': [39.6738, 141.0028],
  '角館武家屋敷': [39.5995, 140.5621],
  '櫻の里 角館': [39.5982, 140.5630],
  '田澤湖たつこ像': [39.7188, 140.6698],
  '仙台 善治郎': [38.2601, 140.8819],
  '仙台車站前商店街': [38.2605, 140.8790],
  '仙台 Daiwa / 大都會東館': [38.2608, 140.8825],
  '桃園國際機場': [25.0797, 121.2342],
  '關西國際機場': [34.4320, 135.2304],
  '京都車站 The Cube': [34.9858, 135.7588],
  '東本願寺': [34.9905, 135.7594],
  '京都塔': [34.9875, 135.7593],
  '京都千飯店 (THE THOUSAND KYOTO)': [34.9865, 135.7605]
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

// 提取旅程中所有有效坐標供地圖繪製
export const extractTripMapLocations = (trip, activeDayIndex = null) => {
  if (!trip || !trip.days) return [];

  const locations = [];
  const daysToProcess = activeDayIndex !== null 
    ? trip.days.filter(d => d.dayIndex === activeDayIndex)
    : trip.days;

  daysToProcess.forEach(day => {
    const candidatePlaces = [
      { name: day.morning?.location || day.morning?.details, period: '上午行程', time: '上午' },
      { name: day.lunch?.location || day.lunch?.restaurant, period: '午餐', time: '中午' },
      { name: day.afternoon?.location || day.afternoon?.details, period: '下午行程', time: '下午' },
      { name: day.dinner?.location || day.dinner?.restaurant, period: '晚餐', time: '晚間' },
      { name: day.evening?.location || day.evening?.details, period: '晚上行程', time: '夜間' },
      { name: day.accommodation?.name, period: '夜間住宿', time: '過夜' }
    ];

    candidatePlaces.forEach((item, idx) => {
      if (!item.name) return;

      // 在快取庫中比對
      let matchedCoord = null;
      for (const [key, coords] of Object.entries(locationGeoCache)) {
        if (item.name.includes(key) || key.includes(item.name)) {
          matchedCoord = coords;
          break;
        }
      }

      if (matchedCoord) {
        locations.push({
          id: `day-${day.dayIndex}-${idx}`,
          dayIndex: day.dayIndex,
          date: day.date,
          name: item.name,
          period: item.period,
          lat: matchedCoord[0],
          lng: matchedCoord[1]
        });
      }
    });
  });

  return locations;
};
