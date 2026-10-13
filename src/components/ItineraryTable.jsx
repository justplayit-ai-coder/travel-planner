import React, { useState } from 'react';
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
  Trash2, 
  Clock, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  MapPin
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
      {/* 標題與操作按鈕 */}
      <div className="table-header-bar">
        <div className="header-left">
          <Calendar className="table-icon" size={20} />
          <h2 className="table-title">統一每日行程與花費工作表</h2>
          <span className="days-counter">共 {trip.days?.length || 0} 天行程</span>
        </div>
        <button onClick={handleAddDay} className="btn btn-primary add-day-btn">
          <Plus size={16} />
          <span>增加天數</span>
        </button>
      </div>

      {/* 每日卡片式工作表列 */}
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
              {/* Day Header 頂部列 */}
              <div className="day-card-header">
                <div className="day-badge-wrap">
                  <span className="day-badge">Day {day.dayIndex}</span>
                  <input
                    type="text"
                    value={day.date}
                    onChange={(e) => handleUpdateDate(day.dayIndex, e.target.value)}
                    className="day-date-input"
                    placeholder="例如: 2026-12-26 (六)"
                  />
                </div>
                <div className="day-header-right">
                  <div className="day-total-badge">
                    <span>當日花費換算: </span>
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
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* 核心區塊 1: 關鍵交通安排（獨立一區） */}
              <div className="section-block transit-block">
                <div className="block-title">
                  <Train size={16} className="block-icon" />
                  <span>關鍵交通班次與車程</span>
                </div>
                <div className="block-grid">
                  <div className="field-group">
                    <label>車次／班次編號</label>
                    <input
                      type="text"
                      value={day.transit?.trainCode || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'trainCode', e.target.value)}
                      placeholder="例: はやぶさ 11號 (東京->新青森)"
                    />
                  </div>
                  <div className="field-group">
                    <label>搭乘時間起訖</label>
                    <input
                      type="text"
                      value={day.transit?.timeRange || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'timeRange', e.target.value)}
                      placeholder="例: 09:36-12:34"
                    />
                  </div>
                  <div className="field-group">
                    <label>轉乘備案 / 備註</label>
                    <input
                      type="text"
                      value={day.transit?.backupPlan || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'backupPlan', e.target.value)}
                      placeholder="例: 13:52 白神4號備案"
                    />
                  </div>
                  <div className="field-group duration-group">
                    <label>當日總車程</label>
                    <input
                      type="text"
                      value={day.transit?.duration || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'transit', 'duration', e.target.value)}
                      placeholder="例: 4h 45m"
                    />
                  </div>
                  {/* 交通花費 */}
                  <div className="field-group expense-group">
                    <label>交通費用</label>
                    <div className="expense-input-pill">
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
              </div>

              {/* 核心區塊 2: 每日時段行程與用餐（獨立拆分欄位） */}
              <div className="schedule-segments-container">
                {/* 2-1: 上午行程 */}
                <div className="segment-card">
                  <div className="segment-header">
                    <Sun size={15} className="seg-icon morning-color" />
                    <span>上午行程</span>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="segment-body">
                    <input
                      type="text"
                      value={day.morning?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="地點/景點名稱 (供地圖定位)"
                    />
                    <textarea
                      value={day.morning?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'morning', 'details', e.target.value)}
                      placeholder="活動與行程安排細節..."
                      rows={2}
                    />
                    <div className="expense-input-pill mini">
                      <label>門票花費:</label>
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

                {/* 2-2: 午餐安排 */}
                <div className="segment-card">
                  <div className="segment-header">
                    <Utensils size={15} className="seg-icon lunch-color" />
                    <span>午餐安排</span>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="segment-body">
                    <input
                      type="text"
                      value={day.lunch?.restaurant || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'restaurant', e.target.value)}
                      placeholder="餐廳名稱與特色菜餚..."
                    />
                    <input
                      type="text"
                      value={day.lunch?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'lunch', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="餐廳地址/區域 (供地圖定位)"
                    />
                    <div className="expense-input-pill mini">
                      <label>餐費花費:</label>
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

                {/* 2-3: 下午行程 */}
                <div className="segment-card">
                  <div className="segment-header">
                    <Sunset size={15} className="seg-icon afternoon-color" />
                    <span>下午行程</span>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="segment-body">
                    <input
                      type="text"
                      value={day.afternoon?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="地點/景點名稱 (供地圖定位)"
                    />
                    <textarea
                      value={day.afternoon?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'afternoon', 'details', e.target.value)}
                      placeholder="下午精華景點細節..."
                      rows={2}
                    />
                    <div className="expense-input-pill mini">
                      <label>門票花費:</label>
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

                {/* 2-4: 晚餐安排 */}
                <div className="segment-card">
                  <div className="segment-header">
                    <Utensils size={15} className="seg-icon dinner-color" />
                    <span>晚餐安排</span>
                    <span className="category-hint">餐食</span>
                  </div>
                  <div className="segment-body">
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
                      placeholder="晚餐地址/區域 (供地圖定位)"
                    />
                    <div className="expense-input-pill mini">
                      <label>餐費花費:</label>
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

                {/* 2-5: 晚上行程 */}
                <div className="segment-card">
                  <div className="segment-header">
                    <Moon size={15} className="seg-icon evening-color" />
                    <span>晚上行程</span>
                    <span className="category-hint">行程門票</span>
                  </div>
                  <div className="segment-body">
                    <input
                      type="text"
                      value={day.evening?.location || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'location', e.target.value)}
                      className="location-sub-input"
                      placeholder="夜間散策/商圈 (供地圖定位)"
                    />
                    <textarea
                      value={day.evening?.details || ''}
                      onChange={(e) => handleUpdateDayField(day.dayIndex, 'evening', 'details', e.target.value)}
                      placeholder="夜逛商場、溫泉放鬆..."
                      rows={2}
                    />
                    <div className="expense-input-pill mini">
                      <label>門票花費:</label>
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
              </div>

              {/* 核心區塊 3 & 4: 夜間住宿（獨立一區）與 雜項支出（獨立一欄） */}
              <div className="bottom-sections-row">
                {/* 夜間住宿 */}
                <div className="section-block accommodation-block">
                  <div className="block-title">
                    <Hotel size={16} className="block-icon hotel-color" />
                    <span>夜間住宿安排</span>
                  </div>
                  <div className="block-grid-hotel">
                    <div className="field-group">
                      <label>飯店名稱</label>
                      <input
                        type="text"
                        value={day.accommodation?.name || ''}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'name', e.target.value)}
                        placeholder="例: 青森市區飯店 ReLabo"
                      />
                    </div>
                    <div className="field-group">
                      <label>房型與設施備註</label>
                      <input
                        type="text"
                        value={day.accommodation?.notes || ''}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'accommodation', 'notes', e.target.value)}
                        placeholder="例: 雙人景觀房 含露天風呂 Spa"
                      />
                    </div>
                    <div className="field-group expense-group">
                      <label>住宿費用</label>
                      <div className="expense-input-pill">
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

                {/* 雜項支出獨立一欄 */}
                <div className="section-block misc-block">
                  <div className="block-title">
                    <Receipt size={16} className="block-icon misc-color" />
                    <span>雜項支出備註與花費</span>
                  </div>
                  <div className="block-grid-misc">
                    <div className="field-group misc-notes-group">
                      <label>雜支備註項目說明</label>
                      <input
                        type="text"
                        value={day.miscellaneous?.notes || ''}
                        onChange={(e) => handleUpdateDayField(day.dayIndex, 'miscellaneous', 'notes', e.target.value)}
                        placeholder="例: 寄物櫃 2 個、超商補給品、伴手禮盒"
                      />
                    </div>
                    <div className="field-group expense-group">
                      <label>雜支費用</label>
                      <div className="expense-input-pill">
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
