import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSVToTripDays, getSampleCSVTemplate, downloadCSVFile } from '../utils/csvHandler';

export default function ImportCSVModal({ trip, onUpdateTrip, onClose }) {
  const [csvText, setCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('檔案讀取失敗，請確認檔案格式是否正確。');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleExecuteImport = () => {
    if (!csvText.trim()) {
      setErrorMsg('請上傳 CSV 檔案或貼上 CSV 內容');
      return;
    }

    try {
      const parsedDays = parseCSVToTripDays(csvText);
      if (parsedDays.length === 0) {
        throw new Error('未解析到任何有效行程資料');
      }

      onUpdateTrip({
        ...trip,
        days: parsedDays
      });

      setSuccessMsg(`成功匯入 ${parsedDays.length} 天行程！`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(`匯入失敗：${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    const template = getSampleCSVTemplate();
    downloadCSVFile(template, 'travel_planner_template.csv');
  };

  return (
    <div className="ai-modal-overlay">
      <div className="import-modal-card glass-panel">
        <div className="ai-modal-header">
          <div className="ai-title-wrap">
            <Upload size={22} className="ai-sparkle-icon" />
            <div>
              <h2 className="ai-modal-title">匯入行程 CSV</h2>
              <p className="ai-modal-subtitle">支援標準 12 欄位格式，快速建立或覆寫旅程</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="import-modal-body">
          <div className="import-actions-bar">
            <label className="btn btn-secondary file-upload-label">
              <Upload size={16} />
              <span>選取本機 CSV 檔案</span>
              <input 
                type="file" 
                accept=".csv,text/csv" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            <button onClick={handleDownloadTemplate} className="btn btn-secondary">
              <FileText size={16} />
              <span>下載標準 CSV 範本</span>
            </button>
          </div>

          <div className="csv-textarea-wrap">
            <label>或直接在此貼上 CSV 原始文字：</label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setErrorMsg('');
              }}
              placeholder="貼上以逗號分隔的 12 欄位 CSV 資料..."
              rows={8}
            />
          </div>

          {errorMsg && (
            <div className="import-alert error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="import-alert success">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="import-footer-buttons">
            <button onClick={onClose} className="btn btn-secondary">
              取消
            </button>
            <button onClick={handleExecuteImport} className="btn btn-primary">
              確認匯入並套用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
