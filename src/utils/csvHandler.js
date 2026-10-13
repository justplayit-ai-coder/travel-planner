// CSV 匯入與匯出處理器（完全符合 12 欄位 AI 友善標準格式）

export const CSV_HEADERS = [
  'day_index',
  'date',
  'period',
  'item_title',
  'details',
  'transit_duration_mins',
  'meal_type',
  'expense_category',
  'amount_foreign',
  'amount_twd',
  'currency_selected',
  'location_query'
];

// 將當前旅程資料轉換為 CSV 字串
export const exportTripToCSV = (trip) => {
  if (!trip || !trip.days) return '';

  const rows = [];
  // 加上 UTF-8 BOM 避免 Excel 開啟時中文亂碼
  rows.push(CSV_HEADERS.join(','));

  const rate = Number(trip.exchangeRate) || 0.205;

  trip.days.forEach(day => {
    // 1. 交通
    if (day.transit) {
      const isForeign = day.transit.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.transit.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.transit.expenseAmount || 0) : Math.round((day.transit.expenseAmount || 0) * rate);
      
      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Transit',
        `"${day.transit.trainCode || ''}"`,
        `"${(day.transit.timeRange || '') + ' ' + (day.transit.backupPlan || '')}"`,
        `"${day.transit.duration || ''}"`,
        '',
        '交通',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.transit.trainCode || ''}"`
      ].join(','));
    }

    // 2. 上午行程
    if (day.morning) {
      const isForeign = day.morning.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.morning.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.morning.expenseAmount || 0) : Math.round((day.morning.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Morning',
        `"${day.morning.location || '上午行程'}"`,
        `"${day.morning.details || ''}"`,
        '',
        '',
        '行程門票',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.morning.location || ''}"`
      ].join(','));
    }

    // 3. 午餐
    if (day.lunch) {
      const isForeign = day.lunch.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.lunch.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.lunch.expenseAmount || 0) : Math.round((day.lunch.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Lunch',
        `"${day.lunch.restaurant || '午餐'}"`,
        `"${day.lunch.location || ''}"`,
        '',
        'Lunch',
        '餐食',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.lunch.location || day.lunch.restaurant || ''}"`
      ].join(','));
    }

    // 4. 下午行程
    if (day.afternoon) {
      const isForeign = day.afternoon.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.afternoon.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.afternoon.expenseAmount || 0) : Math.round((day.afternoon.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Afternoon',
        `"${day.afternoon.location || '下午行程'}"`,
        `"${day.afternoon.details || ''}"`,
        '',
        '',
        '行程門票',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.afternoon.location || ''}"`
      ].join(','));
    }

    // 5. 晚餐
    if (day.dinner) {
      const isForeign = day.dinner.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.dinner.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.dinner.expenseAmount || 0) : Math.round((day.dinner.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Dinner',
        `"${day.dinner.restaurant || '晚餐'}"`,
        `"${day.dinner.location || ''}"`,
        '',
        'Dinner',
        '餐食',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.dinner.location || day.dinner.restaurant || ''}"`
      ].join(','));
    }

    // 6. 晚上行程
    if (day.evening) {
      const isForeign = day.evening.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.evening.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.evening.expenseAmount || 0) : Math.round((day.evening.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Evening',
        `"${day.evening.location || '晚上行程'}"`,
        `"${day.evening.details || ''}"`,
        '',
        '',
        '行程門票',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.evening.location || ''}"`
      ].join(','));
    }

    // 7. 住宿
    if (day.accommodation) {
      const isForeign = day.accommodation.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.accommodation.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.accommodation.expenseAmount || 0) : Math.round((day.accommodation.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'NightStay',
        `"${day.accommodation.name || '住宿'}"`,
        `"${(day.accommodation.roomType || '') + ' ' + (day.accommodation.notes || '')}"`,
        '',
        '',
        '住宿',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        `"${day.accommodation.name || ''}"`
      ].join(','));
    }

    // 8. 雜支
    if (day.miscellaneous) {
      const isForeign = day.miscellaneous.currency !== 'TWD';
      const foreignAmt = isForeign ? (day.miscellaneous.expenseAmount || 0) : 0;
      const twdAmt = !isForeign ? (day.miscellaneous.expenseAmount || 0) : Math.round((day.miscellaneous.expenseAmount || 0) * rate);

      rows.push([
        day.dayIndex,
        `"${day.date || ''}"`,
        'Miscellaneous',
        '雜項支出',
        `"${day.miscellaneous.notes || ''}"`,
        '',
        '',
        '雜支',
        foreignAmt,
        twdAmt,
        isForeign ? 'FOREIGN' : 'TWD',
        ''
      ].join(','));
    }
  });

  return '\uFEFF' + rows.join('\n');
};

