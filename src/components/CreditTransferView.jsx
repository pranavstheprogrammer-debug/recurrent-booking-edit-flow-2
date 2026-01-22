import React, { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Credit Transfer View - Scalable PLAR System for Flight Training
 *
 * Redesigned for unlimited objectives with:
 * - Responsive grid-based Credit Summary (handles 10+ objective types)
 * - Compact event cards with inline time tags (no wide tables)
 * - Expandable event details for full objective view
 * - Clean, uncluttered UI that scales within drawer bounds
 */

// Extended time columns - demonstrating scalability with many objective types
const TIME_COLUMNS = [
  { key: 'vfrDual', label: 'VFR Dual', shortLabel: 'VFR Dual', category: 'VFR', color: 'emerald' },
  { key: 'ifrDual', label: 'IFR Dual', shortLabel: 'IFR Dual', category: 'IFR', color: 'blue' },
  { key: 'ifrHood', label: 'IFR Hood', shortLabel: 'Hood', category: 'IFR', color: 'indigo' },
  { key: 'sim', label: 'Simulator', shortLabel: 'Sim', category: null, color: 'purple' },
  { key: 'xc', label: 'Cross Country', shortLabel: 'XC', category: null, color: 'amber' },
  { key: 'night', label: 'Night', shortLabel: 'Night', category: null, color: 'slate' },
  { key: 'solo', label: 'Solo', shortLabel: 'Solo', category: null, color: 'rose' },
  { key: 'pic', label: 'PIC', shortLabel: 'PIC', category: null, color: 'cyan' },
  { key: 'sic', label: 'SIC', shortLabel: 'SIC', category: null, color: 'teal' },
  { key: 'instrument', label: 'Instrument', shortLabel: 'Inst', category: 'IFR', color: 'violet' },
];

// Sample training data with extended objectives
const INITIAL_PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1 - BIFM',
    description: 'Basic Instrument Flight Maneuvers',
    icon: '✈️',
    events: [
      { id: 'inst01', name: 'INST 01', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst02', name: 'INST 02', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: true },
      { id: 'inst03', name: 'INST 03', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 45, credited: true },
      { id: 'inst04', name: 'INST 04', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst05', name: 'INST 05', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 30, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst06', name: 'INST 06', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 60, solo: 0, pic: 0, sic: 0, instrument: 45, credited: false },
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2 - Adv Instruments',
    description: 'Advanced Instrument Procedures',
    icon: '🎯',
    events: [
      { id: 'inst07', name: 'INST 07', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 60, night: 0, solo: 0, pic: 30, sic: 0, instrument: 60, credited: true },
      { id: 'inst08', name: 'INST 08', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 60, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst09', name: 'INST 09', vfrDual: 30, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 30, solo: 0, pic: 0, sic: 30, instrument: 60, credited: true },
      { id: 'inst10', name: 'INST 10', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 90, night: 0, solo: 60, pic: 60, sic: 0, instrument: 60, credited: true },
      { id: 'inst11', name: 'INST 11', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 60, solo: 0, pic: 0, sic: 0, instrument: 60, credited: true },
      { id: 'inst12', name: 'INST 12', vfrDual: 60, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: true },
      { id: 'inst13', name: 'INST 13', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 90, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst14', name: 'INST 14', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 120, night: 90, solo: 0, pic: 90, sic: 0, instrument: 60, credited: false },
      { id: 'inst15', name: 'INST 15', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 90, pic: 0, sic: 60, instrument: 60, credited: false },
      { id: 'inst16', name: 'INST 16', vfrDual: 45, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst17', name: 'INST 17', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 45, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst18', name: 'INST 18', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 45, sic: 0, instrument: 60, credited: false },
    ]
  },
];

// Syllabus requirements (extended)
const SYLLABUS_REQUIREMENTS = {
  vfrDual: 250,
  ifrDual: 3000,
  ifrHood: 0,
  sim: 600,
  xc: 500,
  night: 300,
  solo: 200,
  pic: 400,
  sic: 100,
  instrument: 900,
};

// Helper to format minutes to H:MM display
const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

// Parse time string (H:MM) to minutes
const parseTime = (timeStr) => {
  const match = timeStr.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    if (mins < 60) {
      return hours * 60 + mins;
    }
  }
  return null;
};

// Color mappings for objective tags
const getColorClasses = (color) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', pill: 'bg-blue-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', pill: 'bg-indigo-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', pill: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', pill: 'bg-amber-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', pill: 'bg-slate-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', pill: 'bg-rose-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', pill: 'bg-cyan-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', pill: 'bg-teal-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', pill: 'bg-violet-100' },
  };
  return colors[color] || colors.blue;
};

