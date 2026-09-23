import React, { useState } from 'react';
import { useQA } from '../context/QAContext';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Edit3,
  Eye,
  AlertTriangle,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

export const CallList = () => {
  const { filteredCalls, currentUser, lockCall, unlockCall, setSelectedCall } = useQA();
  const [copiedNumber, setCopiedNumber] = useState(null);

  const handleCopy = (e, callNum) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(callNum));
    setCopiedNumber(callNum);
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2000);
  };

  const handleStartEvaluation = (call) => {
    if (call.status === 'completed' || (call.lockedBy && call.lockedBy.userId === currentUser?.id)) {
      setSelectedCall(call);
      return;
    }

    const res = lockCall(call.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleUnlock = (e, callId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to release the lock on this call to make it available for other auditors?')) {
      unlockCall(callId);
    }
  };

  if (filteredCalls.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--accent-amber)', marginBottom: '14px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>No calls match the current filter criteria!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          Try changing call duration or status filter options from the top bar.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Call Number</th>
            <th>Agent Name</th>
            <th>Team Leader</th>
            <th>Duration</th>
            <th>Initial AI Score</th>
            <th>Status & Lock</th>
            <th>Re-Evaluation Result</th>
            <th>Auditor</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCalls.map((call) => {
            const isLockedByMe = call.lockedBy?.userId === currentUser?.id;
            const isLockedByOther = call.status === 'locked' && !isLockedByMe;
            const isCopied = copiedNumber === call.call_number;

            return (
              <tr key={call.id}>
                {/* Call Number with Copy Click */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      onClick={(e) => handleCopy(e, call.call_number)}
                      title="Click to copy call number to clipboard"
                      style={{
                        padding: '4px 10px',
                        background: isCopied ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.15)',
                        border: isCopied ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '6px',
                        fontWeight: 800,
                        color: isCopied ? '#34d399' : '#a5b4fc',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        userSelect: 'none',
                      }}
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      #{call.call_number}
                      {isCopied && (
                        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800 }}>
                          Copied!
                        </span>
                      )}
                    </span>
                  </div>
                </td>

                {/* Agent Name */}
                <td>
                  <span style={{ fontWeight: 700 }}>{call.agent_name}</span>
                </td>

                {/* Group Name */}
                <td style={{ color: 'var(--text-secondary)' }}>{call.group_name}</td>

                {/* Duration */}
                <td>
                  <span className="duration-tag">{call.duration_minutes}</span>
                </td>

                {/* AI Score */}
                <td>
                  <span
                    style={{
                      fontWeight: 800,
                      color:
                        call.ai_overall_score >= 80
                          ? 'var(--accent-emerald)'
                          : call.ai_overall_score >= 60
                          ? 'var(--accent-amber)'
                          : 'var(--accent-rose)',
                    }}
                  >
                    {call.ai_overall_score}%
                  </span>
                </td>

                {/* Status Badge */}
                <td>
                  {call.status === 'unlocked' && (
                    <span className="badge badge-new">
                      <Zap size={13} /> New & Available
                    </span>
                  )}
                  {call.status === 'locked' && (
                    <span className="badge badge-locked">
                      <Lock size={13} /> Locked ({call.lockedBy?.userName})
                    </span>
                  )}
                  {call.status === 'completed' && (
                    <span className="badge badge-completed">
                      <CheckCircle2 size={13} /> Evaluated
                    </span>
                  )}
                </td>

                {/* Re-evaluation Result */}
                <td>
                  {call.status === 'completed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge ${
                          call.matching === 'Match' ? 'badge-matching' : 'badge-mismatch'
                        }`}
                      >
                        {call.matching}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        ({call.final_score}{typeof call.final_score === 'number' ? '%' : ''})
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending</span>
                  )}
                </td>

                {/* Evaluator Name */}
                <td>
                  {call.evaluatedBy ? (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c7d2fe' }}>
                      👤 {call.evaluatedBy.userName}
                    </span>
                  ) : call.lockedBy ? (
                    <span style={{ fontSize: '0.82rem', color: '#fde047' }}>
                      🔒 {call.lockedBy.userName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td style={{ textAlign: 'center' }}>
                  {call.status === 'completed' ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartEvaluation(call)}
                    >
                      <Eye size={14} /> View / Edit
                    </button>
                  ) : isLockedByOther ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      title={`Locked by ${call.lockedBy?.userName}`}
                    >
                      <Lock size={14} style={{ color: 'var(--accent-amber)' }} /> Locked
                    </button>
                  ) : isLockedByMe ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStartEvaluation(call)}
                      >
                        <Edit3 size={14} /> Resume Audit
                      </button>
                      <button
                        className="btn btn-rose btn-sm"
                        onClick={(e) => handleUnlock(e, call.id)}
                        title="Release Lock"
                      >
                        <Unlock size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartEvaluation(call)}
                    >
                      <CheckCircle2 size={14} /> Start Audit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
