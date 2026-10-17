import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  X, 
  RefreshCw,
  FolderLock,
  FileCode,
  FileText,
  ListFilter
} from 'lucide-react';
import { 
  getSavedGDriveUrl, 
  saveGDriveUrl, 
  uploadSingleTripToGoogleDrive, 
  downloadSingleTripFromGoogleDrive,
  listGoogleDriveTrips,
  getLastSyncTime,
  getAutoSyncSetting,
  saveAutoSyncSetting
} from '../utils/googleDriveSync';

export const TARGET_FOLDER_ID = '1yi7a4WjqcOstiWWDH9KixKpb2ZRgDrDG';
export const TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}`;

export const GAS_CODE_SNIPPET = `// Google Apps Script：獨立行程檔案同步伺服端程式碼
const TARGET_FOLDER_ID = "${TARGET_FOLDER_ID}";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    
    // 依據各旅程名稱建立獨立檔案（例如：東北雪之聖誕與東京跨年之旅.json）
    let rawName = payload.tripName || (payload.data && payload.data.name) || "travel-plan";
    let safeName = rawName.replace(/[/\\\\:*?"<>|]/g, "_").trim();
    if (!safeName.endsWith(".json")) safeName += ".json";
    
    const files = folder.getFilesByName(safeName);
    let file;
    const fileContent = JSON.stringify(payload.data || payload, null, 2);
    
    // 存在則覆蓋更新該旅程主檔，不存在則建立新檔
    if (files.hasNext()) {
      file = files.next();
      file.setContent(fileContent);
    } else {
      file = folder.createFile(safeName, fileContent, MimeType.PLAIN_TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileName: safeName,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    const action = e.parameter.action;
    
    // 動作 1：列出目錄下所有已儲存的獨立旅程檔案
    if (action === "list") {
      const files = folder.getFiles();
      const list = [];
      while (files.hasNext()) {
        const f = files.next();
        if (f.getName().endsWith(".json")) {
          list.push({
            name: f.getName().replace(/\\.json$/, ""),
            fileName: f.getName(),
            fileId: f.getId(),
            updatedAt: f.getLastUpdated().toISOString()
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        trips: list
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 動作 2：下載指定旅程主檔
    let reqName = e.parameter.tripName || "";
    if (reqName && !reqName.endsWith(".json")) reqName += ".json";
    
    let targetFile = null;
    if (reqName) {
      const matched = folder.getFilesByName(reqName);
      if (matched.hasNext()) targetFile = matched.next();
    } else {
      const allFiles = folder.getFiles();
      while (allFiles.hasNext()) {
        const f = allFiles.next();
        if (f.getName().endsWith(".json")) {
          targetFile = f;
          break;
        }
      }
    }
    
    if (targetFile) {
      const content = targetFile.getBlob().getDataAsString();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileName: targetFile.getName(),
        data: JSON.parse(content),
        updatedAt: targetFile.getLastUpdated().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "指定目錄中尚未發現 " + (reqName || "任何 .json") + " 檔案"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function GoogleDriveSyncModal({
  isOpen,
  onClose,
  activeTrip,
  onRestoreTrip
}) {
  const [scriptUrl, setScriptUrl] = useState(() => getSavedGDriveUrl());
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());
  const [autoSync, setAutoSync] = useState(() => getAutoSyncSetting());
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // 當前欲同步之獨立檔案名稱
  const currentFileName = activeTrip ? `${(activeTrip.name || 'travel-plan').replace(/[\/\\:*?"<>|]/g, '_')}.json` : 'travel-plan.json';

  // 嘗試載入雲端現有檔案列表
  useEffect(() => {
    if (isOpen && scriptUrl) {
      loadRemoteFiles();
    }
  }, [isOpen, scriptUrl]);

  const loadRemoteFiles = async () => {
    if (!scriptUrl) return;
    setIsLoadingList(true);
    try {
      const list = await listGoogleDriveTrips(scriptUrl);
      setRemoteFiles(list);
    } catch (e) {
      console.warn('載入雲端清單失敗:', e);
    } finally {
      setIsLoadingList(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveGDriveUrl(scriptUrl);
    setStatusMessage({ type: 'success', text: '已儲存 Web App 網址設定' });
    loadRemoteFiles();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 上傳當前獨立行程
  const handleUploadCurrent = async () => {
    if (!scriptUrl) {
      setStatusMessage({ type: 'error', text: '請先填寫 Google Apps Script 網頁應用程式網址' });
      return;
    }
    if (!activeTrip) {
      setStatusMessage({ type: 'error', text: '找不到當前啟用的旅程' });
      return;
    }
    saveGDriveUrl(scriptUrl);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await uploadSingleTripToGoogleDrive(activeTrip, scriptUrl);
      setLastSync(res.timestamp);
      setStatusMessage({
        type: 'success',
        text: `備份成功！已獨立儲存為「${res.fileName}」（${res.timestamp}）`
      });
      loadRemoteFiles();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `上傳失敗：${err.message || '請確認 Web App 網址與存取權限是否設定為「所有人」'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 下載還原指定或當前行程
  const handleDownloadSpecific = async (targetTripName) => {
    if (!scriptUrl) {
      setStatusMessage({ type: 'error', text: '請先填寫 Google Apps Script 網頁應用程式網址' });
      return;
    }
    saveGDriveUrl(scriptUrl);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const queryName = targetTripName || (activeTrip ? activeTrip.name : '');
      const res = await downloadSingleTripFromGoogleDrive(queryName, scriptUrl);
      if (res.data) {
        onRestoreTrip(res.data);
        setLastSync(res.timestamp);
        setStatusMessage({
          type: 'success',
          text: `還原成功！已自「${res.fileName || queryName}」載入最新行程（${res.timestamp}）`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `下載還原失敗：${err.message || '請確認該行程檔案是否存在於雲端目錄中'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoSync = (e) => {
    const val = e.target.checked;
    setAutoSync(val);
    saveAutoSyncSetting(val);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card gdrive-modal glass-panel" onClick={e => e.stopPropagation()}>
        {/* Modal 頂部 Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Cloud size={20} className="gdrive-icon-color" />
            <h3 className="modal-title">Google 雲端硬碟 (Google Drive) 獨立行程同步</h3>
          </div>
          <button onClick={onClose} className="btn-icon modal-close-btn" title="關閉">
            <X size={18} />
          </button>
        </div>

        {/* Modal 內容區 */}
        <div className="modal-body-content">
          {/* 指定目錄與獨立檔案標示 */}
          <div className="gdrive-folder-pill">
            <div className="folder-pill-left">
              <FolderLock size={16} className="text-primary" />
              <div className="folder-text-group">
                <span className="folder-tag">指定目錄：</span>
                <span className="folder-id-code">{TARGET_FOLDER_ID}</span>
              </div>
            </div>
            <a 
              href={TARGET_FOLDER_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-sm btn-secondary folder-link-btn"
            >
              <span>開啟 Google Drive 目錄</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* 當前旅程獨立主檔名稱提示 */}
          <div className="current-trip-target-banner">
            <FileText size={15} className="text-secondary" />
            <span>當前操作行程之獨立主檔：</span>
            <strong className="text-accent">{currentFileName}</strong>
          </div>

          {/* Web App URL 設定列 */}
          <div className="gdrive-input-section">
            <label className="gdrive-label">
              <span>Google Apps Script 網頁應用程式網址 (Web App URL)：</span>
              <button 
                type="button" 
                onClick={() => setShowCodeGuide(!showCodeGuide)}
                className="guide-toggle-btn"
              >
                <FileCode size={13} />
                <span>{showCodeGuide ? '隱藏部署步驟' : '如何取得此網址？'}</span>
              </button>
            </label>
            <div className="url-input-wrap">
              <input 
                type="text"
                value={scriptUrl}
                onChange={e => setScriptUrl(e.target.value)}
                placeholder="例: https://script.google.com/macros/s/AKfycb.../exec"
                className="gdrive-url-input"
              />
              <button 
                onClick={handleSaveUrl} 
                className="btn btn-secondary compact-btn"
                title="儲存設定"
              >
                儲存網址
              </button>
            </div>
          </div>

          {/* 部署指引折疊區塊 */}
          {showCodeGuide && (
            <div className="gdrive-deploy-guide glass-card">
              <div className="guide-header">
                <strong>快速取得 Web App 網址 4 步驟（已設定各行程獨立主檔）：</strong>
                <button 
                  onClick={handleCopyCode} 
                  className="btn btn-sm btn-primary copy-code-btn"
                >
                  <Copy size={13} />
                  <span>{copied ? '已複製程式碼' : '複製 Apps Script 程式碼'}</span>
                </button>
              </div>
              <ol className="guide-steps-list">
                <li>前往上方連結進入指定的 Google Drive 資料夾。</li>
                <li>點擊左上角「新增」 &gt;「更多」 &gt;「Google Apps Script」。</li>
                <li>清空預設文字並貼入已複製之專屬程式碼（自動支援依行程名稱分檔）。</li>
                <li>點擊右上角「部署」 &gt;「新部署」：種類選「網頁應用程式」，「誰可以存取」務必選取「<strong>所有人</strong>」，點擊部署後將產生的 Web app URL 貼至上方欄位即可。</li>
              </ol>
            </div>
          )}

          {/* 操作按鈕區 */}
          <div className="gdrive-actions-row">
            <button 
              onClick={handleUploadCurrent}
              disabled={isLoading}
              className="btn btn-primary sync-action-btn"
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <UploadCloud size={16} />}
              <span>備份當前行程至獨立主檔</span>
            </button>

            <button 
              onClick={() => handleDownloadSpecific()}
              disabled={isLoading}
              className="btn btn-secondary sync-action-btn"
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <DownloadCloud size={16} />}
              <span>還原當前行程最新版本</span>
            </button>
          </div>

          {/* 雲端資料夾中已存在的獨立行程清單 */}
          {remoteFiles.length > 0 && (
            <div className="remote-trips-section">
              <div className="remote-section-title">
                <ListFilter size={14} />
                <span>雲端資料夾中已儲存的行程列表 (點擊可直接載入還原)：</span>
              </div>
              <div className="remote-trips-list">
                {remoteFiles.map(rf => (
                  <div key={rf.fileId} className="remote-trip-pill">
                    <span className="remote-trip-title">{rf.fileName}</span>
                    <button 
                      onClick={() => handleDownloadSpecific(rf.name)}
                      className="btn btn-sm btn-secondary compact-btn"
                    >
                      載入此行程
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 最後同步狀態與自動同步設定 */}
          <div className="sync-footer-row">
            <div className="sync-time-info">
              <span>最後同步時間：</span>
              <strong>{lastSync || '尚未同步'}</strong>
            </div>

            <label className="auto-sync-checkbox-label">
              <input 
                type="checkbox" 
                checked={autoSync} 
                onChange={handleToggleAutoSync} 
              />
              <span>自動定時備份當前行程</span>
            </label>
          </div>

          {/* 狀態訊息提示 */}
          {statusMessage && (
            <div className={`status-banner ${statusMessage.type}`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
