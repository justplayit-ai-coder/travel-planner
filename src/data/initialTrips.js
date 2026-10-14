// 預設旅程資料：東北雪之聖誕與東京跨年之旅 (2026/12/26 - 2027/01/01)
export const initialTrips = [
  {
    id: 'trip-tohoku-2026',
    name: '東北雪之聖誕與東京跨年之旅',
    startDate: '2026-12-26',
    endDate: '2027-01-01',
    exchangeRate: 0.205,
    currencyName: 'JPY',
    isArchived: false,
    airfareAmount: 0,
    airfareCurrency: 'TWD',
    days: [
      {
        dayIndex: 1,
        date: '2026-12-26 (六)',
        transit: {
          trainCode: 'はやぶさ 11號 (東京->新青森)',
          timeRange: '09:36-12:34',
          duration: '4h 45m (285分)',
          details: '09:36-12:34 (はやぶさ 11號 東京->新青森 178m)\n12:46-12:53 (奧羽本線普通 7m)\n14:01-14:44 (奧羽本線普通 43m) [備案: 13:52-14:26 白神4號 34m]\n14:50-15:05 (土手町循環巴士 15m)\n17:41-18:23 (奧羽本線快速 42m)\n當日總車程: 4h 45m (285分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '新青森站',
          details: '首日搭最速達班次直達最北端 (12:34抵達新青森)\n12:53抵青森站直通 ReLabo 放行李',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '&LOVINA 1F 青森食堂',
          location: '青森站 &LOVINA',
          details: '&LOVINA 1F 青森食堂午餐 (全室內免吹風)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '弘前城',
          details: '土手町100円巴士至市役所前\n弘前城雪中散策 (追手門進->下乘橋拍天守->三の丸東門出，60-70分)\n可否屋 葡瑠満 (現烤富士蜜蘋果派+手沖咖啡)\n弘前站 APPLIESE 名產採買\n17:41 快速車返程',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '津輕じょっぱり漁屋酒場 或 旬料理 初花',
          location: '津輕じょっぱり漁屋酒場',
          details: '20:00 青森在地居酒屋/鄉土料理 (津輕じょっぱり漁屋酒場 或 旬料理 初花)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: 'ReLabo',
          details: '18:25 抵達飯店辦理入住 ＆ 溫泉 Spa 享受放鬆',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '青森市區飯店 ReLabo',
          roomType: '雙人房',
          notes: '連泊第 1 晚 含溫泉 Spa',
          details: '青森市區飯店 (連泊1) ReLabo；18:25 抵達飯店辦理入住 ＆ 溫泉 Spa',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '伴手禮與備用金',
          details: '市區交通、寄物與超商零食',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 2,
        date: '2026-12-27 (日)',
        transit: {
          trainCode: 'JR巴士 はっこうだ2號/1號',
          timeRange: '08:10-12:03',
          duration: '1h 55m (115分)',
          details: '08:10-09:10 (JR巴士 はっこうだ2號 60m)\n11:08-12:03 (JR巴士 はっこうだ1號 55m)\n當日總車程: 1h 55m (115分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '八甲田',
          details: '上午八甲田野生樹冰\n12:03 返抵青森站',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: 'お食事処 おさない',
          location: 'おさない',
          details: '午餐: お食事処 おさない (帆立貝味噌燒/定食)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '睡魔之家 WA RASSE',
          details: '午後青森港灣悠閒漫步 (免趕弘前，體力徹底放鬆):\n睡魔之家 WA RASSE ＆ A-FACTORY ＆ 港灣雪景散策\n17:00 回 ReLabo 享受下午場溫泉 Spa 換裝',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '花秀 (Kashu) 頂級法式私廚',
          location: '花秀',
          details: '18:30 花秀 (Kashu) 頂級法式私廚 (已確認預約)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: 'ReLabo',
          details: '餐後返回飯店享受溫泉 Spa',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '青森市區飯店 ReLabo',
          roomType: '雙人房',
          notes: '連泊第 2 晚',
          details: '青森市區飯店 (連泊2) ReLabo；飯店溫泉 Spa',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: 'A-FACTORY 採買',
          details: '名產蘋果酒採買',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 3,
        date: '2026-12-28 (一)',
        transit: {
          trainCode: 'はやぶさ 18號 (新青森->盛岡)',
          timeRange: '11:43-15:25',
          duration: '1h 24m (84分)',
          details: '【正常版】\n11:43-11:49 (奧羽本線普通 6m)\n11:52-12:45 (はやぶさ 18號 新青森->盛岡 53m)\n15:00-15:25 (紫苑專車 25m)\n總車程: 1h 24m (84分)\n\n【八甲田備案】\n08:10-09:10 / 11:08-12:03 (JR巴士八甲田往返 115m)\n13:08-13:14 (奧羽本線普通 6m)\n13:52-14:44 (はやぶさ 24號 52m)\n15:00-15:25 (紫苑專車 25m)\n總車程: 3h 18m (198分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '青森站',
          details: '【正常版】上午青森悠閒採買\n【備案】上午八甲田補考樹冰；12:03 返青森站取行李買便當車上吃；14:44 抵盛岡銜接 15:00 專車',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '盛樓閣 冷麵燒肉',
          location: '盛樓閣',
          details: '12:55 盛樓閣冷麵燒肉午餐 (若走備案則為車上便當)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '開運橋',
          details: '14:35 開運橋岩手山雪景\n15:00 盛岡站西口專車直達溫泉',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '飯店岩手地產會席',
          location: 'ホテル紫苑',
          details: '岩手地產會席料理',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: 'ホテル紫苑',
          details: '盛岡つなぎ溫泉 ホテル紫苑；南部曲屋露天風呂泡湯',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '盛岡つなぎ溫泉 ホテル紫苑',
          roomType: '溫泉和室',
          notes: '含早晚餐 專車接送',
          details: '盛岡つなぎ溫泉 ホテル紫苑；南部曲屋露天風呂；岩手地產會席',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '溫泉入湯稅與伴手禮',
          details: '',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 4,
        date: '2026-12-29 (二)',
        transit: {
          trainCode: 'こまち 7號/34號 直通仙台',
          timeRange: '09:50-18:29',
          duration: '4h 10m (250分)',
          details: '09:50-10:15 (紫苑專車 25m)\n10:57-11:41 (こまち 7號 盛岡->角館 44m)\n14:58-15:11 (こまち 28/32號 角館->田澤湖 13m)\n15:25-16:56 (田澤湖一周巴士 91m)\n17:12-18:29 (こまち 34號 田澤湖->仙台 77m 直通免轉車)\n當日總車程: 4h 10m (250分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '盛岡站',
          details: '晨湯退房至盛岡寄行李\n10:57出發 11:41抵角館搭計程車\n12:00準時入席櫻之里 (已預約)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '櫻之里 (已預約)',
          location: '櫻之里',
          details: '12:00 準時入席櫻之里 (已預約 比內地雞親子丼/稻庭烏龍麵)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '角館',
          details: '武家屋敷散策至 14:45\n15:25 田澤湖一周巴士拍辰子像\n搭こまち 34號直通直達仙台',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '仙台炭火厚切牛舌',
          location: '仙台站',
          details: '18:45 仙台炭火厚切牛舌晚餐',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: '仙台市區飯店',
          details: '抵達仙台市區飯店辦理入住手續並休息',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '仙台市區飯店',
          roomType: '雙人房',
          notes: '連泊第 1 晚 近車站',
          details: '仙台市區飯店 (連泊1)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '寄物櫃與田澤湖巴士券',
          details: '',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 5,
        date: '2026-12-30 (三)',
        transit: {
          trainCode: 'やまびこ 50號 / 磐越西線 / 計程車跳表',
          timeRange: '08:20-17:39',
          duration: '4h 16m (256分)',
          details: '08:20-08:55 (やまびこ 50號 仙台->郡山 35m)\n09:15-10:31 (磐越西線普通 郡山->會津若松 76m)\n10:35-10:45 (計程車① 車站->飯盛山 10m)\n11:45-11:58 (計程車② 飯盛山->鶴城 13m)\n12:40-12:45 (計程車③ 鶴城->市役所 5m)\n15:00-15:10 (計程車④ 末廣酒造->若松站 10m)\n15:30-16:35 (磐越西線快速 若松->郡山 65m)\n16:57-17:39 (やまびこ 67號 郡山->仙台 42m)\n當日總車程: 4h 16m (256分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '飯盛山',
          details: '08:20 晚出門充裕睡眠出發\n計程車機動跳表直達核心景點:\n飯盛山＆榮螺堂 (10:55-11:45)\n計程車直達鶴城本丸拍雪見天守 (11:58-12:40)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '會津醬汁豬排丼 或 田季野輪箱飯',
          location: '田季野輪箱飯',
          details: '午餐: 市役所/神明通周邊 (會津醬汁豬排丼 或 田季野輪箱飯，12:50-13:55)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '末廣酒造',
          details: '野口英世青春通洋館漫步 ＆ 末廣酒造嘉永藏 (清酒試飲採買，13:55-15:00)\n15:00 計程車直達車站採買伴手禮\n15:30 搭快速車返程',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '仙台在地美食料理',
          location: '仙台站',
          details: '晚餐: 仙台在地美食料理',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: '定禪寺通',
          details: '17:39 準時返抵仙台站 (達成18:00前目標！)\n定禪寺通「SENDAI光之樂章」百萬點燈散策',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '仙台市區飯店',
          roomType: '雙人房',
          notes: '連泊第 2 晚',
          details: '仙台市區飯店 (連泊2)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '末廣酒造伴手禮',
          details: '清酒與當地工藝品採買',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 6,
        date: '2026-12-31 (四)',
        transit: {
          trainCode: 'やまびこ 51/54號 / 計程車包車 / はやぶさ 38號',
          timeRange: '08:00-20:48',
          duration: '2h 38m (158分)',
          details: '08:00-08:35 (やまびこ 51號 仙台->一之關 35m)\n08:40-11:35 (計程車包車約3h 09:30猊鼻溪遊船直返車站)\n11:51-12:23 (やまびこ 54號 一之關->仙台 32m)\n19:17-20:48 (はやぶさ 38號 仙台->東京 91m)\n當日總車程: 2h 38m (158分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '猊鼻溪',
          details: '退房寄放大行李於仙台飯店\n輕裝出門 09:30-11:00 猊鼻溪暖桌遊船',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '仙台站內 / S-PAL 美食街',
          location: '仙台站',
          details: '12:23 提早返抵仙台享有充裕留白逛街採買伴手禮與 S-PAL 午餐',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '仙台站',
          details: '仙台市區逛街採買名產伴手禮與 S-PAL\n傍晚回飯店取行李\n19:17 搭最速はやぶさ直奔東京 (20:48抵)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '新幹線便當 或 東京跨年宵夜',
          location: '東京濱松町名鐵飯店',
          details: '晚餐: 仙台站頂級牛舌便當或抵達東京後居酒屋宵夜',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: '東京濱松町名鐵飯店',
          details: '20:48 抵達東京辦理入住\n迎接跨年夜看 NHK 紅白歌合戰',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '東京濱松町名鐵飯店',
          roomType: '雙人房',
          notes: '連泊第 1 晚 近羽田與JR',
          details: '東京濱松町名鐵飯店 (連泊1)；迎接跨年夜看紅白',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '跨年零食與計程車包車費用',
          details: '',
          expenseAmount: 0,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 7,
        date: '2027-01-01 (五)',
        transit: {
          trainCode: 'とき 315號 / 344號 (東京往返越後湯澤)',
          timeRange: '10:15-20:24',
          duration: '2h 36m (156分)',
          details: '10:15-11:31 (とき 315號 東京->越後湯澤 76m)\n19:04-20:24 (とき 344號 越後湯澤->東京 80m) [備案: 19:48-21:04 とき 346號]\n當日總車程: 2h 36m (156分)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        morning: {
          location: '越後湯澤',
          details: '東京出發日歸新潟雪國 (11:31 抵達越後湯澤)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: 'むらんごっつぉ (Murangozzo)',
          location: 'むらんごっつぉ',
          details: '11:40 むらんごっつぉ午餐大餐 (新潟在地魚沼米與旬味料理)',
          expenseAmount: 0,
          currency: 'JPY'
        },
        afternoon: {
          location: '湯澤高原',
          details: '13:30-15:30 湯澤高原纜車山頂雪景\n15:45-16:45 日歸名湯 (首選東映飯店 / 酒風呂保底)\n16:45-17:45 CoCoLo 採買 ＆ ぽんしゅ館清酒試飲',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '中野屋 片木蕎麥麵',
          location: '中野屋',
          details: '17:45-18:45 中野屋片木蕎麥麵晚餐；搭 19:04 新幹線回東京',
          expenseAmount: 0,
          currency: 'JPY'
        },
        evening: {
          location: '東京濱松町名鐵飯店',
          details: '20:24 早早返抵東京休息；圓滿結束東北雪國跨年之旅',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '東京濱松町名鐵飯店',
          roomType: '雙人房',
          notes: '連泊第 2 晚',
          details: '東京濱松町名鐵飯店 (連泊2)；圓滿結束東北雪國跨年之旅',
          expenseAmount: 0,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: 'ぽんしゅ館代幣與雪國土產',
          details: '',
          expenseAmount: 0,
          currency: 'JPY'
        }
      }
    ]
  }
];
