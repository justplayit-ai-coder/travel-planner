import React, { useState, useEffect } from 'react';
import { initialTrips } from './data/initialTrips';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import BudgetDashboard from './components/BudgetDashboard';
import ItineraryTable from './components/ItineraryTable';
import LeafletMapVisualizer from './components/LeafletMapVisualizer';
import AIAssistantModal from './components/AIAssistantModal';
import ImportCSVModal from './components/ImportCSVModal';
import GoogleDriveSyncModal from './components/GoogleDriveSyncModal';

function App() {
  // 1. 金鑰密碼驗證狀態
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('travel_auth_unlocked') === 'true';
  });

  // 2. 旅程清單狀態（自動持久化至 LocalStorage）
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('travel_planner_trips_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialTrips;
      }
    }
    return initialTrips;
  });

  // 當前選取之旅程 ID
  const [activeTripId, setActiveTripId] = useState(() => {
    return trips.length > 0 ? trips[0].id : 'trip-tohoku-2026';
  });

  // 側邊欄收折狀態
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 地圖可視狀態
  const [isMapVisible, setIsMapVisible] = useState(true);

  // 當前聚焦的天數（供地圖篩選連動）
  const [activeDayIndex, setActiveDayIndex] = useState(1);

  // 彈窗開關狀態
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);
  const [isGDriveModalOpen, setIsGDriveModalOpen] = useState(false);

  // 同步儲存至 LocalStorage
  useEffect(() => {
    localStorage.setItem('travel_planner_trips_v4', JSON.stringify(trips));
  }, [trips]);

  // 鎖定系統
  const handleLockSystem = () => {
    localStorage.removeItem('travel_auth_unlocked');
    setIsAuthenticated(false);
  };

  // 當前啟用的旅程物件
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  // 更新當前旅程
  const handleUpdateCurrentTrip = (updatedTrip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  // 建立新旅程
  const handleCreateTrip = () => {
    const newId = `trip-${Date.now()}`;
    const newTrip = {
      id: newId,
      name: `新旅程規劃 ${new Date().toLocaleDateString('zh-TW')}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      exchangeRate: 0.205,
      currencyName: 'JPY',
      isArchived: false,
      airfareAmount: 0,
      airfareCurrency: 'TWD',
      days: [
        {
          dayIndex: 1,
          date: 'Day 1',
          transit: { trainCode: '', timeRange: '', backupPlan: '', duration: '', expenseAmount: 0, currency: 'JPY' },
          morning: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
          lunch: { restaurant: '', location: '', expenseAmount: 0, currency: 'JPY' },
          afternoon: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
          dinner: { restaurant: '', location: '', expenseAmount: 0, currency: 'JPY' },
          evening: { details: '', location: '', expenseAmount: 0, currency: 'JPY' },
          accommodation: { name: '', roomType: '', notes: '', expenseAmount: 0, currency: 'JPY' },
          miscellaneous: { notes: '', expenseAmount: 0, currency: 'JPY' }
        }
      ]
    };
    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newId);
  };

  // 封存 / 取消封存旅程
  const handleArchiveToggle = (tripId) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, isArchived: !t.isArchived };
    }));
  };

  // 刪除旅程
  const handleDeleteTrip = (tripId) => {
    const remaining = trips.filter(t => t.id !== tripId);
    setTrips(remaining);
    if (activeTripId === tripId && remaining.length > 0) {
      setActiveTripId(remaining[0].id);
    }
  };

  // 若尚未輸入密碼驗證，顯示高質感鎖定畫面
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="travel-app-layout">
      {/* 左側可收折側邊欄 */}
      <Sidebar
        trips={trips}
        activeTripId={activeTripId}
        onSelectTrip={setActiveTripId}
        onCreateTrip={handleCreateTrip}
        onArchiveToggle={handleArchiveToggle}
        onDeleteTrip={handleDeleteTrip}
        onLockSystem={handleLockSystem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 右側主應用區域 */}
      <main className="main-content-zone">
        {/* 頂部預算統計儀表板與操作列 */}
        {activeTrip && (
          <BudgetDashboard
            trip={activeTrip}
            onUpdateTrip={handleUpdateCurrentTrip}
            onOpenImportCSV={() => setIsImportCSVOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onOpenGDriveSync={() => setIsGDriveModalOpen(true)}
            isMapVisible={isMapVisible}
            onToggleMap={() => setIsMapVisible(!isMapVisible)}
          />
        )}

        {/* 內容分割區：左側每日行程圖卡 (隨捲軸移動) + 右側固定地圖版位 (不隨捲軸移動) */}
        <div className="workspace-split">
          <div className="table-view-column">
            {activeTrip && (
              <ItineraryTable
                trip={activeTrip}
                onUpdateTrip={handleUpdateCurrentTrip}
                activeDayIndex={activeDayIndex}
                onSelectDay={setActiveDayIndex}
              />
            )}
          </div>

          {isMapVisible && activeTrip && (
            <div className="map-view-column">
              <LeafletMapVisualizer
                trip={activeTrip}
                activeDayIndex={activeDayIndex}
                onCloseMap={() => setIsMapVisible(false)}
              />
            </div>
          )}
        </div>
      </main>

      {/* AI 模型對話助理彈窗 */}
      {isAIModalOpen && activeTrip && (
        <AIAssistantModal
          trip={activeTrip}
          onUpdateTrip={handleUpdateCurrentTrip}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}

      {/* CSV 匯入彈窗 */}
      {isImportCSVOpen && activeTrip && (
        <ImportCSVModal
          trip={activeTrip}
          onUpdateTrip={handleUpdateCurrentTrip}
          onClose={() => setIsImportCSVOpen(false)}
        />
      )}

      {/* Google Drive 雲端同步設定與操作彈窗 */}
      <GoogleDriveSyncModal
        isOpen={isGDriveModalOpen}
        onClose={() => setIsGDriveModalOpen(false)}
        activeTrip={activeTrip}
        onRestoreTrip={(restoredTrip) => {
          if (!restoredTrip) return;
          setTrips(prev => {
            const exists = prev.some(t => t.id === restoredTrip.id || t.name === restoredTrip.name);
            if (exists) {
              return prev.map(t => (t.id === restoredTrip.id || t.name === restoredTrip.name) ? restoredTrip : t);
            }
            return [restoredTrip, ...prev];
          });
          if (restoredTrip.id) {
            setActiveTripId(restoredTrip.id);
          }
        }}
      />
    </div>
  );
}

export default App;
