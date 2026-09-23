import React, { useState } from 'react';
import { useQA } from '../context/QAContext';
import { exportCallsToExcel } from '../utils/excelHelper';
import {
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  Download,
  Upload,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export const Header = () => {
  const { currentUser, activeTab, setActiveTab, calls, createBatchAndImport, logoutUser } = useQA();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    const customName = window.prompt('Enter new batch title (or leave default):', defaultName);
    
    if (customName === null) {
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const res = await createBatchAndImport(file, customName);
      alert(`Batch (${res.batch.name}) created successfully with ${res.count} call records!`);
    } catch (err) {
      console.error('Failed to parse excel batch file:', err);
      alert('Error reading Excel file. Please verify file format.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    if (currentUser?.role !== 'admin') {
      alert('Notice: Exporting Excel files is restricted to Admin only!');
      return;
    }
    exportCallsToExcel(calls, 'Full_QA_All_Batches_Report.xlsx');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 className="brand-title">QA Call Audit & Evaluation Suite</h1>
            <p className="brand-subtitle">Quality Assurance Secondary Audit System</p>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            <FileSpreadsheet size={18} />
            Call Records ({calls.length})
          </button>

          {isAdmin && (
            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <BarChart3 size={18} />
              Admin Dashboard
            </button>
          )}
        </div>

        {/* Action Buttons & User Info */}
        <div className="header-actions">
          {/* Admin Only Excel Upload & Export */}
          {isAdmin ? (
            <>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderColor: 'var(--accent-amber)' }}>
                <Upload size={16} style={{ color: 'var(--accent-amber)' }} />
                {isUploading ? 'Uploading...' : 'Upload Batch (Excel)'}
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <button className="btn btn-emerald btn-sm" onClick={handleExport}>
                <Download size={16} />
                Export All Batches
              </button>
            </>
          ) : (
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldAlert size={14} style={{ color: 'var(--accent-amber)' }} />
              Import & Export restricted to Admin
            </span>
          )}

          {/* User Info Badge */}
          <div className="user-badge" style={{ cursor: 'default' }}>
            <span className="user-avatar">{currentUser?.avatar || '👤'}</span>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Guest'}</span>
              <span className="user-role">
                {isAdmin ? '👑 Admin' : `QA Auditor (${currentUser?.code || ''})`}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="btn btn-rose btn-sm"
            onClick={logoutUser}
            title="Log Out & Return to Login Screen"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </header>
  );
};
