// Google Drive 同步處理工具（透過 Google Apps Script Web App）

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

// 上傳旅程資料至 Google Drive
export const uploadTripToGoogleDrive = async (tripsData, scriptUrl) => {
  const targetUrl = scriptUrl || getSavedGDriveUrl();
  if (!targetUrl) {
    throw new Error('尚未設定 Google Apps Script 網頁應用程式網址');
  }

  const payload = {
    action: 'save',
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    data: tripsData
  };

  try {
    // 使用 text/plain 發送避免觸發 CORS 預檢限制，GAS 可自 e.postData.contents 完整解析
    const response = await fetch(targetUrl, {
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
      return { success: true, timestamp: nowStr, fileId: result.fileId, url: result.fileUrl };
    } else {
      throw new Error(result.error || result.message || '儲存失敗');
    }
  } catch (err) {
    console.error('Google Drive 上傳失敗:', err);
    throw err;
  }
};

// 從 Google Drive 下載旅程資料
export const downloadTripFromGoogleDrive = async (scriptUrl) => {
  const targetUrl = scriptUrl || getSavedGDriveUrl();
  if (!targetUrl) {
    throw new Error('尚未設定 Google Apps Script 網頁應用程式網址');
  }

  try {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${targetUrl}${separator}action=read&t=${Date.now()}`);
    const result = await response.json();

    if (result.status === 'error' || result.error) {
      throw new Error(result.error || '找不到雲端備份檔案');
    }

    const tripsData = result.data || result;
    const nowStr = new Date().toLocaleString('zh-TW');
    localStorage.setItem(G_DRIVE_LAST_SYNC_KEY, nowStr);

    return {
      success: true,
      data: tripsData,
      timestamp: nowStr
    };
  } catch (err) {
    console.error('Google Drive 下載失敗:', err);
    throw err;
  }
};
