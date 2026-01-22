import React, { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Credit Transfer View - Modern PLAR System for Flight Training
 *
 * A beautifully designed credit transfer interface featuring:
 * - Modern glassmorphism design with subtle gradients
 * - Interactive progress indicators with real-time updates
 * - Smooth animations and micro-interactions
 * - Intuitive phase-based organization with collapsible sections
 * - Clean, accessible UI following modern design principles
 *
 * Target: Multi-Engine Instrument Rating (ME-IR) training syllabus
 */

// Time columns organized by flight rules category
const TIME_COLUMNS = [
  { key: 'vfrDual', label: 'Dual', category: 'VFR', color: 'emerald' },
  { key: 'ifrDual', label: 'Dual', category: 'IFR', color: 'blue' },
  { key: 'ifrHood', label: 'Hood', category: 'IFR', color: 'indigo' },
  { key: 'sim', label: 'Sim', category: null, color: 'purple' },
  { key: 'xc', label: 'XC', category: null, color: 'amber' },
];

// Sample training data organized by phases (ME-IR Syllabus)
const INITIAL_PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1 - BIFM',
    description: 'Basic Instrument Flight Maneuvers',
    icon: '✈️',
    events: [
      { id: 'inst01', name: 'INST 01', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, credited: false },
      { id: 'inst02', name: 'INST 02', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, credited: true },
      { id: 'inst03', name: 'INST 03', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst04', name: 'INST 04', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, credited: false },
      { id: 'inst05', name: 'INST 05', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, credited: false },
      { id: 'inst06', name: 'INST 06', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2 - Adv Instruments',
    description: 'Advanced Instrument Procedures',
    icon: '🎯',
    events: [
      { id: 'inst07', name: 'INST 07', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst08', name: 'INST 08', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst09', name: 'INST 09', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst10', name: 'INST 10', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst11', name: 'INST 11', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst12', name: 'INST 12', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: true },
      { id: 'inst13', name: 'INST 13', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst14', name: 'INST 14', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst15', name: 'INST 15', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst16', name: 'INST 16', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst17', name: 'INST 17', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
      { id: 'inst18', name: 'INST 18', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, credited: false },
    ]
  },
];

// Syllabus requirements
const SYLLABUS_REQUIREMENTS = {
  vfrDual: 250,
  ifrDual: 3000,
  ifrHood: 0,
  sim: 0,
  xc: 0,
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

// Editable Time Input with modern styling
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
      <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600">
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
        className="w-20 px-3 py-1.5 text-center text-sm font-medium border-2 border-blue-500 rounded-lg
                   focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white shadow-lg"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700
                 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200
                 transition-all duration-200 hover:border-blue-300 hover:shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      {formatTime(value) || '0:00'}
    </button>
  );
};

// Reset Confirmation Dialog with modern styling
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

// Statistics Card Component
const StatCard = ({ label, value, subValue, color = 'blue', icon }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
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
  totals
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
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-xl
            ${status.allCredited
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30'
              : status.someCredited
                ? 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30'
                : 'bg-gradient-to-br from-gray-200 to-gray-300'}
          `}>
            {phase.icon}
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-900">{phase.name}</h3>
            <p className="text-sm text-gray-500">{phase.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{creditedCount}/{phase.events.length}</div>
              <div className="text-xs text-gray-500">completed</div>
            </div>
            <ProgressRing
              progress={progress}
              size={44}
              strokeWidth={4}
              color={status.allCredited ? 'emerald' : status.someCredited ? 'blue' : 'blue'}
            />
          </div>

          {/* Select All Checkbox */}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
            <ModernCheckbox
              checked={status.allCredited}
              indeterminate={status.someCredited}
              onChange={(checked) => onCreditPhase(phase.id, checked)}
              size="lg"
            />
          </div>

          <ChevronIcon isOpen={isExpanded} />
        </div>
      </button>

      {/* Phase Content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-5 pb-5">
          {/* Events Table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                    Event
                  </th>
                  {TIME_COLUMNS.map(col => (
                    <th key={col.key} className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        {col.category && (
                          <span className={`
                            text-[10px] px-2 py-0.5 rounded-full mb-1
                            ${col.category === 'VFR' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                          `}>
                            {col.category}
                          </span>
                        )}
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {phase.events.map((event, idx) => (
                  <tr
                    key={event.id}
                    className={`
                      transition-all duration-200 group
                      ${event.credited
                        ? 'bg-gradient-to-r from-blue-50/80 to-transparent hover:from-blue-100/80'
                        : 'hover:bg-gray-50/80'}
                    `}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {event.credited && (
                          <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full" />
                        )}
                        <button className={`
                          text-sm font-semibold transition-colors duration-200
                          ${event.credited ? 'text-blue-600 hover:text-blue-700' : 'text-gray-700 hover:text-blue-600'}
                        `}>
                          {event.name}
                        </button>
                      </div>
                    </td>
                    {TIME_COLUMNS.map(col => (
                      <td key={col.key} className="text-center py-3 px-2">
                        <span className={`
                          text-sm font-medium tabular-nums
                          ${event.credited ? 'text-blue-600' : 'text-gray-500'}
                          ${event[col.key] > 0 ? '' : 'opacity-40'}
                        `}>
                          {event[col.key] > 0 ? formatTime(event[col.key]) : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="text-center py-3 px-3">
                      <ModernCheckbox
                        checked={event.credited}
                        onChange={(checked) => onCreditEvent(event.id, checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phase Totals */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-gray-700">Phase Total</span>
              <div className="flex items-center gap-6">
                {TIME_COLUMNS.map(col => (
                  <div key={col.key} className="text-center">
                    <div className="text-xs text-gray-400 uppercase">{col.label}</div>
                    <div className="text-sm font-bold text-gray-700 tabular-nums">
                      {totals[col.key] > 0 ? formatTime(totals[col.key]) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

  // Calculate phase totals
  const calculatePhaseTotals = useCallback((phase) => {
    const totals = {};
    TIME_COLUMNS.forEach(col => {
      totals[col.key] = phase.events.reduce((sum, event) => sum + (event[col.key] || 0), 0);
    });
    return totals;
  }, []);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-4xl flex flex-col bg-gray-50 shadow-2xl animate-slideIn">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
          {/* Top Bar */}
          <div className="flex justify-between items-center px-6 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
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
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <UserIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold">{studentName}</h1>
                <div className="flex items-center gap-2 text-sm text-white/70">
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
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <ProgressRing
                progress={overallStats.progress}
                size={56}
                strokeWidth={5}
                color="emerald"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/70">Overall Progress</span>
                  <span className="text-sm font-bold text-white">{overallStats.creditedEvents} of {overallStats.totalEvents} events</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Credit Summary</h2>
            <button
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600
                         bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <RefreshIcon />
              Reset
            </button>
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-28"></th>
                  {TIME_COLUMNS.map(col => (
                    <th key={col.key} className="text-center py-2 px-2 text-xs font-medium text-gray-500">
                      <div className="flex flex-col items-center">
                        {col.category && (
                          <span className={`
                            text-[10px] px-2 py-0.5 rounded-full mb-1
                            ${col.category === 'VFR' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                          `}>
                            {col.category}
                          </span>
                        )}
                        <span className="uppercase tracking-wider">{col.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-700">Syllabus</td>
                  {TIME_COLUMNS.map(col => (
                    <td key={col.key} className="text-center py-3 px-2">
                      <span className="text-sm text-gray-500 tabular-nums">
                        {SYLLABUS_REQUIREMENTS[col.key] > 0 ? formatTime(SYLLABUS_REQUIREMENTS[col.key]) : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 text-sm font-bold text-gray-900">Credited</td>
                  {TIME_COLUMNS.map(col => (
                    <td key={col.key} className="text-center py-2 px-2">
                      <EditableTimeInput
                        value={creditedTotals[col.key]}
                        onChange={(val) => handleManualOverride(col.key, val)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Click on credited values to manually override
          </p>
        </div>

        {/* Phases List */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhases.includes(phase.id)}
              onToggle={() => togglePhase(phase.id)}
              onCreditEvent={handleCreditEvent}
              onCreditPhase={handleCreditPhase}
              status={getPhaseStatus(phase)}
              totals={calculatePhaseTotals(phase)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{overallStats.creditedEvents}</span> of{' '}
            <span className="font-semibold text-gray-900">{overallStats.totalEvents}</span> events credited
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-white
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
