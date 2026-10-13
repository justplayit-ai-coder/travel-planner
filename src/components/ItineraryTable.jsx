import React from 'react';
import { 
  Calendar, 
  Train, 
  Sun, 
  Utensils, 
  Sunset, 
  Moon, 
  Hotel, 
  Receipt, 
  Plus, 
  Trash2
} from 'lucide-react';
import { convertItemToTWD } from '../utils/budgetCalculator';

export default function ItineraryTable({
  trip,
  onUpdateTrip,
  activeDayIndex,
  onSelectDay
}) {
  const currencyName = trip.currencyName || 'JPY';
  const exchangeRate = trip.exchangeRate || 0.205;

  // 處理特定天數內某個區塊的欄位更新
  const handleUpdateDayField = (dayIndex, section, field, value) => {
    const updatedDays = trip.days.map(d => {
      if (d.dayIndex !== dayIndex) return d;
      return {
        ...d,
        [section]: {
          ...d[section],
          [field]: value
        }
      };
    });
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // 輔助函式：取得區塊的文字內容（相容舊資料中零散的欄位）
  const getSectionText = (sec, defaultFields = []) => {
    if (!sec) return '';
    if (sec.details !== undefined && sec.details !== '') return sec.details;
    if (sec.notes !== undefined && sec.notes !== '') return sec.notes;
    // 將舊欄位內容組合成清晰多行字串
    const parts = defaultFields.map(f => sec[f]).filter(Boolean);
    return parts.join('\n');
  };

  // 處理日期字串更新
  const handleUpdateDate = (dayIndex, newDate) => {
    const updatedDays = trip.days.map(d => {
      if (d.dayIndex !== dayIndex) return d;
      return { ...d, date: newDate };
    });
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // 新增一天
  const handleAddDay = () => {
    const nextIndex = (trip.days?.length || 0) + 1;
    const newDay = {
      dayIndex: nextIndex,
      date: `Day ${nextIndex}`,
      transit: { details: '', expenseAmount: 0, currency: currencyName },
      morning: { details: '', expenseAmount: 0, currency: currencyName },
      lunch: { details: '', expenseAmount: 0, currency: currencyName },
      afternoon: { details: '', expenseAmount: 0, currency: currencyName },
      dinner: { details: '', expenseAmount: 0, currency: currencyName },
      evening: { details: '', expenseAmount: 0, currency: currencyName },
      accommodation: { details: '', expenseAmount: 0, currency: currencyName },
      miscellaneous: { details: '', expenseAmount: 0, currency: currencyName }
    };
    onUpdateTrip({ ...trip, days: [...(trip.days || []), newDay] });
  };

  // 刪除一天
  const handleDeleteDay = (dayIndex) => {
    if (trip.days.length <= 1) {
      alert('旅程至少需保留一天');
      return;
    }
    const filtered = trip.days
      .filter(d => d.dayIndex !== dayIndex)
      .map((d, idx) => ({ ...d, dayIndex: idx + 1 }));
    onUpdateTrip({ ...trip, days: filtered });
  };

  return (
    <div className="itinerary-table-container glass-panel">
      {/* 標題與操作按鈕 */}
      <div className="table-header-bar compact-header">
        <div className="header-left">
          <Calendar className="table-icon" size={17} />
          <h2 className="table-title">每日行程與花費</h2>
          <span className="days-counter">共 {trip.days?.length || 0} 天</span>
        </div>
        <button onClick={handleAddDay} className="btn btn-primary add-day-btn compact-btn">
          <Plus size={14} />
          <span>增加天數</span>
        </button>
      </div>

      {/* 每日卡片列表 */}
      <div className="days-wrapper">
        {(trip.days || []).map((day) => {
          const isSelected = activeDayIndex === day.dayIndex;

          // 計算當天總開銷折合台幣
          const dayExpenses = [
            convertItemToTWD(day.transit?.expenseAmount, day.transit?.currency, exchangeRate),
            convertItemToTWD(day.morning?.expenseAmount, day.morning?.currency, exchangeRate),
            convertItemToTWD(day.lunch?.expenseAmount, day.lunch?.currency, exchangeRate),
            convertItemToTWD(day.afternoon?.expenseAmount, day.afternoon?.currency, exchangeRate),
            convertItemToTWD(day.dinner?.expenseAmount, day.dinner?.currency, exchangeRate),
            convertItemToTWD(day.evening?.expenseAmount, day.evening?.currency, exchangeRate),
            convertItemToTWD(day.accommodation?.expenseAmount, day.accommodation?.currency, exchangeRate),
            convertItemToTWD(day.miscellaneous?.expenseAmount, day.miscellaneous?.currency, exchangeRate)
          ];
          const dayTotalTWD = dayExpenses.reduce((acc, v) => acc + v, 0);

          return (
            <div 
              key={day.dayIndex} 
              className={`day-card ${isSelected ? 'active-day-focus' : ''}`}
              onClick={() => onSelectDay && onSelectDay(day.dayIndex)}
            >
              {/* Day Header 頂部列：花費往左靠留空 10 字元，刪除 icon 靠最右切齊 */}
              <div className="day-card-header compact-day-header">
                <div className="day-header-left">
                  <div className="day-badge-wrap">
                    <span className="day-badge">Day {day.dayIndex}</span>
                    <input
                      type="text"
                      value={day.date}
                      onChange={(e) => handleUpdateDate(day.dayIndex, e.target.value)}
                      className="day-date-input"
                      placeholder="例: 2026-12-26 (六)"
                    />
                  </div>
                  <div className="day-total-badge pinned-left">
                    <span>當日花費: </span>
                    <strong>NT$ {dayTotalTWD.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="day-header-right-action">
                  {trip.days.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`確定要刪除第 ${day.dayIndex} 天嗎？`)) {
                          handleDeleteDay(day.dayIndex);
                        }
                      }}
                      className="btn-icon delete-day-btn"
                      title="刪除此天"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 依附圖 4x2 網格佈局：上排 4 格 (高度為下排 2 倍)，全部統一為自由文字區塊 */}
              <div className="day-grid-4x2">
                {/* ====== 上排 Row 1 (上排高度為下排兩倍) ====== */}
                
                {/* 1-1. 交通 (單純多行文字框，方便輸入多筆班次與轉乘資訊) */}
                <div className="grid-cell-card transit-card top-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Train size={14} className="cell-icon transit-color" />
                      <span>交通</span>
                    </div>
                    <span className="category-hint">交通</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.transit, ['trainCode', 'timeRange', 'duration', 'backupPlan'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'details', e.target.value)}
                      placeholder="輸入交通班次、時間、轉乘細節... (支援自由換行多筆輸入)"
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>交通費:</label>
                      <input
                        type="number"
                        value={day.transit?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.transit?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1-2. 上午行程 (單純多行文字框) */}
                <div className="grid-cell-card morning-card top-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Sun size={14} className="cell-icon morning-color" />
                      <span>上午行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.morning, ['location', 'details'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'details', e.target.value)}
                      placeholder="輸入上午行程、參訪景點、活動時間與細節..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>門票費:</label>
                      <input
                        type="number"
                        value={day.morning?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.morning?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1-3. 下午行程 (單純多行文字框) */}
                <div className="grid-cell-card afternoon-card top-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Sunset size={14} className="cell-icon afternoon-color" />
                      <span>下午行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.afternoon, ['location', 'details'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'details', e.target.value)}
                      placeholder="輸入下午景點、行程規劃與活動內容..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>門票費:</label>
                      <input
                        type="number"
                        value={day.afternoon?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.afternoon?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1-4. 晚上行程 (單純多行文字框) */}
                <div className="grid-cell-card evening-card top-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Moon size={14} className="cell-icon evening-color" />
                      <span>晚上行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.evening, ['location', 'details'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'details', e.target.value)}
                      placeholder="輸入夜間散策、購物商場、活動細節..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>門票費:</label>
                      <input
                        type="number"
                        value={day.evening?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.evening?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ====== 下排 Row 2 (下排高度為上排的一半) ====== */}

                {/* 2-1. 雜支 (單純多行文字框，正對應交通) */}
                <div className="grid-cell-card misc-card bottom-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Receipt size={14} className="cell-icon misc-color" />
                      <span>雜支</span>
                    </div>
                    <span className="category-hint">雜支</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.miscellaneous, ['notes'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'miscellaneous', 'details', e.target.value)}
                      placeholder="輸入雜項備註 (寄物櫃、超商零食、各項備用金)..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>雜支費:</label>
                      <input
                        type="number"
                        value={day.miscellaneous?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'miscellaneous', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.miscellaneous?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'miscellaneous', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2-2. 午餐 (單純多行文字框，正對應上午行程) */}
                <div className="grid-cell-card lunch-card bottom-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Utensils size={14} className="cell-icon lunch-color" />
                      <span>午餐</span>
                    </div>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.lunch, ['restaurant', 'location'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'details', e.target.value)}
                      placeholder="輸入午餐餐廳、菜色、地址與預約資訊..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>午餐費:</label>
                      <input
                        type="number"
                        value={day.lunch?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.lunch?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2-3. 晚餐 (單純多行文字框，正對應下午行程) */}
                <div className="grid-cell-card dinner-card bottom-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Utensils size={14} className="cell-icon dinner-color" />
                      <span>晚餐</span>
                    </div>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.dinner, ['restaurant', 'location'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'dinner', 'details', e.target.value)}
                      placeholder="輸入晚餐餐廳、在地料理、預約時段..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>晚餐費:</label>
                      <input
                        type="number"
                        value={day.dinner?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'dinner', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.dinner?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'dinner', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2-4. 住宿 (單純多行文字框，正對應晚上行程) */}
                <div className="grid-cell-card hotel-card bottom-tier-cell">
                  <div className="cell-header">
                    <div className="header-label">
                      <Hotel size={14} className="cell-icon hotel-color" />
                      <span>住宿</span>
                    </div>
                    <span className="category-hint">住宿</span>
                  </div>
                  <div className="cell-body flexible-body">
                    <textarea
                      value={getSectionText(day.accommodation, ['name', 'notes'])}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'details', e.target.value)}
                      placeholder="輸入飯店名稱、房型、溫泉設施、入住時間..."
                      className="pure-textarea"
                    />
                    <div className="expense-input-pill mini">
                      <label>住宿費:</label>
                      <input
                        type="number"
                        value={day.accommodation?.expenseAmount || 0}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'expenseAmount', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={day.accommodation?.currency || currencyName}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'currency', e.target.value)}
                      >
                        <option value={currencyName}>{currencyName}</option>
                        <option value="TWD">TWD</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
