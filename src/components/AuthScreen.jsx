import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const CORRECT_PIN = 'zxc147258';

export default function AuthScreen({ onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (pin.trim() === CORRECT_PIN) {
      setError(false);
      localStorage.setItem('travel_auth_unlocked', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-icon-circle">
          <Lock size={32} className="auth-lock-icon" />
        </div>

        <h1 className="auth-title">旅遊規劃與紀錄系統</h1>
        <p className="auth-subtitle">請輸入預設存取金鑰密碼以解鎖您的旅程規劃庫</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-container">
            <KeyRound size={20} className="auth-field-icon" />
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(false);
              }}
              placeholder="輸入金鑰密碼"
              className={`auth-input ${error ? 'input-error' : ''}`}
              autoFocus
            />
          </div>

          {error && (
            <div className="auth-error-msg">
              <AlertCircle size={16} />
              <span>金鑰密碼錯誤，請重新確認後輸入</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-btn" disabled={!pin}>
            <span>進入系統</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-badge">
          <ShieldCheck size={16} />
          <span>安全防護端點受金鑰鎖定保護</span>
        </div>
      </div>
    </div>
  );
}
