import React, { useState, useEffect } from 'react';
import { useQA } from '../context/QAContext';
import {
  X,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Award,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const CallEvaluationModal = () => {
  const { selectedCall, setSelectedCall, saveEvaluation, unlockCall, currentUser } = useQA();
  const [copiedModalNumber, setCopiedModalNumber] = useState(false);

  const policyOptions = [
    'يوجد بولسي AI ولا يوجد بولسي كوالتي',
    'يوجد بولسي كوالتي ولا يوجد بولسي AI',
    'يوجد بولسي AI ويوجد بولسي كوالتي',
    'لا يوجد بولسي بالحالتين',
  ];

  const scoreFields = [
    { key: 'qa_answer', label: 'Ending Score (answer)' },
    { key: 'qa_skills', label: 'Skills Score (skills)' },
    { key: 'qa_diagnosis', label: 'Diagnosis Score (dignosis)' },
    { key: 'qa_solve', label: 'Problem Solving Score (solve)' },
    { key: 'qa_inquiries', label: 'Inquiry Score (inquiries)' },
    { key: 'qa_case', label: 'Ticket Score (case)' },
  ];

  // Local form state for Part 2 fields
  const [formData, setFormData] = useState({
    matching: 'Match',
    policy: 'لا يوجد بولسي بالحالتين',
    description: '',
    qa_answer: 100,
    qa_skills: 100,
    qa_diagnosis: 100,
    qa_solve: 100,
    qa_inquiries: 100,
    qa_case: 100,
    final_score: 100,
  });

  useEffect(() => {
    if (selectedCall) {
      setFormData({
        matching: selectedCall.matching || 'Match',
        policy: selectedCall.policy || 'لا يوجد بولسي بالحالتين',
        description: selectedCall.description || '',
        qa_answer: selectedCall.qa_answer !== null && selectedCall.qa_answer !== undefined ? selectedCall.qa_answer : 100,
        qa_skills: selectedCall.qa_skills !== null && selectedCall.qa_skills !== undefined ? selectedCall.qa_skills : 100,
        qa_diagnosis: selectedCall.qa_diagnosis !== null && selectedCall.qa_diagnosis !== undefined ? selectedCall.qa_diagnosis : 100,
        qa_solve: selectedCall.qa_solve !== null && selectedCall.qa_solve !== undefined ? selectedCall.qa_solve : 100,
        qa_inquiries: selectedCall.qa_inquiries !== null && selectedCall.qa_inquiries !== undefined ? selectedCall.qa_inquiries : 100,
        qa_case: selectedCall.qa_case !== null && selectedCall.qa_case !== undefined ? selectedCall.qa_case : 100,
        final_score: selectedCall.final_score !== null && selectedCall.final_score !== undefined ? selectedCall.final_score : 100,
      });
    }
  }, [selectedCall]);

  const handleCopyModalNum = (num) => {
    navigator.clipboard.writeText(String(num));
    setCopiedModalNumber(true);
    setTimeout(() => {
      setCopiedModalNumber(false);
    }, 2000);
  };

  const handleScoreChange = (fieldKey, value) => {
    const val = Math.min(100, Math.max(0, Number(value) || 0));
    setFormData((prev) => ({ ...prev, [fieldKey]: val }));
  };

  const handleToggleNA = (fieldKey, isNA) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: isNA ? 'N/A' : 100 }));
  };

  if (!selectedCall) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveEvaluation(selectedCall.id, formData);
    alert('Re-evaluation form saved successfully and registered under your account!');
  };

  const handleClose = () => {
    if (selectedCall.status !== 'completed' && selectedCall.lockedBy?.userId === currentUser?.id) {
      unlockCall(selectedCall.id);
    }
    setSelectedCall(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content glass-panel"
        style={{ maxWidth: '1100px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Re-Evaluate Call Record
                </h2>

                {/* Clickable Call Number */}
                <span
                  onClick={() => handleCopyModalNum(selectedCall.call_number)}
                  title="Click to copy call number"
                  style={{
                    padding: '4px 10px',
                    background: copiedModalNumber ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.18)',
                    border: copiedModalNumber ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '8px',
                    fontWeight: 800,
                    color: copiedModalNumber ? '#34d399' : '#a5b4fc',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    userSelect: 'none',
                  }}
                >
                  {copiedModalNumber ? <Check size={14} /> : <Copy size={14} />}
                  #{selectedCall.call_number}
                  {copiedModalNumber && (
                    <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Copied!</span>
                  )}
                </span>

                <span className="duration-tag">⏱️ {selectedCall.duration_minutes}</span>
                <span className="badge badge-locked">
                  <Lock size={12} /> Locked by: {currentUser?.name}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Agent: <strong>{selectedCall.agent_name}</strong> | Team Leader: <strong>{selectedCall.group_name}</strong> | Call Date: {selectedCall.call_date}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Section 1: Pre-evaluated Read-Only Data */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--accent-secondary)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} /> Initial Assessment Data (Read-Only Reference)
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                fontSize: '0.85rem',
              }}
            >
              <div className="form-group">
                <label>Previous AI Score (ai_overall_score)</label>
                <div className="form-control" style={{ fontWeight: 800, color: '#a5b4fc' }}>
                  {selectedCall.ai_overall_score}%
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis (diagnosis_class)</label>
                <div className="form-control">{selectedCall.diagnosis_class} ({selectedCall.diagnosis_score} pts)</div>
              </div>

              <div className="form-group">
                <label>Diagnosis Errors (diagnosis_errors)</label>
                <div className="form-control" style={{ color: selectedCall.diagnosis_errors !== 'None' ? '#f43f5e' : 'inherit' }}>
                  {selectedCall.diagnosis_errors}
                </div>
              </div>

              <div className="form-group">
                <label>Ticket Score (case_score)</label>
                <div className="form-control">{selectedCall.case_score} pts (Errors: {selectedCall.case_errors})</div>
              </div>

              <div className="form-group">
                <label>Inquiry (inquiry_class)</label>
                <div className="form-control">{selectedCall.inquiry_class} ({selectedCall.inquiry_score} pts)</div>
              </div>

              <div className="form-group">
                <label>Problem Solving (problem_class)</label>
                <div className="form-control">{selectedCall.problem_class} ({selectedCall.problem_score} pts)</div>
              </div>

              <div className="form-group">
                <label>Ending Answer Score (answer_ending_score)</label>
                <div className="form-control">{selectedCall.answer_ending_score} pts (Missing: {selectedCall.answer_ending_missing})</div>
              </div>

              <div className="form-group">
                <label>Communication Score (comm_score)</label>
                <div className="form-control">{selectedCall.comm_score} pts (Issue: {selectedCall.comm_issue})</div>
              </div>

              <div className="form-group">
                <label>Violation Severity (violation_severity)</label>
                <div className="form-control" style={{ fontWeight: 700, color: selectedCall.violation_highest_severity !== 'None' && selectedCall.violation_highest_severity !== 'Low' ? '#f43f5e' : '#10b981' }}>
                  {selectedCall.violation_highest_severity} ({selectedCall.violation_reasons})
                </div>
              </div>

              <div className="form-group">
                <label>Flag Reason (flag_reason)</label>
                <div className="form-control">{selectedCall.flag_reason}</div>
              </div>
            </div>
          </div>

          {/* Section 2: QA Auditor Form Input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={20} /> QA Auditor Re-Evaluation Form ({currentUser?.name})
            </h3>

            {/* Matching Options */}
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                1. Match Status with Initial Assessment (مطابق / غير مطابق): *
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  className={`btn ${formData.matching === 'Match' || formData.matching === 'مطابق' ? 'btn-emerald' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, matching: 'Match' })}
                  style={{ flex: 1 }}
                >
                  <CheckCircle2 size={16} /> مطابق (Match)
                </button>
                <button
                  type="button"
                  className={`btn ${formData.matching === 'Mismatch' || formData.matching === 'غير مطابق' ? 'btn-rose' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, matching: 'Mismatch' })}
                  style={{ flex: 1 }}
                >
                  <XCircle size={16} /> غير مطابق (Mismatch)
                </button>
              </div>
            </div>

            {/* 4 Policy Cases Selection */}
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-amber)' }} />
                2. حالة وجود البولسي (Policy): * (اختر إحدى حالات البولسي الأربعة)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {policyOptions.map((opt) => {
                  const isSelected = formData.policy === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, policy: opt })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.22)' : 'rgba(0, 0, 0, 0.25)',
                        border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                          background: isSelected ? '#ffffff' : 'transparent',
                          flexShrink: 0,
                        }}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Criteria Scores with N/A Checkbox */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  3. Criteria Evaluation Scores (0 to 100 or N/A):
                </label>
              </div>
              
              <div className="form-grid">
                {scoreFields.map(({ key, label }) => {
                  const isNA = formData[key] === 'N/A';

                  return (
                    <div className="form-group" key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{label}</label>

                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: isNA ? 'var(--accent-amber)' : 'var(--text-muted)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isNA ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isNA}
                            onChange={(e) => handleToggleNA(key, e.target.checked)}
                            style={{ accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
                          />
                          N/A
                        </label>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={isNA}
                        className="form-control"
                        style={{
                          opacity: isNA ? 0.5 : 1,
                          fontWeight: 700,
                          color: isNA ? 'var(--accent-amber)' : 'var(--text-primary)',
                        }}
                        value={isNA ? '' : formData[key]}
                        placeholder={isNA ? 'N/A (Not Applicable)' : 'Enter score (0 - 100)'}
                        onChange={(e) => handleScoreChange(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Standalone Independent Manual Final Score Input */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <label style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  4. Final Evaluation Score (final score) - Standalone Field: *
                </label>

                <input
                  type="text"
                  className="form-control"
                  style={{
                    height: '48px',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: formData.final_score === 'N/A' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    borderColor: 'var(--accent-primary)',
                    background: 'rgba(15, 23, 42, 0.7)',
                  }}
                  value={formData.final_score}
                  onChange={(e) => setFormData({ ...formData, final_score: e.target.value })}
                  placeholder="Enter final score directly..."
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                5. Detailed Notes & Description (Description):
              </label>
              <textarea
                className="form-control"
                placeholder="Enter detailed audit notes, rationale, or identified errors..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Footer buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald" style={{ padding: '10px 28px' }}>
                <Save size={18} /> Save Evaluation & Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
