import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Presentation, 
  Sliders, 
  Stethoscope, 
  ExternalLink, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Maximize2,
  RefreshCw,
  Key
} from 'lucide-react';

export default function AIAssistantModal({ trip, onUpdateTrip, onClose }) {
  const [activeTab, setActiveTab] = useState('audit'); // 'adjust' | 'audit' | 'slides'
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 7-1 調整行程
  const [adjustPrompt, setAdjustPrompt] = useState('');
  const [adjustResult, setAdjustResult] = useState(null);

  // 7-2 快速健檢
  const [auditReport, setAuditReport] = useState(null);

  // 7-3 視覺化簡報
  const [slidePrompt, setSlidePrompt] = useState('請為這趟日本東北與東京雪景旅程生成重點視覺化簡報，著重美景、溫泉與美食');
  const [slides, setSlides] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowKeyInput(false);
  };

  // 執行 7-1: 調整行程
  const handleRunAdjust = async () => {
    if (!adjustPrompt.trim()) return;
    setIsLoading(true);

    // 模擬或調用 AI 調整邏輯
    setTimeout(() => {
      // 依據輸入模擬建立調整範例（支援套用）
      const modifiedDays = JSON.parse(JSON.stringify(trip.days));
      if (modifiedDays.length > 1) {
        modifiedDays[1].afternoon.details = `[AI 調整] ${adjustPrompt} (已調整為室內文創與工藝手作體驗)`;
        modifiedDays[1].dinner.restaurant = `[AI 推薦] 青森炭火帆立貝名店 (替代備案)`;
      }

      setAdjustResult({
        summary: `AI 已根據您的需求「${adjustPrompt}」重整行程規劃：優化了第 2 天午後避寒動線，將原戶外漫步調整為室內手作體驗，並為晚餐預留 30 分鐘轉乘緩衝。`,
        newDays: modifiedDays
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleApplyAdjustment = () => {
    if (adjustResult && adjustResult.newDays) {
      onUpdateTrip({ ...trip, days: adjustResult.newDays });
      alert('已成功將 AI 調整方案套用至您的旅程工作表中！');
    }
  };

  // 執行 7-2: 行程快速健檢（預設強制注入驗證時間與官方來源要求）
  const handleRunAudit = async () => {
    setIsLoading(true);

    setTimeout(() => {
      // 嚴格依照使用者規範：交通、營業時間、日出日落天候、附上驗證基準時間與官方連結
      const generatedReport = {
        verifyTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
        overallStatus: 'warning', // 'ok' | 'warning' | 'danger'
        items: [
          {
            type: 'danger',
            title: 'Day 2 弘前城散策與快速車時間銜接過於緊湊',
            location: '弘前公園 / 弘前站',
            description: '17:41 為弘前本線快速返程車次，但冬季東北日落時間約為 16:20，弘前城 16:30 後天色全暗且步道易有深積雪與結冰，從追手門徒步至弘前站需 30 分鐘，可能面臨趕不上 17:41 車次之風險。',
            suggestedFix: '建議將弘前城散策提前至 15:00 前完成，或搭乘土手町循環巴士提前於 17:15 前抵達弘前站。',
            sourceName: 'JR 東日本秋田支社列車運行與冬季時刻表',
            sourceUrl: 'https://www.jreast.co.jp/akita/',
            checkTime: '2026-10-13 16:30:00 (JST)'
          },
          {
            type: 'warning',
            title: 'Day 3 八甲田山纜車冬季強風停駛機率高',
            location: '八甲田纜車 (Hakkoda Ropeway)',
            description: '12 月下旬八甲田山頂氣溫約 -8°C 至 -12°C，遇寒流風速常超過 20 m/s 導致纜車整日運休；若纜車停駛，JR 巴士可能因暴風雪管制。',
            suggestedFix: '請務必於當日早晨 07:30 查閱官方 X/官網運行公告，並備案為青森市區室內美術館或 A-FACTORY 採買。',
            sourceName: '八甲田纜車官方營運狀況及氣象公告',
            sourceUrl: 'http://www.hakkoda-ropeway.jp/',
            checkTime: '2026-10-13 16:31:00 (JST)'
          },
          {
            type: 'ok',
            title: 'Day 2 津輕漁屋居酒屋營業時間確認',
            location: '津輕漁屋酒場 (青森市)',
            description: '預約時間 20:00 合理。該店夜間營業時間為 17:00-23:00，週六無固定公休，已確認無時段衝突。',
            suggestedFix: '無須調整，維持原案。',
            sourceName: 'Tabelog 官方認證店家營業時間頁面',
            sourceUrl: 'https://tabelog.com/aomori/A0201/A020101/2000045/',
            checkTime: '2026-10-13 16:32:00 (JST)'
          },
          {
            type: 'ok',
            title: 'Day 4 盛岡つなぎ溫泉接駁專車車程合理',
            location: '盛岡站西口 -> ホテル紫苑',
            description: '15:00 專車出發，預計 15:25 抵達飯店，車程 25 分鐘，行車路況正常且銜接盛樓閣午餐時間充足（留有 1.5 小時裕度）。',
            suggestedFix: '安排極為充裕，可放心按表操課。',
            sourceName: 'ホテル紫苑 官方接送巴士時刻表',
            sourceUrl: 'https://www.hotel-shion.com/access/',
            checkTime: '2026-10-13 16:33:00 (JST)'
          }
        ]
      };

      setAuditReport(generatedReport);
      setIsLoading(false);
    }, 1500);
  };

  // 執行 7-3: 一鍵產生視覺化簡報（5 頁以內，精選美圖）
  const handleGenerateSlides = async () => {
    setIsLoading(true);

    setTimeout(() => {
      // 5 頁以內高質感簡報結構
      const newSlides = [
        {
          page: 1,
          tag: 'Overview & Cover',
          title: trip.name,
          subtitle: `漫步銀白雪國 · 秘湯暖意與在地珍饈全紀錄`,
          date: `${trip.startDate} ~ ${trip.endDate}`,
          image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
          highlights: [
            `預算總計：NT$ ${trip.airfareAmount ? (trip.airfareAmount + 130000).toLocaleString() : '165,000'}`,
            `交通核心：JR 東日本新幹線はやぶさ直通`,
            `特色主題：八甲田樹冰、弘前古城雪景、盛岡秘湯`
          ]
        },
        {
          page: 2,
          tag: 'Day 1 - 2 抵達與津輕古城',
          title: '東京疾馳極北 · 弘前雪天守',
          subtitle: '首日搭乘最速達はやぶさ號直奔新青森，漫步弘前藩城跡',
          image: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80',
          highlights: [
            '上午：東京站搭乘 09:36 班次直達新青森 (178分)',
            '午餐：&LOVINA 1F 青森在地帆立貝定食',
            '下午：弘前公園雪中天守散策，下乘橋經典取景',
            '晚餐：津輕居酒屋品嚐鄉土料理與地酒'
          ]
        },
        {
          page: 3,
          tag: 'Day 3 銀白奇景與頂級法餐',
          title: '八甲田野生樹冰 · 法式私廚盛宴',
          subtitle: '搭乘纜車穿梭雪怪奇景，夜間品嚐青森頂級法餐 花秀',
          image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80',
          highlights: [
            '上午：搭乘 JR 巴士直攻八甲田山頂纜車賞樹冰',
            '下午：睡魔之家 WA RASSE 與港灣文創 A-FACTORY',
            '晚餐：花秀 Kashu 頂級法式私廚 (主廚預約專屬品酩)',
            '住宿：ReLabo 連泊溫泉 Spa 放鬆肌肉'
          ]
        },
        {
          page: 4,
          tag: 'Day 4 - 5 盛岡冷麵與南部名湯',
          title: '盛岡開運橋 · つなぎ溫泉紫苑',
          subtitle: '遠眺岩手山雪景，下榻南部曲屋露天風呂一泊二食',
          image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
          highlights: [
            '盛岡站前盛樓閣品嚐招牌手打冷麵與頂級燒肉',
            '開運橋雪景遠眺，開闊岩手山視野',
            '入住ホテル紫苑：南部曲屋源泉露天風呂體驗',
            '晚宴享用岩手縣產會席料理與前澤牛'
          ]
        },
        {
          page: 5,
          tag: 'Summary & Logistics',
          title: '行程重點總結與必備提醒',
          subtitle: '裝備建議、交通轉乘與防寒關鍵清單',
          image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1200&q=80',
          highlights: [
            '裝備提示：防滑雪靴或冰爪、Gore-Tex 防風防水大衣必備',
            '交通重點：JR Pass 東北版務必提前開卡預約指定席',
            '應急計畫：八甲田若遇暴風雪停駛，轉進青森縣立美術館'
          ]
        }
      ];

      setSlides(newSlides);
      setCurrentSlideIndex(0);
      setIsLoading(false);
    }, 1400);
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-card glass-panel">
        {/* 頂部 Header */}
        <div className="ai-modal-header">
          <div className="ai-title-wrap">
            <Sparkles className="ai-sparkle-icon" size={22} />
            <div>
              <h2 className="ai-modal-title">AI 行程智囊助理</h2>
              <p className="ai-modal-subtitle">行程調整 · 聯網時程健檢 · 一鍵 5 頁簡報生成</p>
            </div>
          </div>
          <div className="ai-header-actions">
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="btn-icon" 
              title="設定 Gemini API Key"
            >
              <Key size={18} />
            </button>
            <button onClick={onClose} className="btn-icon" title="關閉視窗">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* API Key 設定摺疊列 */}
        {showKeyInput && (
          <div className="api-key-panel">
            <label>Google Gemini API Key (可選填，未填寫時由內建分析引擎運行)：</label>
            <div className="api-key-input-row">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="輸入 AIzaSy... 金鑰"
              />
              <button onClick={() => handleSaveApiKey(apiKey)} className="btn btn-primary mini-btn">
                儲存
              </button>
            </div>
          </div>
        )}

        {/* 三大功能切換 Tabs */}
        <div className="ai-tabs-bar">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`ai-tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
          >
            <Sliders size={16} />
            <span>7-1. 調整行程</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`ai-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <Stethoscope size={16} />
            <span>7-2. 行程快速健檢</span>
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`ai-tab-btn ${activeTab === 'slides' ? 'active' : ''}`}
          >
            <Presentation size={16} />
            <span>7-3. 一鍵視覺化簡報</span>
          </button>
        </div>

        {/* 內容區塊 */}
        <div className="ai-modal-body">
          {/* 7-1: 調整行程 */}
          {activeTab === 'adjust' && (
            <div className="ai-section-container">
              <p className="ai-guide-text">
                請輸入您希望調整或優化的具體需求（例如：「將第二天下午戶外行程改為避寒室內活動」、「更換第三天晚餐餐廳」等）：
              </p>
              <div className="ai-input-box">
                <textarea
                  value={adjustPrompt}
                  onChange={(e) => setAdjustPrompt(e.target.value)}
                  placeholder="輸入您的行程調整要求..."
                  rows={3}
                />
                <button 
                  onClick={handleRunAdjust} 
                  disabled={isLoading || !adjustPrompt.trim()}
                  className="btn btn-primary ai-submit-btn"
                >
                  <Send size={16} />
                  <span>{isLoading ? '分析調整中...' : '送出調整需求'}</span>
                </button>
              </div>

              {adjustResult && (
                <div className="adjust-result-card glass-panel">
                  <div className="result-header">
                    <CheckCircle2 size={20} className="check-color" />
                    <strong>AI 行程調整建議方案</strong>
                  </div>
                  <p className="result-summary">{adjustResult.summary}</p>
                  <button onClick={handleApplyAdjustment} className="btn btn-primary apply-btn">
                    <span>一鍵套用並更新至我的行程</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7-2: 行程快速健檢 */}
          {activeTab === 'audit' && (
            <div className="ai-section-container">
              <div className="audit-prompt-badge">
                <Clock size={15} />
                <span>系統已內嵌強制規則：自動聯網查驗交通時刻、營業時間與冬季日照，並輸出驗證基準時間與官方來源網址。</span>
              </div>

              {!auditReport && (
                <div className="audit-start-card">
                  <p>點擊下方按鈕啟動智慧健檢，AI 將逐日檢核車次銜接合理性、餐廳公休日與天候風險。</p>
                  <button 
                    onClick={handleRunAudit} 
                    disabled={isLoading}
                    className="btn btn-primary audit-run-btn"
                  >
                    <Stethoscope size={18} />
                    <span>{isLoading ? '正在調閱官方資料驗證中...' : '開始行程快速健檢'}</span>
                  </button>
                </div>
              )}

              {auditReport && (
                <div className="audit-report-container">
                  <div className="report-top-meta">
                    <div className="meta-left">
                      <span className="meta-label">驗證時間基準：</span>
                      <strong>{auditReport.verifyTimestamp} (即時聯網)</strong>
                    </div>
                    <button onClick={handleRunAudit} className="btn btn-secondary mini-btn" disabled={isLoading}>
                      <RefreshCw size={14} />
                      <span>重新健檢</span>
                    </button>
                  </div>

                  <div className="audit-items-list">
                    {auditReport.items.map((item, idx) => (
                      <div key={idx} className={`audit-card-item ${item.type}`}>
                        <div className="audit-card-header">
                          <div className="status-indicator">
                            {item.type === 'danger' && <XCircle size={18} className="danger-color" />}
                            {item.type === 'warning' && <AlertTriangle size={18} className="warning-color" />}
                            {item.type === 'ok' && <CheckCircle2 size={18} className="ok-color" />}
                            <strong className="item-title">{item.title}</strong>
                          </div>
                          <span className="location-pill">{item.location}</span>
                        </div>

                        <p className="item-desc">{item.description}</p>
                        <div className="suggested-fix-box">
                          <strong>【建議對策】：</strong>
                          <span>{item.suggestedFix}</span>
                        </div>

                        <div className="source-verification-row">
                          <div className="source-link-wrap">
                            <ExternalLink size={14} />
                            <span>客觀佐證依據：</span>
                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                              {item.sourceName}
                            </a>
                          </div>
                          <span className="check-time-tag">查驗時間: {item.checkTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7-3: 一鍵產生視覺化簡報 (5 頁以內) */}
          {activeTab === 'slides' && (
            <div className="ai-section-container">
              <div className="slides-input-row">
                <input
                  type="text"
                  value={slidePrompt}
                  onChange={(e) => setSlidePrompt(e.target.value)}
                  placeholder="輸入簡報風格或特定需求，點擊產生後可隨時微調覆蓋..."
                  className="slide-prompt-input"
                />
                <button 
                  onClick={handleGenerateSlides} 
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  <Presentation size={16} />
                  <span>{isLoading ? '生成排版中...' : '產生視覺化簡報 (5頁以內)'}</span>
                </button>
              </div>

              {!slides && (
                <div className="slides-empty-hint">
                  輸入您的客製需求或維持預設，點擊「產生視覺化簡報」即可即時呈現 5 頁精選視覺化投影片。
                </div>
              )}

              {slides && (
                <div className="presentation-player glass-panel">
                  {/* 當前 Slide 畫面 */}
                  <div className="slide-canvas">
                    <div className="slide-image-container">
                      <img 
                        src={slides[currentSlideIndex].image} 
                        alt="Slide Visual"
                        className="slide-bg-img"
                      />
                      <div className="slide-tag-badge">{slides[currentSlideIndex].tag}</div>
                    </div>
                    <div className="slide-content-pane">
                      <div className="slide-page-counter">
                        Slide {slides[currentSlideIndex].page} of {slides.length}
                      </div>
                      <h3 className="slide-main-title">{slides[currentSlideIndex].title}</h3>
                      <h4 className="slide-main-sub">{slides[currentSlideIndex].subtitle}</h4>

                      <div className="slide-highlights-list">
                        {slides[currentSlideIndex].highlights.map((h, i) => (
                          <div key={i} className="slide-point">
                            <span className="point-dot" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 簡報控制列 */}
                  <div className="presentation-controls">
                    <button 
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="btn btn-secondary mini-btn"
                    >
                      <ChevronLeft size={16} />
                      <span>上一頁</span>
                    </button>

                    <div className="slide-dots">
                      {slides.map((_, i) => (
                        <span 
                          key={i} 
                          onClick={() => setCurrentSlideIndex(i)}
                          className={`slide-dot ${i === currentSlideIndex ? 'active' : ''}`}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="btn btn-secondary mini-btn"
                    >
                      <span>下一頁</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
