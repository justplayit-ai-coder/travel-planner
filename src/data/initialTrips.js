// 預設示範資料：精確還原附圖中「2026/12/25 - 2027/1/3 東北雪景與東京漫步 10日遊」
export const initialTrips = [
  {
    id: 'trip-tohoku-2026',
    name: '2026 日本東北雪景與東京漫步 10日遊',
    startDate: '2026-12-25',
    endDate: '2027-01-03',
    exchangeRate: 0.205,
    currencyName: 'JPY',
    isArchived: false,
    airfareAmount: 29726,
    airfareCurrency: 'TWD',
    days: [
      {
        dayIndex: 1,
        date: '2026-12-25 (五)',
        transit: {
          trainCode: 'CI222 TSA->HND',
          timeRange: '18:25~22:15',
          backupPlan: '松山飛羽田 直飛',
          duration: '3h 50m',
          expenseAmount: 5000,
          currency: 'JPY'
        },
        morning: {
          details: '整理行李與出發準備',
          location: '松山機場',
          expenseAmount: 0,
          currency: 'TWD'
        },
        lunch: {
          restaurant: '市區早午餐 / 機場輕食',
          location: '台北市',
          expenseAmount: 0,
          currency: 'TWD'
        },
        afternoon: {
          details: '前往松山機場辦理報到手續出境',
          location: '松山機場',
          expenseAmount: 0,
          currency: 'TWD'
        },
        dinner: {
          restaurant: '鳥貴族 羽田分店',
          location: '羽田機場',
          expenseAmount: 3000,
          currency: 'JPY'
        },
        evening: {
          details: '抵達東京市區飯店 Check-in 休息',
          location: '名鐵濱松町飯店',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '名鐵濱松町 (連泊預約)',
          roomType: '雙人房',
          notes: '交通便利 近羽田單軌',
          expenseAmount: 20330,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: 'Suica 卡加值與機場伴手禮',
          expenseAmount: 5000,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 2,
        date: '2026-12-26 (六)',
        transit: {
          trainCode: 'はやぶさ 11號 (東京->新青森) 178m',
          timeRange: '09:36-12:34',
          backupPlan: '13:52-14:26 白神4號 34m 備案',
          duration: '4h 45m (285分)',
          expenseAmount: 100000,
          currency: 'JPY'
        },
        morning: {
          details: '首日搭最速達班次直達最北端 (12:34抵達新青森) -> 直通 ReLabo 放行李',
          location: '新青森站',
          expenseAmount: 0,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '&LOVINA 1F 青森食堂午餐 (全室內免吹風)',
          location: '青森站 &LOVINA',
          expenseAmount: 6000,
          currency: 'JPY'
        },
        afternoon: {
          details: '弘前城雪中散策 (追手門進->下乘橋拍天守->三之丸東門出 60-70分)',
          location: '弘前城',
          expenseAmount: 670,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '津輕漁屋酒場 (青森在地鄉土料理居酒屋) 20:00',
          location: '青森市區居酒屋',
          expenseAmount: 14000,
          currency: 'JPY'
        },
        evening: {
          details: '弘前站 APPLIESE 名產採買 (現烤富士蜜蘋果派+手沖咖啡) 17:41 快速車返程',
          location: '弘前站 APPLIESE',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '青森市區飯店 ReLabo (連泊1)',
          roomType: '雙人景觀房',
          notes: '18:25 抵達辦理入住 & 溫泉 Spa',
          expenseAmount: 58078,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '土手町100円巴士與投幣寄物櫃',
          expenseAmount: 1000,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 3,
        date: '2026-12-27 (日)',
        transit: {
          trainCode: 'JR巴士 はっこうだ2號 (青森站->八甲田纜車)',
          timeRange: '08:10-09:10',
          backupPlan: '11:08-12:03 回程 はっこうだ1號 55m',
          duration: '1h 55m (115分)',
          expenseAmount: 10000,
          currency: 'JPY'
        },
        morning: {
          details: '上午八甲田野生樹冰搭乘纜車遠眺',
          location: '八甲田山纜車',
          expenseAmount: 2000,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '丸青食堂・蘋果派・點心 (12:03 返青森站帆立貝味噌燒定食)',
          location: '青森市區 古川市場',
          expenseAmount: 8000,
          currency: 'JPY'
        },
        afternoon: {
          details: '青森港悠閒漫步 (睡魔之家 WA RASSE & A-FACTORY & 港灣雪景散策)',
          location: '睡魔之家 WA RASSE',
          expenseAmount: 600,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '花秀 (Kashu) 頂級法式私廚 18:30 (已確認預約)',
          location: '花秀 Kashu',
          expenseAmount: 45000,
          currency: 'JPY'
        },
        evening: {
          details: '返回 ReLabo 享受下午場溫泉 Spa 換裝休養',
          location: 'ReLabo 露天風呂',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '青森市區飯店 ReLabo (連泊2)',
          roomType: '雙人景觀房',
          notes: '飯店溫泉設施體驗',
          expenseAmount: 49368,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: 'A-FACTORY 伴手禮蘋果酒',
          expenseAmount: 3500,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 4,
        date: '2026-12-28 (一)',
        transit: {
          trainCode: 'はやぶさ 18號 (新青森->盛岡 53m) / 紫苑專車 25m',
          timeRange: '11:52-12:45 / 15:00-15:25',
          backupPlan: '盛岡站西口專車直達溫泉',
          duration: '1h 24m (84分)',
          expenseAmount: 8500,
          currency: 'JPY'
        },
        morning: {
          details: '青森悠閒採買與八甲田丸巡街 (船開 11:22 / 13:01 / 13:35)',
          location: '八甲田丸',
          expenseAmount: 510,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '盛樓閣冷麵燒肉午餐 (12:55 盛岡站前)',
          location: '盛樓閣 盛岡冷麵',
          expenseAmount: 10000,
          currency: 'JPY'
        },
        afternoon: {
          details: '開運橋岩手山雪景遠眺散策 -> 前往盛岡つなぎ溫泉',
          location: '盛岡開運橋',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '飯店一泊二食會席料理 + 地酒品酩',
          location: '飯店內餐廳',
          expenseAmount: 2000,
          currency: 'JPY'
        },
        evening: {
          details: '南部曲屋露天風呂泡湯 放鬆身心',
          location: '紫苑 南部曲屋露天風呂',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '盛岡つなぎ溫泉 ホテル紫苑',
          roomType: '和洋室一泊二食',
          notes: '岩手產會席料理 含接送專車',
          expenseAmount: 43990,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '盛岡手工藝村紀念品',
          expenseAmount: 2500,
          currency: 'JPY'
        }
      },
      {
        dayIndex: 5,
        date: '2026-12-29 (二)',
        transit: {
          trainCode: '秋田新幹線 こまち (盛岡->角館) 45m',
          timeRange: '09:50-10:35',
          backupPlan: '新幹線田澤湖線轉搭巴士',
          duration: '1h 30m',
          expenseAmount: 2500,
          currency: 'JPY'
        },
        morning: {
          details: '角館武家屋敷歷史雪景散策',
          location: '角館武家屋敷',
          expenseAmount: 500,
          currency: 'JPY'
        },
        lunch: {
          restaurant: '櫻の里 比內地雞親子丼 12:00',
          location: '櫻の里 角館',
          expenseAmount: 8000,
          currency: 'JPY'
        },
        afternoon: {
          details: '田澤湖琉璃之眼搭環湖巴士巡禮',
          location: '田澤湖たつこ像',
          expenseAmount: 1200,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '牛舌 善治郎 站內/驛前 20:00',
          location: '仙台 善治郎',
          expenseAmount: 14000,
          currency: 'JPY'
        },
        evening: {
          details: '抵達仙台市區 Check-in 與商店街夜逛',
          location: '仙台車站前商店街',
          expenseAmount: 0,
          currency: 'JPY'
        },
        accommodation: {
          name: '仙台 Daiwa / 大都會東館',
          roomType: '標準雙人客房',
          notes: '仙台車站直通商務景觀飯店',
          expenseAmount: 32000,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: '毛豆泥奶昔與伴手禮盒',
          expenseAmount: 3000,
          currency: 'JPY'
        }
      }
    ]
  },
  {
    id: 'trip-kyoto-2025-archived',
    name: '2025 京都秋季紅葉古寺攝影 6日遊 (歷史紀錄)',
    startDate: '2025-11-20',
    endDate: '2025-11-25',
    exchangeRate: 0.212,
    currencyName: 'JPY',
    isArchived: true, // 歷史封存紀錄，展示反灰收納效果
    airfareAmount: 18500,
    airfareCurrency: 'TWD',
    days: [
      {
        dayIndex: 1,
        date: '2025-11-20 (四)',
        transit: {
          trainCode: 'HARUKA 關空特急',
          timeRange: '13:14-14:34',
          backupPlan: '利木津巴士直達京都',
          duration: '1h 20m',
          expenseAmount: 4200,
          currency: 'JPY'
        },
        morning: {
          details: '台北桃園出發直飛關西國際機場',
          location: '桃園國際機場',
          expenseAmount: 0,
          currency: 'TWD'
        },
        lunch: {
          restaurant: '關空航廈美食街',
          location: '關西國際機場',
          expenseAmount: 2800,
          currency: 'JPY'
        },
        afternoon: {
          details: '抵達京都站辦理入住，漫步東本願寺銀杏大道',
          location: '東本願寺',
          expenseAmount: 0,
          currency: 'JPY'
        },
        dinner: {
          restaurant: '名代豬排 かつくら 京都車站店',
          location: '京都車站 The Cube',
          expenseAmount: 5200,
          currency: 'JPY'
        },
        evening: {
          details: '京都塔夜景與地下街名產散策',
          location: '京都塔',
          expenseAmount: 900,
          currency: 'JPY'
        },
        accommodation: {
          name: '京都千飯店 (THE THOUSAND KYOTO)',
          roomType: '高級客房',
          notes: '京都站中央口步行 2 分鐘',
          expenseAmount: 42000,
          currency: 'JPY'
        },
        miscellaneous: {
          notes: 'ICOCA 交通卡充值',
          expenseAmount: 3000,
          currency: 'JPY'
        }
      }
    ]
  }
];
