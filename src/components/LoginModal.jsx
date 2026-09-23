import React, { useState } from 'react';
import { useQA } from '../context/QAContext';
import { UserCheck, Shield, KeyRound, User, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { users, currentUser, loginUser } = useQA();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState('form'); // 'form' | 'quick'

  if (!isOpen) return null;

  const handleFormLogin = (e) => {
    e.preventDefault();
    setError('');

    const targetUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!targetUser) {
      setError('اسم المستخدم غير صحيح!');
      return;
    }

    if (targetUser.password !== password.trim()) {
      setError('كلمة المرور غير صحيحة!');
      return;
    }

    loginUser(targetUser);
    alert(`أهلاً بك يا ${targetUser.name}! تم تسجيل الدخول بنجاح.`);
    onClose();
  };

  const handleQuickSelect = (user) => {
    loginUser(user);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>تسجيل الدخول للنظام</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                أدخل اسم المستخدم وكلمة المرور الخاصة بحسابك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode switch */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              className={`btn ${loginMode === 'form' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => setLoginMode('form')}
            >
              🔑 الدخول باسم المستخدم والباسورد
            </button>
            <button
              className={`btn ${loginMode === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => setLoginMode('quick')}
            >
              ⚡ اختيار سريع للحساب
            </button>
          </div>

          {loginMode === 'form' ? (
            <form onSubmit={handleFormLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f43f5e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="form-group">
                <label>اسم المستخدم (Username):</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="مثال: admin أو ahmed"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>كلمة المرور (Password):</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="أدخل كلمة المرور..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Default Hint */}
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}
              >
                <span style={{ fontWeight: 800, color: 'var(--accent-secondary)' }}>💡 حسابات الدخول الافتراضية للاختبار:</span>
                <br />
                👑 **الآدمن (Admin)**: `admin` / الباسورد: `admin123` (له صلاحية رفع الإكسل وإضافة الموظفين)
                <br />
                👨‍💼 **الموظفون**: `ahmed` / `sara` / `khaled` / `maryam` (الباسورد: `123456`)
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
                تسجيل الدخول
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSelect(u)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? 'rgba(99, 102, 241, 0.18)' : 'rgba(0, 0, 0, 0.3)',
                      border: isCurrent ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{u.avatar}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{u.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({u.username})</span>
                        </div>
                      </div>
                    </div>

                    {u.role === 'admin' ? (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                        👑 آدمن
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
                        موظف جودة
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
