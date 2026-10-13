import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Archive, 
  ArchiveRestore, 
  Compass, 
  FolderArchive, 
  Calendar, 
  LogOut, 
  Trash2,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({
  trips,
  activeTripId,
  onSelectTrip,
  onCreateTrip,
  onArchiveToggle,
  onDeleteTrip,
  onLockSystem,
  isCollapsed,
  onToggleCollapse
}) {
  const [historyOpen, setHistoryOpen] = useState(true);

  const activeTrips = trips.filter(t => !t.isArchived);
  const archivedTrips = trips.filter(t => t.isArchived);

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 頂部標題與收折按鈕 */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="brand-logo">
            <Compass className="brand-icon" size={24} />
            <span className="brand-text">旅程規劃庫</span>
          </div>
        )}
        <button 
          onClick={onToggleCollapse} 
          className="btn-icon collapse-btn"
          title={isCollapsed ? '展開側邊欄' : '收折側邊欄'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {/* 建立新旅程按鈕 */}
          <button onClick={onCreateTrip} className="btn btn-primary new-trip-btn">
            <Plus size={18} />
            <span>新增旅程</span>
          </button>

          {/* 進行中旅程分區 */}
          <div className="trip-section">
            <div className="section-title">
              <span>進行中旅程</span>
              <span className="count-badge">{activeTrips.length}</span>
            </div>
            <div className="trip-list">
              {activeTrips.map(trip => {
                const isActive = trip.id === activeTripId;
                return (
                  <div 
                    key={trip.id}
                    onClick={() => onSelectTrip(trip.id)}
                    className={`trip-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="trip-item-info">
                      <div className="trip-name" title={trip.name}>{trip.name}</div>
                      <div className="trip-dates">
                        <Calendar size={13} />
                        <span>{trip.startDate} ~ {trip.endDate}</span>
                      </div>
                    </div>
                    <div className="trip-item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveToggle(trip.id);
                        }}
                        className="btn-action-icon"
                        title="封存為歷史紀錄"
                      >
                        <Archive size={15} />
                      </button>
                      {trips.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`確定要刪除「${trip.name}」嗎？`)) {
                              onDeleteTrip(trip.id);
                            }
                          }}
                          className="btn-action-icon delete-icon"
                          title="刪除旅程"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 歷史紀錄分區（反灰變色、折疊收納、可點擊自由編輯） */}
          <div className="trip-section history-section">
            <div 
              className="section-title history-toggle-header"
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              <div className="title-left">
                <FolderArchive size={16} />
                <span>歷史紀錄 (已封存)</span>
                <span className="count-badge muted">{archivedTrips.length}</span>
              </div>
              <span className="toggle-indicator">{historyOpen ? '▼' : '►'}</span>
            </div>

            {historyOpen && (
              <div className="trip-list archived-list">
                {archivedTrips.length === 0 ? (
                  <div className="empty-hint">尚無歷史封存旅程</div>
                ) : (
                  archivedTrips.map(trip => {
                    const isActive = trip.id === activeTripId;
                    return (
                      <div 
                        key={trip.id}
                        onClick={() => onSelectTrip(trip.id)}
                        className={`trip-item archived-item ${isActive ? 'active' : ''}`}
                      >
                        <div className="trip-item-info">
                          <div className="trip-name" title={trip.name}>
                            <span className="archived-tag">歷史</span>
                            {trip.name}
                          </div>
                          <div className="trip-dates">
                            <Calendar size={13} />
                            <span>{trip.startDate} ~ {trip.endDate}</span>
                          </div>
                        </div>
                        <div className="trip-item-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchiveToggle(trip.id);
                            }}
                            className="btn-action-icon"
                            title="解除封存移回進行中"
                          >
                            <ArchiveRestore size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`確定要刪除歷史紀錄「${trip.name}」嗎？`)) {
                                onDeleteTrip(trip.id);
                              }
                            }}
                            className="btn-action-icon delete-icon"
                            title="刪除"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部登出功能 */}
      <div className="sidebar-footer">
        <button onClick={onLockSystem} className="btn-icon lock-btn" title="登出系統">
          <LogOut size={18} />
          {!isCollapsed && <span>登出</span>}
        </button>
      </div>
    </aside>
  );
}
