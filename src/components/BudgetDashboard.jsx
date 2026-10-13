import React from 'react';
import { 
  DollarSign, 
  Plane, 
  Hotel, 
  Utensils, 
  Ticket, 
  Train, 
  Receipt, 
  Download, 
  Upload, 
  FileText, 
  Map as MapIcon, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { calculateTripBudget } from '../utils/budgetCalculator';
import { exportTripToCSV, downloadCSVFile, getSampleCSVTemplate } from '../utils/csvHandler';

export default function BudgetDashboard({
  trip,
  onUpdateTrip,
  onOpenImportCSV,
  onOpenAIModal,
  isMapVisible,
  onToggleMap
}) {
  const budget = calculateTripBudget(trip);

  const handleRateChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    onUpdateTrip({ ...trip, exchangeRate: val });
  };

  const handleNameChange = (e) => {
    onUpdateTrip({ ...trip, name: e.target.value });
  };

  const handleAirfareChange = (e) => {
    const amt = parseFloat(e.target.value) || 0;
    onUpdateTrip({ ...trip, airfareAmount: amt });
  };

  const handleAirfareCurrencyChange = (e) => {
    onUpdateTrip({ ...trip, airfareCurrency: e.target.value });
  };

  const handleExportCSV = () => {
    const csvData = exportTripToCSV(trip);
    const filename = `${trip.name.replace(/\s+/g, '_')}_itinerary.csv`;
    downloadCSVFile(csvData, filename);
  };

  const handleDownloadSample = () => {
    const template = getSampleCSVTemplate();
    downloadCSVFile(template, 'travel_planner_template.csv');
  };

  if (!budget) return null;

  const { categories, grandTotalTWD, grandTotalForeign, currencyName, exchangeRate } = budget;

  const categoryCards = [
    { key: 'airfare', label: '機票', icon: Plane, data: categories.airfare, color: '#38bdf8' },
    { key: 'accommodation', label: '住宿', icon: Hotel, data: categories.accommodation, color: '#a855f7' },
    { key: 'meals', label: '餐食', icon: Utensils, data: categories.meals, color: '#f59e0b' },
    { key: 'tickets', label: '行程門票', icon: Ticket, data: categories.tickets, color: '#ec4899' },
    { key: 'transit', label: '交通', icon: Train, data: categories.transit, color: '#10b981' },
    { key: 'miscellaneous', label: '雜支', icon: Receipt, data: categories.miscellaneous, color: '#94a3b8' }
  ];

  return (
    <div className="budget-dashboard glass-panel">
      {/* 頂部控制列：名稱、匯率、工具操作按鈕 */}
      <div className="dashboard-header-row">
        <div className="trip-meta-inputs">
          <input 
            type="text" 
            value={trip.name} 
            onChange={handleNameChange}
            className="trip-title-input"
            placeholder="輸入旅程名稱..."
          />
          <div className="rate-badge">
            <span className="rate-label">匯率 (1 {currencyName} =):</span>
            <input 
              type="number" 
              step="0.001" 
              value={trip.exchangeRate} 
              onChange={handleRateChange}
              className="rate-input"
            />
            <span className="rate-unit">TWD</span>
          </div>

          <div className="airfare-quick-input">
            <Plane size={15} />
            <span className="airfare-label">機票:</span>
            <input 
              type="number" 
              value={trip.airfareAmount || 0}
              onChange={handleAirfareChange}
              className="quick-num-input"
            />
            <select 
              value={trip.airfareCurrency || 'TWD'}
              onChange={handleAirfareCurrencyChange}
              className="currency-select mini"
            >
              <option value="TWD">TWD</option>
              <option value={currencyName}>{currencyName}</option>
            </select>
          </div>
        </div>

        {/* 快捷操作按鈕組 */}
        <div className="dashboard-actions">
          <button 
            onClick={onToggleMap} 
            className={`btn btn-secondary ${isMapVisible ? 'active-map' : ''}`}
            title="開關地圖路徑呈現"
          >
            <MapIcon size={16} />
            <span>{isMapVisible ? '收起地圖' : '檢視地圖'}</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-secondary" title="匯出為標準 CSV">
            <Download size={16} />
            <span>匯出 CSV</span>
          </button>

          <button onClick={onOpenImportCSV} className="btn btn-secondary" title="匯入 CSV 建立行程">
            <Upload size={16} />
            <span>匯入 CSV</span>
          </button>

          <button onClick={handleDownloadSample} className="btn-icon" title="下載標準 CSV 範本">
            <FileText size={17} />
          </button>

          <button onClick={onOpenAIModal} className="btn btn-ai-sparkle" title="AI 助理 (健檢 / 微調 / 簡報)">
            <Sparkles size={16} />
            <span>AI 助理</span>
          </button>
        </div>
      </div>

      {/* 總預算大數字與 6 大類別小計卡片 */}
      <div className="budget-summary-grid">
        {/* 總結卡片 */}
        <div className="total-stat-card">
          <div className="stat-label">預計花費總計 (換算 TWD)</div>
          <div className="stat-twd-total">NT$ {grandTotalTWD.toLocaleString()}</div>
          <div className="stat-foreign-sub">
            外幣實支合計: {grandTotalForeign.toLocaleString()} {currencyName}
          </div>
        </div>

        {/* 6 個分類卡片 */}
        <div className="category-cards-container">
          {categoryCards.map(item => {
            const pct = grandTotalTWD > 0 ? Math.round((item.data.twd / grandTotalTWD) * 100) : 0;
            const Icon = item.icon;
            return (
              <div key={item.key} className="category-stat-card">
                <div className="cat-header">
                  <div className="cat-title-wrap">
                    <Icon size={16} style={{ color: item.color }} />
                    <span className="cat-name">{item.label}</span>
                  </div>
                  <span className="cat-pct">{pct}%</span>
                </div>
                <div className="cat-twd-val">NT$ {item.data.twd.toLocaleString()}</div>
                <div className="cat-foreign-val">
                  {item.data.foreign > 0 ? `${item.data.foreign.toLocaleString()} ${currencyName}` : '-'}
                </div>
                <div className="cat-progress-bg">
                  <div 
                    className="cat-progress-bar" 
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