// Icons
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ isOpen }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PlaneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Progress Ring Component
const ProgressRing = ({ progress, size = 48, strokeWidth = 4, color = 'blue' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-500',
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    purple: 'stroke-purple-500',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-gray-200"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClasses[color] || colorClasses.blue} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Modern Toggle Checkbox
const ModernCheckbox = ({ checked, onChange, indeterminate = false, size = 'md' }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <label className="inline-flex items-center cursor-pointer group">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`
        ${sizeClasses[size]} rounded-md border-2 flex items-center justify-center
        transition-all duration-200 ease-out
        ${checked
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-lg shadow-blue-500/30 scale-105'
          : indeterminate
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-400 shadow-lg shadow-amber-400/30'
            : 'bg-white border-gray-300 group-hover:border-blue-400 group-hover:shadow-md'}
      `}>
        {checked && (
          <CheckIcon />
        )}
        {indeterminate && !checked && (
          <div className="w-3 h-0.5 bg-white rounded-full" />
        )}
      </div>
    </label>
  );
};

// Editable Time Input for summary cards
const EditableTimeInput = ({ value, onChange, disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(formatTime(value) || '0:00');

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(formatTime(value) || '0:00');
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseTime(localValue);
    if (parsed !== null && parsed !== value) {
      onChange(parsed);
    } else if (localValue.trim() === '' || localValue === '0:00') {
      onChange(0);
    } else {
      setLocalValue(formatTime(value) || '0:00');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') {
      setLocalValue(formatTime(value) || '0:00');
      setIsEditing(false);
    }
  };

  if (disabled) {
    return (
      <span className="text-lg font-bold text-gray-700 tabular-nums">
        {formatTime(value) || '—'}
      </span>
    );
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-16 px-2 py-1 text-center text-sm font-bold border-2 border-blue-500 rounded-lg
                   focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white shadow-lg"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-lg font-bold text-gray-900 tabular-nums hover:text-blue-600
                 transition-colors duration-200 cursor-pointer"
    >
      {formatTime(value) || '—'}
    </button>
  );
};

// Reset Confirmation Dialog
const ResetDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scaleIn">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <RefreshIcon />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Reset All Credits?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will uncheck all credited lessons and reset all credited totals to zero. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100
                       hover:bg-gray-200 rounded-xl transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
                       bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                       rounded-xl shadow-lg shadow-red-500/30 transition-all duration-200"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

// Credit Summary Card - single objective card in the grid
const CreditSummaryCard = ({ column, requirement, credited, onOverride }) => {
  const colors = getColorClasses(column.color);
  const hasRequirement = requirement > 0;
  const hasCredited = credited > 0;

  return (
    <div className={`
      p-3 rounded-xl border transition-all duration-200
      ${hasCredited ? `${colors.bg} ${colors.border}` : 'bg-gray-50 border-gray-200'}
      hover:shadow-md
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${hasCredited ? colors.text : 'text-gray-500'}`}>
          {column.shortLabel}
        </span>
        {column.category && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.pill} ${colors.text}`}>
            {column.category}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400 uppercase">Req</span>
          <span className="text-xs text-gray-500 tabular-nums">
            {hasRequirement ? formatTime(requirement) : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400 uppercase">Cred</span>
          <EditableTimeInput
            value={credited}
            onChange={onOverride}
          />
        </div>
      </div>
    </div>
  );
};

// Time Tag - compact inline display of a time value
const TimeTag = ({ column, value }) => {
  const colors = getColorClasses(column.color);
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      ${colors.pill} ${colors.text}
    `}>
      <span className="opacity-70">{column.shortLabel}</span>
      <span className="font-bold tabular-nums">{formatTime(value)}</span>
    </span>
  );
};