// 下載 CSV 檔案
export const downloadCSVFile = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName || 'travel-itinerary.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 產生範本 CSV
export const getSampleCSVTemplate = () => {
  const sampleRows = [
    CSV_HEADERS.join(','),
    '1,"2026-12-26 (Sat)",Transit,"JR はやぶさ 11號","09:36-12:34 東京->新青森 (備案: 10:08 班次)","178","","交通",17500,3588,"FOREIGN","新青森駅"',
    '1,"2026-12-26 (Sat)",Lunch,"&LOVINA 青森食堂","全室內免吹風 帆立貝定食","","Lunch","餐食",6000,1230,"FOREIGN","&LOVINA"',
    '1,"2026-12-26 (Sat)",Morning,"新青森放行李","抵達新青森站直通寄放處","","","行程門票",0,0,"FOREIGN","新青森駅"',
    '1,"2026-12-26 (Sat)",Afternoon,"弘前城雪中散策","追手門進->下乘橋拍天守->三之丸東門出","","","行程門票",320,66,"FOREIGN","弘前城"',
    '1,"2026-12-26 (Sat)",Dinner,"津輕漁屋酒場","青森在地鄉土料理居酒屋","","Dinner","餐食",14000,2870,"FOREIGN","津輕漁屋酒場"',
    '1,"2026-12-26 (Sat)",Evening,"弘前站商場採買","APPLIESE 買蘋果派與伴手禮","","","行程門票",0,0,"FOREIGN","弘前站"',
    '1,"2026-12-26 (Sat)",NightStay,"青森市區飯店 ReLabo","連泊第一晚 含露天風呂 Spa","","","住宿",28000,5740,"FOREIGN","ReLabo"',
    '1,"2026-12-26 (Sat)",Miscellaneous,"投幣寄物櫃與超商採買","弘前站寄物櫃 2 個與晚間零食飲料","","","雜支",1500,308,"FOREIGN","弘前站"'
  ];
  return '\uFEFF' + sampleRows.join('\n');
};

// 解析上傳的 CSV 內容還原為旅程 days
export const parseCSVToTripDays = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV 檔案行數不足');

  const daysMap = {};

  // 略過 header
  for (let i = 1; i < lines.length; i++) {
    // 正則分割逗號（考慮引號保護）
    const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // 簡易逗號解析備案
    const cols = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());

    if (cols.length < 11) continue;

    const [
      dayIndexRaw,
      date,
      period,
      itemTitle,
      details,
      transitDuration,
      mealType,
      expenseCategory,
      amountForeignRaw,
      amountTwdRaw,
      currencySelected,
      locationQuery
    ] = cols;

    const dayIndex = parseInt(dayIndexRaw) || 1;
    if (!daysMap[dayIndex]) {
      daysMap[dayIndex] = {
        dayIndex,
        date: date || `Day ${dayIndex}`,
        transit: { trainCode: '', timeRange: '', backupPlan: '', duration: '', expenseAmount: 0, currency: 'JPY' },
        morning: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
        lunch: { restaurant: '', location: '', expenseAmount: 0, currency: 'JPY' },
        afternoon: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
        dinner: { restaurant: '', location: '', expenseAmount: 0, currency: 'JPY' },
        evening: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
        accommodation: { name: '', roomType: '', notes: '', expenseAmount: 0, currency: 'JPY' },
        miscellaneous: { notes: '', expenseAmount: 0, currency: 'JPY' }
      };
    }

    const currentDay = daysMap[dayIndex];
    const isTWD = currencySelected === 'TWD';
    const amount = isTWD ? (parseFloat(amountTwdRaw) || 0) : (parseFloat(amountForeignRaw) || 0);
    const currency = isTWD ? 'TWD' : 'JPY';

    if (period === 'Transit') {
      currentDay.transit.trainCode = itemTitle;
      currentDay.transit.timeRange = details;
      currentDay.transit.duration = transitDuration;
      currentDay.transit.expenseAmount = amount;
      currentDay.transit.currency = currency;
    } else if (period === 'Morning') {
      currentDay.morning.location = itemTitle;
      currentDay.morning.details = details;
      currentDay.morning.expenseAmount = amount;
      currentDay.morning.currency = currency;
    } else if (period === 'Lunch') {
      currentDay.lunch.restaurant = itemTitle;
      currentDay.lunch.location = locationQuery || details;
      currentDay.lunch.expenseAmount = amount;
      currentDay.lunch.currency = currency;
    } else if (period === 'Afternoon') {
      currentDay.afternoon.location = itemTitle;
      currentDay.afternoon.details = details;
      currentDay.afternoon.expenseAmount = amount;
      currentDay.afternoon.currency = currency;
    } else if (period === 'Dinner') {
      currentDay.dinner.restaurant = itemTitle;
      currentDay.dinner.location = locationQuery || details;
      currentDay.dinner.expenseAmount = amount;
      currentDay.dinner.currency = currency;
    } else if (period === 'Evening') {
      currentDay.evening.location = itemTitle;
      currentDay.evening.details = details;
      currentDay.evening.expenseAmount = amount;
      currentDay.evening.currency = currency;
    } else if (period === 'NightStay') {
      currentDay.accommodation.name = itemTitle;
      currentDay.accommodation.notes = details;
      currentDay.accommodation.expenseAmount = amount;
      currentDay.accommodation.currency = currency;
    } else if (period === 'Miscellaneous') {
      currentDay.miscellaneous.notes = details;
      currentDay.miscellaneous.expenseAmount = amount;
      currentDay.miscellaneous.currency = currency;
    }
  }

  return Object.values(daysMap).sort((a, b) => a.dayIndex - b.dayIndex);
};
