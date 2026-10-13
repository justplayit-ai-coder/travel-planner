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
      transit: { trainCode: '', timeRange: '', backupPlan: '', duration: '', expenseAmount: 0, currency: currencyName },
      morning: { details: '', location: '', expenseAmount: 0, currency: currencyName },
      lunch: { restaurant: '', location: '', expenseAmount: 0, currency: currencyName },
      afternoon: { details: '', location: '', expenseAmount: 0, currency: currencyName },
      dinner: { restaurant: '', location: '', expenseAmount: 0, currency: currencyName },
      evening: { details: '', location: '', expenseAmount: 0, currency: currencyName },
      accommodation: { name: '', roomType: '', notes: '', expenseAmount: 0, currency: currencyName },
      miscellaneous: { notes: '', expenseAmount: 0, currency: currencyName }
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
      {/* 標題與操作按鈕（文字與按鈕縮小 10%） */}
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
              {/* Day Header 頂部列（文字縮小 10%） */}
              <div className="day-card-header compact-day-header">
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
                <div className="day-header-right">
                  <div className="day-total-badge">
                    <span>當日花費: </span>
                    <strong>NT$ {dayTotalTWD.toLocaleString()}</strong>
                  </div>
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

              {/* 依附圖 4x2 完美排版佈局：上排 4 個，下排 4 個 */}
              <div className="day-grid-4x2">
                {/* ====== 上排 Row 1 ====== */}
                
                {/* 1-1. 交通 (上排第 1 格) */}
                <div className="grid-cell-card transit-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Train size={14} className="cell-icon transit-color" />
                      <span>交通</span>
                    </div>
                    <span className="category-hint">交通</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.transit?.trainCode || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'trainCode', e.target.value)}
                      placeholder="車次/班次 (例: はやぶさ 11號)"
                    />
                    <div className="sub-input-row">
                      <input
                        type="text"
                        value={day.transit?.timeRange || ''}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'timeRange', e.target.value)}
                        placeholder="時間起訖 (09:36-12:34)"
                      />
                      <input
                        type="text"
                        value={day.transit?.duration || ''}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'duration', e.target.value)}
                        placeholder="車程 (4h 45m)"
                        style={{ maxWidth: '90px' }}
                      />
                    </div>
                    <input
                      type="text"
                      value={day.transit?.backupPlan || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'backupPlan', e.target.value)}
                      placeholder="轉乘備案 / 備註"
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

                {/* 1-2. 上午行程 (上排第 2 格) */}
                <div className="grid-cell-card morning-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Sun size={14} className="cell-icon morning-color" />
                      <span>上午行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.morning?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="地點/景點名稱 (地圖定位)"
                    />
                    <textarea
                      value={day.morning?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'details', e.target.value)}
                      placeholder="活動與行程安排細節..."
                      rows={2}
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

                {/* 1-3. 下午行程 (上排第 3 格) */}
                <div className="grid-cell-card afternoon-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Sunset size={14} className="cell-icon afternoon-color" />
                      <span>下午行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.afternoon?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="地點/景點名稱 (地圖定位)"
                    />
                    <textarea
                      value={day.afternoon?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'details', e.target.value)}
                      placeholder="下午精華景點細節..."
                      rows={2}
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

                {/* 1-4. 晚上行程 (上排第 4 格) */}
                <div className="grid-cell-card evening-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Moon size={14} className="cell-icon evening-color" />
                      <span>晚上行程</span>
                    </div>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.evening?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="夜間散策/商圈 (地圖定位)"
                    />
                    <textarea
                      value={day.evening?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'details', e.target.value)}
                      placeholder="夜逛商場、溫泉放鬆..."
                      rows={2}
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

                {/* ====== 下排 Row 2 ====== */}

                {/* 2-1. 雜支 (下排第 1 格，正對應交通) */}
                <div className="grid-cell-card misc-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Receipt size={14} className="cell-icon misc-color" />
                      <span>雜支</span>
                    </div>
                    <span className="category-hint">雜支</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.miscellaneous?.notes || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'miscellaneous', 'notes', e.target.value)}
                      placeholder="雜支備註 (例: 寄物櫃、超商飲料)"
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

                {/* 2-2. 午餐 (下排第 2 格，正對應上午行程) */}
                <div className="grid-cell-card lunch-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Utensils size={14} className="cell-icon lunch-color" />
                      <span>午餐</span>
                    </div>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.lunch?.restaurant || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'restaurant', e.target.value)}
                      placeholder="餐廳名稱與特色料理..."
                    />
                    <input
                      type="text"
                      value={day.lunch?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="餐廳地址/區域 (地圖定位)"
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

                {/* 2-3. 晚餐 (下排第 3 格，正對應下午行程) */}
                <div className="grid-cell-card dinner-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Utensils size={14} className="cell-icon dinner-color" />
                      <span>晚餐</span>
                    </div>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.dinner?.restaurant || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'dinner', 'restaurant', e.target.value)}
                      placeholder="晚餐居酒屋/私廚餐廳..."
                    />
                    <input
                      type="text"
                      value={day.dinner?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'dinner', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="晚餐地址/區域 (地圖定位)"
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

                {/* 2-4. 住宿 (下排第 4 格，正對應晚上行程) */}
                <div className="grid-cell-card hotel-card">
                  <div className="cell-header">
                    <div className="header-label">
                      <Hotel size={14} className="cell-icon hotel-color" />
                      <span>住宿</span>
                    </div>
                    <span className="category-hint">住宿</span>
                  </div>
                  <div className="cell-body">
                    <input
                      type="text"
                      value={day.accommodation?.name || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'name', e.target.value)}
                      placeholder="飯店名稱 (例: ReLabo)"
                    />
                    <input
                      type="text"
                      value={day.accommodation?.notes || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'notes', e.target.value)}
                      placeholder="房型與設施備註 (溫泉 Spa)"
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
