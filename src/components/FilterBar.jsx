import React from 'react';
import { useQA } from '../context/QAContext';
import { exportCallsToExcel } from '../utils/excelHelper';
import { Search, Clock, XCircle, RotateCcw, Layers, Download } from 'lucide-react';

export const FilterBar = () => {
  const {
    batches,
    selectedBatchId,
    setSelectedBatchId,
    filterDuration,
    setFilterDuration,
    filterStatus,
    setFilterStatus,
    filterMatching,
    setFilterMatching,
    searchQuery,
    setSearchQuery,
    filteredCalls,
    calls,
    currentUser,
    handleResetData,
  } = useQA();

  const isAdmin = currentUser?.role === 'admin';

  const durationOptions = [
    { id: 'all', label: 'All Durations' },
    { id: '0-3', label: '⏱️ 0 to 3 Mins' },
    { id: '4-7', label: '⏱️ 4 to 7 Mins' },
    { id: '7-10', label: '⏱️ 7 to 10 Mins' },
    { id: '10-14', label: '⏱️ 10 to 14 Mins' },
    { id: '>14', label: '⏱️ Over 14 Mins' },
  ];

  const resetAllFilters = () => {
    setSelectedBatchId('all');
    setFilterDuration('all');
    setFilterStatus('all');
    setFilterMatching('all');
    setSearchQuery('');
  };

  const handleExportSelectedBatch = () => {
    if (selectedBatchId === 'all') {
      exportCallsToExcel(filteredCalls, 'QA_Filtered_Calls_Report.xlsx');
    } else {
      const selectedBatch = batches.find((b) => b.id === selectedBatchId);
      const batchCalls = calls.filter((c) => c.batchId === selectedBatchId);
      const fileName = `${selectedBatch?.name || 'Batch'}_QA_Report.xlsx`;
      exportCallsToExcel(batchCalls, fileName);
    }
  };

  const isFiltered =
    selectedBatchId !== 'all' ||
    filterDuration !== 'all' ||
    filterStatus !== 'all' ||
    filterMatching !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="glass-panel filter-bar">
      {/* Top row: Batch Select & Search & Status & Actions */}
      <div className="filter-row">
        {/* Batch Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            Batch (Excel):
          </span>
          <select
            className="select-filter"
            style={{ borderColor: 'var(--accent-amber)', fontWeight: 700 }}
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.totalCallsCount || 0} calls) {!b.isVisible ? ' [🔒 Hidden]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Search box */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Call Number, Agent Name, or Team Leader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Status:
          </span>
          <select
            className="select-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="unlocked">New (Available)</option>
            <option value="locked">🔒 In Evaluation</option>
            <option value="completed">✅ Evaluated</option>
          </select>
        </div>

        {/* Matching filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Match:
          </span>
          <select
            className="select-filter"
            value={filterMatching}
            onChange={(e) => setFilterMatching(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Match">Match</option>
            <option value="Mismatch">Mismatch</option>
          </select>
        </div>

        {/* Per-Batch Export for Admin */}
        {isAdmin && (
          <button
            className="btn btn-emerald btn-sm"
            onClick={handleExportSelectedBatch}
            title="Export currently selected batch to Excel"
          >
            <Download size={14} />
            Export Selected Batch
          </button>
        )}

        {/* Reset filters */}
        {isFiltered && (
          <button className="btn btn-secondary btn-sm" onClick={resetAllFilters}>
            <XCircle size={15} />
            Clear Filters
          </button>
        )}

        {/* Demo reset */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleResetData}
          title="Reset to default demo data"
          style={{ opacity: 0.7 }}
        >
          <RotateCcw size={14} />
          Reset Demo
        </button>
      </div>

      {/* Bottom row: Duration Range Pills */}
      <div className="filter-row" style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
        <div className="duration-pills">
          <span className="pill-label">
            <Clock size={16} style={{ color: 'var(--accent-secondary)' }} />
            Filter by Call Duration:
          </span>

          {durationOptions.map((opt) => (
            <button
              key={opt.id}
              className={`duration-pill ${filterDuration === opt.id ? 'active' : ''}`}
              onClick={() => setFilterDuration(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>{filteredCalls.length}</span> call records
        </div>
      </div>
    </div>
  );
};
