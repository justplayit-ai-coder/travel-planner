import React, { useState } from 'react';
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
  FileCode
} from 'lucide-react';
import { 
  getSavedGDriveUrl, 
  saveGDriveUrl, 
  uploadTripToGoogleDrive, 
  downloadTripFromGoogleDrive,
  getLastSyncTime,
  getAutoSyncSetting,
  saveAutoSyncSetting
} from '../utils/googleDriveSync';

export const TARGET_FOLDER_ID = '1yi7a4WjqcOstiWWDH9KixKpb2ZRgDrDG';
export const TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}`;

export const GAS_CODE_SNIPPET = `// Google Apps Script 部署程式碼 (已綁定指定 Google Drive 目錄)
const TARGET_FOLDER_ID = "${TARGET_FOLDER_ID}";
const FILE_NAME = "travel-planner-data.json";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    const files = folder.getFilesByName(FILE_NAME);
    let file;
    
    const fileContent = JSON.stringify(payload.data || payload, null, 2);
    
    if (files.hasNext()) {
      file = files.next();
      file.setContent(fileContent);
    } else {
      file = folder.createFile(FILE_NAME, fileContent, MimeType.PLAIN_TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
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
    const files = folder.getFilesByName(FILE_NAME);
    
    if (files.hasNext()) {
      const file = files.next();
      const content = file.getBlob().getDataAsString();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: JSON.parse(content),
        updatedAt: file.getLastUpdated().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "雲端目錄內尚未發現 " + FILE_NAME + " 備份檔"
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
  trips,
  onRestoreTrips
}) {
  const [scriptUrl, setScriptUrl] = useState(() => getSavedGDriveUrl());
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());
  const [autoSync, setAutoSync] = useState(() => getAutoSyncSetting());
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCodeGuide, setShowCodeGuide] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveGDriveUrl(scriptUrl);
    setStatusMessage({ type: 'success', text: '已儲存 Web App 網址設定' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!scriptUrl) {
      setStatusMessage({ type: 'error', text: '請先填寫 Google Apps Script 網頁應用程式網址' });
      return;
    }
    saveGDriveUrl(scriptUrl);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await uploadTripToGoogleDrive(trips, scriptUrl);
      setLastSync(res.timestamp);
      setStatusMessage({
        type: 'success',
        text: `備份成功！檔案已儲存至 Google Drive 指定資料夾（${res.timestamp}）`
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `上傳失敗：${err.message || '請確認 Web App 網址與存取權限是否設定為「所有人」'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!scriptUrl) {
      setStatusMessage({ type: 'error', text: '請先填寫 Google Apps Script 網頁應用程式網址' });
      return;
    }
    saveGDriveUrl(scriptUrl);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await downloadTripFromGoogleDrive(scriptUrl);
      if (res.data) {
        onRestoreTrips(res.data);
        setLastSync(res.timestamp);
        setStatusMessage({
          type: 'success',
          text: `還原成功！已自 Google Drive 載入最新行程（${res.timestamp}）`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `下載還原失敗：${err.message || '請確認雲端硬碟中是否已存在備份檔'}`
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
            <h3 className="modal-title">Google 雲端硬碟 (Google Drive) 同步設定</h3>
          </div>
          <button onClick={onClose} className="btn-icon modal-close-btn" title="關閉">
            <X size={18} />
          </button>
        </div>

        {/* Modal 內容區 */}
        <div className="modal-body-content">
          {/* 指定目錄資訊框 */}
          <div className="gdrive-folder-pill">
            <div className="folder-pill-left">
              <FolderLock size={16} className="text-primary" />
              <div className="folder-text-group">
                <span className="folder-tag">指定備份目錄：</span>
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
                placeholder="例: https://script.google.com/macros/s/AKfycbx.../exec"
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
                <strong>快速取得 Web App 網址 4 步驟：</strong>
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
                <li>清空預設文字並貼入已複製之專屬程式碼（已自動綁定此資料夾 ID）。</li>
                <li>點擊右上角「部署」 &gt;「新部署」：種類選「網頁應用程式」，「誰可以存取」務必選取「<strong>所有人</strong>」，點擊部署後將產生的 Web app URL 貼至上方欄位即可。</li>
              </ol>
            </div>
          )}

          {/* 操作與狀態回饋區 */}
          <div className="gdrive-actions-row">
            <button 
              onClick={handleUpload}
              disabled={isLoading}
              className="btn btn-primary sync-action-btn"
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <UploadCloud size={16} />}
              <span>立即備份至 Google Drive</span>
            </button>

            <button 
              onClick={handleDownload}
              disabled={isLoading}
              className="btn btn-secondary sync-action-btn"
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <DownloadCloud size={16} />}
              <span>從 Google Drive 下載還原</span>
            </button>
          </div>

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
              <span>自動定時備份至雲端</span>
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
