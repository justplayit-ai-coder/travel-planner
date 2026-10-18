// Google Drive 獨立行程同步工具（每個旅遊行程獨立檔案）

const G_DRIVE_STORAGE_KEY = 'travel_planner_gdrive_url';
const G_DRIVE_LAST_SYNC_KEY = 'travel_planner_gdrive_last_sync';
const G_DRIVE_AUTO_SYNC_KEY = 'travel_planner_gdrive_auto_sync';

// 取得已儲存的 Google Apps Script Web App URL
export const getSavedGDriveUrl = () => {
  return localStorage.getItem(G_DRIVE_STORAGE_KEY) || '';
};

// 儲存 Google Apps Script Web App URL
export const saveGDriveUrl = (url) => {
  if (url) {
    localStorage.setItem(G_DRIVE_STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(G_DRIVE_STORAGE_KEY);
  }
};

// 取得最後同步時間字串
export const getLastSyncTime = () => {
  return localStorage.getItem(G_DRIVE_LAST_SYNC_KEY) || '';
};

// 取得是否開啟自動同步
export const getAutoSyncSetting = () => {
  return localStorage.getItem(G_DRIVE_AUTO_SYNC_KEY) === 'true';
};

// 設定是否開啟自動同步
export const saveAutoSyncSetting = (enabled) => {
  localStorage.setItem(G_DRIVE_AUTO_SYNC_KEY, enabled ? 'true' : 'false');
};

// 格式化安全檔名
export const sanitizeFileName = (name) => {
  const base = (name || '未命名旅程').replace(/[\/\\:*?"<>|]/g, '_').trim();
  return base.endsWith('.json') ? base : `${base}.json`;
};

// 上傳單一獨立旅程資料至 Google Drive (以該旅程名稱獨立建立或覆蓋)
export const uploadSingleTripToGoogleDrive = async (tripData, scriptUrl, specifiedFileName = '') => {
  const targetUrl = scriptUrl || getSavedGDriveUrl();
  if (!targetUrl) {
    throw new Error('尚未設定 Google Apps Script 網頁應用程式網址');
  }

  const fileName = specifiedFileName ? sanitizeFileName(specifiedFileName) : sanitizeFileName(tripData.name);
  const tripName = fileName.replace(/\.json$/i, '');

  const payload = {
    action: 'save',
    tripName: tripName,
    fileName: fileName,
    savedAt: new Date().toISOString(),
    data: tripData
  };

  try {
    const separator = targetUrl.includes('?') ? '&' : '?';
    // 同時在 URL Query String 與 Body Payload 傳送檔名，雙重保險
    const postUrl = `${targetUrl}${separator}action=save&tripName=${encodeURIComponent(tripName)}&fileName=${encodeURIComponent(fileName)}`;

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success' || result.result === 'success') {
      const nowStr = new Date().toLocaleString('zh-TW');
      localStorage.setItem(G_DRIVE_LAST_SYNC_KEY, nowStr);
      return { 
        success: true, 
        timestamp: nowStr, 
        fileName: result.fileName || fileName,
        fileId: result.fileId, 
        url: result.fileUrl 
      };
    } else {
      throw new Error(result.error || result.message || '儲存失敗');
    }
  } catch (err) {
    console.error('Google Drive 單一行程上傳失敗:', err);
    throw err;
  }
};

// 從 Google Drive 下載指定或當前行程資料
export const downloadSingleTripFromGoogleDrive = async (tripName, scriptUrl) => {
  const targetUrl = scriptUrl || getSavedGDriveUrl();
  if (!targetUrl) {
    throw new Error('尚未設定 Google Apps Script 網頁應用程式網址');
  }

  try {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const cleanName = tripName ? encodeURIComponent(tripName.replace(/[\/\\:*?"<>|]/g, '_').trim()) : '';
    const url = `${targetUrl}${separator}action=read&tripName=${cleanName}&fileName=${cleanName}&t=${Date.now()}`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (result.status === 'error' || result.error) {
      throw new Error(result.message || result.error || '找不到該旅程之雲端檔案');
    }

    const tripData = result.data || result;
    const nowStr = new Date().toLocaleString('zh-TW');
    localStorage.setItem(G_DRIVE_LAST_SYNC_KEY, nowStr);

    return {
      success: true,
      data: tripData,
      fileName: result.fileName,
      timestamp: nowStr
    };
  } catch (err) {
    console.error('Google Drive 單一行程下載失敗:', err);
    throw err;
  }
};

// 取得雲端目錄中現有的所有獨立旅程清單
export const listGoogleDriveTrips = async (scriptUrl) => {
  const targetUrl = scriptUrl || getSavedGDriveUrl();
  if (!targetUrl) return [];

  try {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${targetUrl}${separator}action=list&t=${Date.now()}`);
    const result = await response.json();
    if (result.status === 'success' && Array.isArray(result.trips)) {
      return result.trips;
    }
    return [];
  } catch (err) {
    console.warn('無法取得雲端檔案清單:', err);
    return [];
  }
};