// Event Card - compact display of a single event
const EventCard = ({ event, onCredit, expanded, onToggleExpand }) => {
  // Get non-zero time columns for this event
  const nonZeroTimes = useMemo(() => {
    return TIME_COLUMNS.filter(col => event[col.key] > 0);
  }, [event]);

  return (
    <div className={`
      rounded-xl border transition-all duration-200 overflow-hidden
      ${event.credited
        ? 'bg-blue-50/50 border-blue-200 shadow-sm'
        : 'bg-white border-gray-200 hover:border-gray-300'}
    `}>
      {/* Main row - always visible */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <ModernCheckbox
            checked={event.credited}
            onChange={(checked) => onCredit(event.id, checked)}
            size="sm"
          />
        </div>

        {/* Event name and times */}
        <button
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 min-w-0 text-left"
        >
          <ChevronRightIcon isOpen={expanded} />
          <span className={`
            font-semibold text-sm shrink-0
            ${event.credited ? 'text-blue-700' : 'text-gray-700'}
          `}>
            {event.name}
          </span>

          {/* Inline time tags - show first 3-4 non-zero values */}
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {nonZeroTimes.slice(0, 4).map(col => (
              <TimeTag key={col.key} column={col} value={event[col.key]} />
            ))}
            {nonZeroTimes.length > 4 && (
              <span className="text-xs text-gray-400 px-2 py-0.5">
                +{nonZeroTimes.length - 4} more
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Expanded details - all objectives in vertical list */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIME_COLUMNS.map(col => {
              const value = event[col.key];
              const colors = getColorClasses(col.color);
              return (
                <div
                  key={col.key}
                  className={`
                    flex items-center justify-between p-2 rounded-lg
                    ${value > 0 ? colors.bg : 'bg-gray-50'}
                  `}
                >
                  <span className={`text-xs font-medium ${value > 0 ? colors.text : 'text-gray-400'}`}>
                    {col.shortLabel}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${value > 0 ? colors.text : 'text-gray-300'}`}>
                    {value > 0 ? formatTime(value) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Phase Card Component
const PhaseCard = ({
  phase,
  isExpanded,
  onToggle,
  onCreditEvent,
  onCreditPhase,
  status,
  expandedEvents,
  onToggleEventExpand
}) => {
  const creditedCount = phase.events.filter(e => e.credited).length;
  const progress = (creditedCount / phase.events.length) * 100;

  return (
    <div className={`
      bg-white rounded-2xl border transition-all duration-300 overflow-hidden
      ${status.allCredited
        ? 'border-emerald-200 shadow-lg shadow-emerald-500/10'
        : status.someCredited
          ? 'border-blue-200 shadow-lg shadow-blue-500/10'
          : 'border-gray-200 shadow-sm hover:shadow-md'}
    `}>
      {/* Phase Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-lg
            ${status.allCredited
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30'
              : status.someCredited
                ? 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30'
                : 'bg-gradient-to-br from-gray-200 to-gray-300'}
          `}>
            {phase.icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">{phase.name}</h3>
            <p className="text-xs text-gray-500">{phase.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{creditedCount}/{phase.events.length}</div>
              <div className="text-[10px] text-gray-500">completed</div>
            </div>
            <ProgressRing
              progress={progress}
              size={40}
              strokeWidth={3}
              color={status.allCredited ? 'emerald' : 'blue'}
            />
          </div>

          {/* Select All Checkbox */}
          <div onClick={(e) => e.stopPropagation()}>
            <ModernCheckbox
              checked={status.allCredited}
              indeterminate={status.someCredited}
              onChange={(checked) => onCreditPhase(phase.id, checked)}
              size="md"
            />
          </div>

          <ChevronIcon isOpen={isExpanded} />
        </div>
      </button>

      {/* Phase Content - Event Cards */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 space-y-2">
          {phase.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onCredit={onCreditEvent}
              expanded={expandedEvents.has(event.id)}
              onToggleExpand={() => onToggleEventExpand(event.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Credit Transfer View Component
const CreditTransferView = ({
  isOpen,
  onClose,
  studentId = "17094",
  studentCode = "NRO",
  studentName = "Nuno Rodrigues",
}) => {
  // State
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [manualOverrides, setManualOverrides] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState(['phase1', 'phase2']);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  // Calculate credited totals from checked events
  const calculatedTotals = useMemo(() => {
    const totals = {};
    TIME_COLUMNS.forEach(col => { totals[col.key] = 0; });

    phases.forEach(phase => {
      phase.events.forEach(event => {
        if (event.credited) {
          TIME_COLUMNS.forEach(col => {
            totals[col.key] += event[col.key] || 0;
          });
        }
      });
    });
    return totals;
  }, [phases]);

  // Apply manual overrides
  const creditedTotals = useMemo(() => {
    const totals = { ...calculatedTotals };
    Object.keys(manualOverrides).forEach(key => {
      totals[key] = manualOverrides[key];
    });
    return totals;
  }, [calculatedTotals, manualOverrides]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalEvents = phases.reduce((sum, p) => sum + p.events.length, 0);
    const creditedEvents = phases.reduce((sum, p) => sum + p.events.filter(e => e.credited).length, 0);
    return {
      totalEvents,
      creditedEvents,
      progress: totalEvents > 0 ? (creditedEvents / totalEvents) * 100 : 0,
    };
  }, [phases]);

  // Check phase credit status
  const getPhaseStatus = useCallback((phase) => {
    const creditedCount = phase.events.filter(e => e.credited).length;
    const totalCount = phase.events.length;
    return {
      allCredited: creditedCount === totalCount,
      someCredited: creditedCount > 0 && creditedCount < totalCount,
    };
  }, []);

  // Handlers
  const handleCreditEvent = useCallback((eventId, credited) => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase => ({
      ...phase,
      events: phase.events.map(event =>
        event.id === eventId ? { ...event, credited } : event
      )
    })));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleCreditPhase = useCallback((phaseId, credited) => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? { ...phase, events: phase.events.map(e => ({ ...e, credited })) }
        : phase
    ));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleManualOverride = useCallback((categoryKey, value) => {
    setIsSaving(true);
    setManualOverrides(prev => ({ ...prev, [categoryKey]: value }));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleReset = useCallback(() => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase => ({
      ...phase,
      events: phase.events.map(e => ({ ...e, credited: false }))
    })));
    setManualOverrides({});
    setShowResetDialog(false);
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const togglePhase = useCallback((phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  }, []);

  const toggleEventExpand = useCallback((eventId) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl flex flex-col bg-gray-50 shadow-2xl animate-slideIn">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
          {/* Top Bar */}
          <div className="flex justify-between items-center px-5 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                transition-all duration-300
                ${isSaving
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-white/70'}
              `}>
                {isSaving ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Auto-save enabled
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Student Info */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <UserIcon />
              </div>
              <div>
                <h1 className="text-lg font-bold">{studentName}</h1>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span className="px-2 py-0.5 bg-white/10 rounded-md font-mono">{studentId}</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded-md font-mono">{studentCode}</span>
                  <span className="flex items-center gap-1">
                    <PlaneIcon />
                    ME-IR Training
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
              <ProgressRing
                progress={overallStats.progress}
                size={48}
                strokeWidth={4}
                color="emerald"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white/70">Overall Progress</span>
                  <span className="text-xs font-bold text-white">{overallStats.creditedEvents} of {overallStats.totalEvents} events</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Summary Section - Grid of Cards */}
        <div className="px-5 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Credit Summary</h2>
            <button
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600
                         bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <RefreshIcon />
              Reset
            </button>
          </div>

          {/* Responsive Grid of Objective Cards */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {TIME_COLUMNS.map(col => (
              <CreditSummaryCard
                key={col.key}
                column={col}
                requirement={SYLLABUS_REQUIREMENTS[col.key]}
                credited={creditedTotals[col.key]}
                onOverride={(val) => handleManualOverride(col.key, val)}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Click credited values to manually override
          </p>
        </div>

        {/* Phases List */}
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhases.includes(phase.id)}
              onToggle={() => togglePhase(phase.id)}
              onCreditEvent={handleCreditEvent}
              onCreditPhase={handleCreditPhase}
              status={getPhaseStatus(phase)}
              expandedEvents={expandedEvents}
              onToggleEventExpand={toggleEventExpand}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{overallStats.creditedEvents}</span> of{' '}
            <span className="font-semibold text-gray-900">{overallStats.totalEvents}</span> events credited
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white
                       bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900
                       rounded-xl shadow-lg transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>

      {/* Reset Dialog */}
      <ResetDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
      />

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default CreditTransferView;
