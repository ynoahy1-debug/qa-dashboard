import React, { useState } from 'react';
import { useQA } from '../context/QAContext';
import { exportCallsToExcel } from '../utils/excelHelper';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Lock,
  Download,
  UserPlus,
  Shield,
  TrendingUp,
  Layers,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    calls,
    users,
    batches,
    createEmployeeAccount,
    toggleBatchVisibility,
    deleteBatch,
    setSearchQuery,
    setActiveTab,
    setSelectedBatchId,
  } = useQA();

  // New Employee Form State
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: '',
    code: '',
    avatar: '👨‍💼',
  });

  const handleCreateEmployee = (e) => {
    e.preventDefault();

    if (!newEmployee.name.trim() || !newEmployee.username.trim() || !newEmployee.password.trim()) {
      alert('Please fill in all required fields (Name, Username, Password)!');
      return;
    }

    const exists = users.some(
      (u) => u.username.toLowerCase() === newEmployee.username.trim().toLowerCase()
    );
    if (exists) {
      alert('Username already exists! Please choose another username.');
      return;
    }

    const created = createEmployeeAccount(newEmployee);
    alert(`Employee account (${created.name}) created successfully!\nUsername: ${created.username}\nPassword: ${created.password}`);
    setNewEmployee({ name: '', username: '', password: '', code: '', avatar: '👨‍💼' });
  };

  const handleExportSingleBatch = (batch) => {
    const batchCalls = calls.filter((c) => c.batchId === batch.id);
    const fileName = `${batch.name.replace(/\s+/g, '_')}_Report.xlsx`;
    exportCallsToExcel(batchCalls, fileName);
  };

  const handleDeleteBatchClick = (batch) => {
    if (window.confirm(`Are you sure you want to delete batch (${batch.name}) and all associated call records?`)) {
      deleteBatch(batch.id);
    }
  };

  // Aggregate stats
  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === 'completed');
  const lockedCalls = calls.filter((c) => c.status === 'locked');
  const matchingCount = completedCalls.filter((c) => c.matching === 'Match').length;
  const alignmentRate =
    completedCalls.length > 0 ? Math.round((matchingCount / completedCalls.length) * 100) : 0;

  const auditorUsers = users.filter((u) => u.role === 'qa_auditor');

  const auditorStats = auditorUsers.map((user) => {
    const evalCalls = calls.filter(
      (c) => c.status === 'completed' && c.evaluatedBy?.userId === user.id
    );
    const userLocked = calls.filter(
      (c) => c.status === 'locked' && c.lockedBy?.userId === user.id
    );

    const userMatching = evalCalls.filter((c) => c.matching === 'Match').length;
    const userMismatch = evalCalls.filter((c) => c.matching === 'Mismatch').length;

    const avgScore =
      evalCalls.length > 0
        ? Math.round(
            (evalCalls.reduce((acc, curr) => acc + (Number(curr.final_score) || 0), 0) / evalCalls.length) *
              10
          ) / 10
        : 0;

    return {
      user,
      evaluatedCount: evalCalls.length,
      lockedCount: userLocked.length,
      matchingCount: userMatching,
      mismatchCount: userMismatch,
      avgScore,
    };
  });

  const handleExportAll = () => {
    exportCallsToExcel(calls, 'Admin_Full_QA_Audit_Report.xlsx');
  };

  const filterByUser = (userName) => {
    setSearchQuery(userName);
    setActiveTab('calls');
  };

  const handleViewBatchCalls = (batchId) => {
    setSelectedBatchId(batchId);
    setActiveTab('calls');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Title & Export */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Admin Dashboard & Management Panel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Manage Excel batch visibility for auditors, export individual batches, and create employee accounts
            </p>
          </div>
        </div>

        <button className="btn btn-emerald" onClick={handleExportAll}>
          <Download size={18} /> Export All Batches Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Layers size={28} />
          </div>
          <div>
            <div className="stat-val">{batches.length}</div>
            <div className="stat-title">Uploaded Batches</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
            <BarChart3 size={28} />
          </div>
          <div>
            <div className="stat-val">{totalCalls}</div>
            <div className="stat-title">Total Call Records</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="stat-val">{completedCalls.length}</div>
            <div className="stat-title">Completed Evaluations</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="stat-val">{alignmentRate}%</div>
            <div className="stat-title">Match Rate</div>
          </div>
        </div>
      </div>

      {/* BATCHES MANAGEMENT PANEL */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Layers size={20} /> Batch Management & Auditor Visibility ({batches.length} Batches)
          </h3>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch Title</th>
                <th>Original File</th>
                <th>Upload Date</th>
                <th style={{ textAlign: 'center' }}>Total Calls</th>
                <th style={{ textAlign: 'center' }}>Completed</th>
                <th style={{ textAlign: 'center' }}>Auditor Visibility</th>
                <th style={{ textAlign: 'center' }}>Export Batch (Excel)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const batchCalls = calls.filter((c) => c.batchId === batch.id);
                const batchCompletedCount = batchCalls.filter((c) => c.status === 'completed').length;

                return (
                  <tr key={batch.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {batch.name}
                      </span>
                    </td>

                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {batch.fileName}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {batch.uploadedAt}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span className="duration-tag">{batchCalls.length} calls</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#34d399' }}>
                        {batchCompletedCount} / {batchCalls.length}
                      </span>
                    </td>

                    {/* Visibility Switcher */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`btn btn-sm ${batch.isVisible ? 'btn-emerald' : 'btn-secondary'}`}
                        onClick={() => toggleBatchVisibility(batch.id)}
                        style={{ minWidth: '160px' }}
                        title="Click to toggle auditor visibility"
                      >
                        {batch.isVisible ? (
                          <>
                            <Eye size={14} /> Visible to Auditors
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} style={{ color: '#f43f5e' }} /> 🔒 Hidden from Auditors
                          </>
                        )}
                      </button>
                    </td>

                    {/* Individual Batch Export */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleExportSingleBatch(batch)}
                      >
                        <Download size={14} style={{ color: 'var(--accent-emerald)' }} /> Export Batch
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewBatchCalls(batch.id)}
                          title="View Batch Calls"
                        >
                          View 🔍
                        </button>
                        <button
                          className="btn btn-rose btn-sm"
                          onClick={() => handleDeleteBatchClick(batch)}
                          title="Delete Batch"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form: Admin Account Creation for Employees */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--accent-secondary)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserPlus size={20} /> Create New QA Auditor Account (Admin Only)
        </h3>

        <form onSubmit={handleCreateEmployee} className="form-grid">
          <div className="form-group">
            <label>Full Employee Name: *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Abdelrahman Khaled"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Username (Login ID): *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. abdelrahman"
              value={newEmployee.username}
              onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password: *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Employee password..."
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Employee Code:</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. QA-105"
              value={newEmployee.code}
              onChange={(e) => setNewEmployee({ ...newEmployee, code: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label>&nbsp;</label>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <UserPlus size={16} /> Create Account Now
            </button>
          </div>
        </form>
      </div>

      {/* Main Table: Evaluator Performance & Call Counts */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={20} style={{ color: 'var(--accent-secondary)' }} />
          Auditor Performance & Account Details ({auditorUsers.length} Auditors)
        </h3>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Auditor Name</th>
                <th>Username</th>
                <th>Password</th>
                <th>Employee Code</th>
                <th style={{ textAlign: 'center' }}>Evaluated Calls</th>
                <th style={{ textAlign: 'center' }}>Currently Locked</th>
                <th style={{ textAlign: 'center' }}>Match / Mismatch</th>
                <th style={{ textAlign: 'center' }}>View Work</th>
              </tr>
            </thead>
            <tbody>
              {auditorStats.map(({ user, evaluatedCount, lockedCount, matchingCount, mismatchCount }) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{user.avatar}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{user.name}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>
                      {user.username}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {user.password || '******'}
                    </span>
                  </td>

                  <td>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                      {user.code}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.18)',
                        color: '#34d399',
                        fontWeight: 900,
                        fontSize: '1.05rem',
                      }}
                    >
                      {evaluatedCount} calls
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    {lockedCount > 0 ? (
                      <span className="badge badge-locked">
                        <Lock size={12} /> {lockedCount} locked
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>0</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>{matchingCount}</span>
                    {' / '}
                    <span style={{ color: '#f43f5e', fontWeight: 800 }}>{mismatchCount}</span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => filterByUser(user.name)}
                    >
                      View Calls 🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
