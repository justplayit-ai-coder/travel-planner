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
  ListFilter,
  HelpCircle
} from 'lucide-react';
import { 
  getSavedGDriveUrl, 
  saveGDriveUrl, 
  uploadSingleTripToGoogleDrive, 
  downloadSingleTripFromGoogleDrive,
  listGoogleDriveTrips,
  getLastSyncTime,
  getAutoSyncSetting,
  saveAutoSyncSetting,
  sanitizeFileName
} from '../utils/googleDriveSync';

export const TARGET_FOLDER_ID = '1yi7a4WjqcOstiWWDH9KixKpb2ZRgDrDG';
export const TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}`;

export const GAS_CODE_SNIPPET = `// Google Apps Script：獨立行程檔案同步伺服端程式碼 (無死角支援自訂檔名)
const TARGET_FOLDER_ID = "${TARGET_FOLDER_ID}";

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (ex) {}
    }

    // 優先順序：URL 參數 > Payload 檔名 > 旅程名稱
    let rawName = (e.parameter && (e.parameter.fileName || e.parameter.tripName))
               || payload.fileName 
               || payload.tripName 
               || (payload.data && payload.data.name) 
               || "travel-plan";

    let cleanName = (rawName + "").replace(/[\\\\/:*?"<>|]/g, "_").trim();
    if (!cleanName) cleanName = "trip";
    if (!cleanName.toLowerCase().endsWith(".json")) cleanName += ".json";

    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    const files = folder.getFilesByName(cleanName);
    let file;
    const fileContent = JSON.stringify(payload.data || payload, null, 2);

    // 存在同名獨立檔案則覆蓋更新，不存在則建立新檔案
    if (files.hasNext()) {
      file = files.next();
      file.setContent(fileContent);
    } else {
      file = folder.createFile(cleanName, fileContent, MimeType.PLAIN_TEXT);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileName: cleanName,
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
    const action = e.parameter ? e.parameter.action : "";

    // 動作 1：列出目錄中所有已存在的獨立行程 .json 檔案
    if (action === "list") {
      const files = folder.getFiles();
      const list = [];
      while (files.hasNext()) {
        const f = files.next();
        if (f.getName().toLowerCase().endsWith(".json")) {
          list.push({
            name: f.getName().replace(/\\.json$/i, ""),
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

    // 動作 2：下載指定檔名之旅程
    let reqName = (e.parameter && (e.parameter.fileName || e.parameter.tripName)) || "";
    let cleanName = (reqName + "").replace(/[\\\\/:*?"<>|]/g, "_").trim();
    if (cleanName && !cleanName.toLowerCase().endsWith(".json")) cleanName += ".json";

    let targetFile = null;
    if (cleanName) {
      const matched = folder.getFilesByName(cleanName);
      if (matched.hasNext()) targetFile = matched.next();
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
      message: "指定目錄中找不到檔案: " + (cleanName || "未指定檔名")
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
  const [customFileName, setCustomFileName] = useState('');
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());
  const [autoSync, setAutoSync] = useState(() => getAutoSyncSetting());
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // 當切換旅程時，自動更新預設自訂檔名
  useEffect(() => {
    if (activeTrip && activeTrip.name) {
      setCustomFileName(sanitizeFileName(activeTrip.name));
    }
  }, [activeTrip?.name]);

  // 開啟彈窗時自動檢查雲端已有之檔案清單
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
      const res = await uploadSingleTripToGoogleDrive(activeTrip, scriptUrl, customFileName);
      setLastSync(res.timestamp);
      setStatusMessage({
        type: 'success',
        text: `備份成功！已獨立儲存為「${res.fileName}」（時間：${res.timestamp}）`
      });
      loadRemoteFiles();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `上傳失敗：${err.message || '請確認 Web App 網址是否正確，且存取權限是否設為所有人'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 下載還原指定或當前行程
  const handleDownloadSpecific = async (targetFileName) => {
    if (!scriptUrl) {
      setStatusMessage({ type: 'error', text: '請先填寫 Google Apps Script 網頁應用程式網址' });
      return;
    }
    saveGDriveUrl(scriptUrl);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const target = targetFileName || customFileName;
      const res = await downloadSingleTripFromGoogleDrive(target, scriptUrl);
      if (res.data) {
        onRestoreTrip(res.data);
        setLastSync(res.timestamp);
        setStatusMessage({
          type: 'success',
          text: `還原成功！已成功載入「${res.fileName || target}」（時間：${res.timestamp}）`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `下載還原失敗：${err.message || '雲端目錄中未找到該檔案'}`
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
          {/* 指定目錄標示 */}
          <div className="gdrive-folder-pill">
            <div className="folder-pill-left">
              <FolderLock size={16} className="text-primary" />
              <div className="folder-text-group">
                <span className="folder-tag">指定儲存目錄：</span>
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

          {/* 當前行程之檔案名稱設定列 */}
          <div className="gdrive-file-naming-card">
            <div className="naming-label-row">
              <div className="naming-title">
                <FileText size={15} className="text-primary" />
                <span>本次同步之獨立檔案名稱：</span>
              </div>
              <span className="naming-hint">各行程自動獨立檔案，絕不混淆覆蓋</span>
            </div>
            <div className="file-name-input-row">
              <input 
                type="text" 
                value={customFileName}
                onChange={e => setCustomFileName(e.target.value)}
                placeholder="例如: 東北雪之聖誕與東京跨年之旅.json"
                className="custom-filename-input"
              />
            </div>
          </div>

          {/* Web App URL 設定列 */}
          <div className="gdrive-input-section">
            <div className="gdrive-label">
              <span>Google Apps Script 網頁應用程式網址 (Web App URL)：</span>
              <button 
                type="button" 
                onClick={() => setShowCodeGuide(!showCodeGuide)}
                className="guide-toggle-btn"
              >
                <HelpCircle size={13} />
                <span>{showCodeGuide ? '收起部署指南' : '程式碼更新重要提示'}</span>
              </button>
            </div>
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
                <strong className="text-warning">為什麼之前會覆蓋同一個檔案？</strong>
                <button 
                  onClick={handleCopyCode} 
                  className="btn btn-sm btn-primary copy-code-btn"
                >
                  <Copy size={13} />
                  <span>{copied ? '已複製新程式碼' : '複製最新 Apps Script 程式碼'}</span>
                </button>
              </div>
              <p className="guide-explanation">
                Google Apps Script 在編輯存檔後，<strong>舊網址仍會繼續跑第一版的舊快取</strong>。請依照下方步驟點擊「新部署」才能讓新程式碼生效：
              </p>
              <ol className="guide-steps-list">
                <li>進入 Apps Script 貼上最新程式碼並按儲存。</li>
                <li>點擊右上角「<strong>部署</strong>」 &gt;「<strong>新部署</strong>」（請勿只按管理部署）。</li>
                <li>確認類型為「網頁應用程式」，「誰可以存取」為「<strong>所有人</strong>」。</li>
                <li>點擊「部署」，複製<strong>新產生的網址</strong>貼回上方欄位即可！</li>
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
              <span>獨立備份此行程至雲端</span>
            </button>

            <button 
              onClick={() => handleDownloadSpecific()}
              disabled={isLoading}
              className="btn btn-secondary sync-action-btn"
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <DownloadCloud size={16} />}
              <span>從雲端下載還原此行程</span>
            </button>
          </div>

          {/* 雲端資料夾中已存在的獨立行程清單 */}
          {remoteFiles.length > 0 && (
            <div className="remote-trips-section">
              <div className="remote-section-title">
                <ListFilter size={14} />
                <span>雲端資料夾中現有的行程檔案 (點擊即可載入)：</span>
              </div>
              <div className="remote-trips-list">
                {remoteFiles.map(rf => (
                  <div key={rf.fileId} className="remote-trip-pill">
                    <div className="remote-pill-info">
                      <span className="remote-trip-title">{rf.fileName}</span>
                    </div>
                    <button 
                      onClick={() => handleDownloadSpecific(rf.fileName)}
                      className="btn btn-sm btn-secondary compact-btn"
                    >
                      載入此檔案
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
              <span>自動定時備份此行程</span>
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
