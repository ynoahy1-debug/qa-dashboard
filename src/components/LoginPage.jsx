import React, { useState } from 'react';
import { useQA } from '../context/QAContext';
import { KeyRound, User, CheckSquare, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { users, loginUser } = useQA();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setError('Please enter username and password');
      return;
    }

    const targetUser = users.find(
      (u) => (u.username || '').toLowerCase() === inputUser
    );

    if (!targetUser) {
      setError('Username not registered in system');
      return;
    }

    if (String(targetUser.password || '') !== inputPass) {
      setError('Incorrect password, please try again');
      return;
    }

    loginUser(targetUser);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: '#090d16',
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Main Glassmorphism Card */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '48px 40px',
          position: 'relative',
          zIndex: 10,
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Top Accent Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)',
          }}
        />

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Logo Badge */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 20px auto',
              boxShadow: '0 12px 30px rgba(99, 102, 241, 0.45)',
            }}
          >
            <CheckSquare size={38} />
          </div>

          {/* System Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#a5b4fc',
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={14} /> Quality Audit & Evaluation Portal
          </span>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: '1.4',
              marginBottom: '6px',
              letterSpacing: '-0.3px',
            }}
          >
            QA Call Evaluation Suite
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', fontWeight: 500 }}>
            Enter your credentials to access the system
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              color: '#fb7185',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Username Input */}
          <div className="form-group" style={{ gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span>Username</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{
                  width: '100%',
                  height: '50px',
                  paddingLeft: '50px',
                  paddingRight: '16px',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  transition: 'all 0.25s ease',
                }}
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{
                  width: '100%',
                  height: '50px',
                  paddingLeft: '50px',
                  paddingRight: '16px',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  transition: 'all 0.25s ease',
                }}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <KeyRound
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: '#94a3b8',
              marginTop: '-4px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--accent-primary)',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <span>Remember me</span>
            </label>

            <span style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
              Forgot password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              height: '52px',
              fontSize: '1.02rem',
              fontWeight: 800,
              marginTop: '8px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Lock size={19} />
            <span>Sign In</span>
          </button>
        </form>

        {/* Footer Note */}
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '20px',
          }}
        >
          QA Call Audit & Evaluation Suite &copy; {new Date().getFullYear()} All Rights Reserved
        </div>
      </div>
    </div>
  );
};
