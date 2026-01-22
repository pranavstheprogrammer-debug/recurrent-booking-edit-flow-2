import React, { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Credit Transfer Drawer - Modern Redesign
 * A comprehensive credit transfer interface for aviation training management
 *
 * Key Features:
 * - Unified view with summary + training events grid
 * - Organized by Phases (sections) containing Training Events (lessons)
 * - Checkbox-based credit toggling with auto-save
 * - Visual indicators: Blue = credited, Orange = partial phase
 * - Phase-level bulk selection
 * - Manual override for credited totals
 */

// Time categories for the summary table
const TIME_CATEGORIES = [
  { key: 'vfrDual', label: 'VFR Dual', shortLabel: 'VFR Dual' },
  { key: 'ifrDual', label: 'IFR Dual', shortLabel: 'IFR Dual' },
  { key: 'sim', label: 'Simulator', shortLabel: 'Sim' },
  { key: 'xc', label: 'Cross Country', shortLabel: 'XC' },
  { key: 'night', label: 'Night', shortLabel: 'Night' },
  { key: 'solo', label: 'Solo', shortLabel: 'Solo' },
];

// Sample training data organized by phases
const INITIAL_PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1 - BIFM',
    description: 'Basic Instrument Flight Maneuvers',
    events: [
      { id: 'inst01', name: 'INST 01', description: 'Introduction to Instruments', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst02', name: 'INST 02', description: 'Attitude Instrument Flying', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: true },
      { id: 'inst03', name: 'INST 03', description: 'Basic Maneuvers', vfrDual: 10, ifrDual: 120, sim: 0, xc: 0, night: 0, solo: 0, credited: true },
      { id: 'inst04', name: 'INST 04', description: 'Partial Panel', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst05', name: 'INST 05', description: 'Radio Navigation', vfrDual: 10, ifrDual: 120, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst06', name: 'INST 06', description: 'Holding Patterns', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2 - Advanced Instruments',
    description: 'Advanced Instrument Procedures',
    events: [
      { id: 'inst07', name: 'INST 07', description: 'ILS Approaches', vfrDual: 10, ifrDual: 120, sim: 0, xc: 0, night: 0, solo: 0, credited: true },
      { id: 'inst08', name: 'INST 08', description: 'VOR Approaches', vfrDual: 10, ifrDual: 120, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst09', name: 'INST 09', description: 'NDB Approaches', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst10', name: 'INST 10', description: 'GPS Approaches', vfrDual: 10, ifrDual: 120, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'inst11', name: 'INST 11', description: 'Missed Approaches', vfrDual: 10, ifrDual: 90, sim: 0, xc: 0, night: 0, solo: 0, credited: false },
    ]
  },
  {
    id: 'phase3',
    name: 'Phase 3 - Cross Country',
    description: 'Cross Country Flight Training',
    events: [
      { id: 'xc01', name: 'XC 01', description: 'Flight Planning', vfrDual: 0, ifrDual: 120, sim: 0, xc: 120, night: 0, solo: 0, credited: false },
      { id: 'xc02', name: 'XC 02', description: 'Short Cross Country', vfrDual: 0, ifrDual: 150, sim: 0, xc: 150, night: 0, solo: 0, credited: false },
      { id: 'xc03', name: 'XC 03', description: 'Long Cross Country', vfrDual: 0, ifrDual: 180, sim: 0, xc: 180, night: 60, solo: 0, credited: false },
      { id: 'xc04', name: 'XC 04', description: 'Night Cross Country', vfrDual: 0, ifrDual: 120, sim: 0, xc: 120, night: 120, solo: 0, credited: false },
    ]
  },
  {
    id: 'phase4',
    name: 'Phase 4 - Simulator',
    description: 'Simulator Training Sessions',
    events: [
      { id: 'sim01', name: 'SIM 01', description: 'Basic Sim Training', vfrDual: 0, ifrDual: 0, sim: 120, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'sim02', name: 'SIM 02', description: 'Advanced Sim Training', vfrDual: 0, ifrDual: 0, sim: 120, xc: 0, night: 0, solo: 0, credited: false },
      { id: 'sim03', name: 'SIM 03', description: 'Emergency Procedures', vfrDual: 0, ifrDual: 0, sim: 90, xc: 0, night: 0, solo: 0, credited: false },
    ]
  },
];

// Syllabus requirements (read-only)
const SYLLABUS_REQUIREMENTS = {
  vfrDual: 250, // 4:10 in minutes
  ifrDual: 3000, // 50:00 in minutes
  sim: 330, // 5:30 in minutes
  xc: 570, // 9:30 in minutes
  night: 180, // 3:00 in minutes
  solo: 600, // 10:00 in minutes
};

// Helper to format minutes to H:MM display
const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

// Icons
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AirplaneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ResetIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Editable Time Cell Component
const EditableTimeCell = ({ value, onChange, isEditing, setIsEditing }) => {
  const [localValue, setLocalValue] = useState(formatTime(value));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalValue(formatTime(value));
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    // Parse H:MM format
    const match = localValue.match(/^(\d+):(\d{1,2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      if (mins < 60) {
        const newValue = hours * 60 + mins;
        if (newValue !== value) {
          setIsSaving(true);
          onChange(newValue);
          setTimeout(() => setIsSaving(false), 500);
        }
      }
    } else if (localValue === '' || localValue === '0' || localValue === '0:00') {
      if (value !== 0) {
        setIsSaving(true);
        onChange(0);
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(formatTime(value));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-16 px-2 py-1 text-center text-sm font-semibold bg-white border-2 border-blue-500 rounded focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`
        relative w-16 px-2 py-1 text-center text-sm font-semibold rounded
        transition-all duration-200
        ${value > 0 ? 'text-blue-700 bg-blue-50' : 'text-gray-500'}
        hover:bg-blue-100 hover:text-blue-800
        focus:outline-none focus:ring-2 focus:ring-blue-500/20
      `}
    >
      {formatTime(value)}
      {isSaving && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center animate-pulse">
          <SaveIcon />
        </span>
      )}
    </button>
  );
};

// Checkbox Component
const Checkbox = ({ checked, onChange, indeterminate = false, disabled = false }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`
        w-5 h-5 rounded border-2 flex items-center justify-center
        transition-all duration-200
        ${checked
          ? 'bg-blue-600 border-blue-600 text-white'
          : indeterminate
            ? 'bg-amber-500 border-amber-500 text-white'
            : 'bg-white border-gray-300 hover:border-blue-400'
        }
        ${disabled ? 'opacity-50' : ''}
      `}>
        {checked && <CheckIcon />}
        {indeterminate && !checked && (
          <div className="w-2.5 h-0.5 bg-white rounded" />
        )}
      </div>
    </label>
  );
};

// Phase Header Component
const PhaseHeader = ({ phase, isExpanded, onToggle, onCreditChange, phaseStatus }) => {
  const creditedCount = phase.events.filter(e => e.credited).length;
  const totalCount = phase.events.length;
  const isAllCredited = creditedCount === totalCount;
  const isPartialCredited = creditedCount > 0 && creditedCount < totalCount;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 cursor-pointer
        transition-all duration-200
        ${isPartialCredited
          ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500'
          : isAllCredited
            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500'
            : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
        }
      `}
    >
      <div onClick={(e) => { e.stopPropagation(); onCreditChange(!isAllCredited); }}>
        <Checkbox
          checked={isAllCredited}
          indeterminate={isPartialCredited}
          onChange={onCreditChange}
        />
      </div>

      <div className="flex-1 flex items-center gap-3" onClick={onToggle}>
        <div className="text-gray-400">
          {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800">{phase.name}</h3>
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full
              ${isAllCredited
                ? 'bg-blue-100 text-blue-700'
                : isPartialCredited
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-200 text-gray-600'
              }
            `}>
              {creditedCount}/{totalCount} credited
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
        </div>
      </div>
    </div>
  );
};

// Training Event Row Component
const TrainingEventRow = ({ event, onCreditToggle }) => {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2.5 border-b border-gray-100
        transition-all duration-200
        ${event.credited
          ? 'bg-blue-50/70 hover:bg-blue-100/70'
          : 'bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="w-5" /> {/* Spacer for alignment */}
      <div className="pl-6">
        <Checkbox
          checked={event.credited}
          onChange={(checked) => onCreditToggle(event.id, checked)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${event.credited ? 'text-blue-800' : 'text-gray-700'}`}>
            {event.name}
          </span>
          {event.credited && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 rounded">
              Credited
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{event.description}</p>
      </div>

      {/* Time values */}
      <div className="flex items-center gap-4 text-right">
        {TIME_CATEGORIES.slice(0, 4).map((cat) => (
          <div key={cat.key} className="w-14 text-center">
            <span className={`
              text-sm font-medium
              ${event[cat.key] > 0
                ? event.credited ? 'text-blue-700' : 'text-gray-700'
                : 'text-gray-300'
              }
            `}>
              {event[cat.key] > 0 ? formatTime(event[cat.key]) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Auto-save indicator
const AutoSaveIndicator = ({ isSaving }) => (
  <div className={`
    flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
    transition-all duration-300
    ${isSaving
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-500'
    }
  `}>
    {isSaving ? (
      <>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Saving...
      </>
    ) : (
      <>
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        Auto-save enabled
      </>
    )}
  </div>
);

// Reset Confirmation Dialog
const ResetDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset All Credits?</h3>
        <p className="text-sm text-gray-600 mb-4">
          This will uncheck all credited lessons and set all credited totals to zero. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Credit Transfer Drawer Component
const CreditTransferDrawer = ({ isOpen, onClose, studentName = "Hello Gomora", programCode = "ATPA_FI" }) => {
  // State
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [expandedPhases, setExpandedPhases] = useState(new Set(['phase1', 'phase2']));
  const [searchQuery, setSearchQuery] = useState('');
  const [manualOverrides, setManualOverrides] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Calculate credited totals from checked events
  const creditedTotals = useMemo(() => {
    const totals = {};
    TIME_CATEGORIES.forEach(cat => {
      totals[cat.key] = 0;
    });

    phases.forEach(phase => {
      phase.events.forEach(event => {
        if (event.credited) {
          TIME_CATEGORIES.forEach(cat => {
            totals[cat.key] += event[cat.key] || 0;
          });
        }
      });
    });

    // Apply manual overrides
    Object.keys(manualOverrides).forEach(key => {
      totals[key] = manualOverrides[key];
    });

    return totals;
  }, [phases, manualOverrides]);

  // Calculate remaining
  const remainingTotals = useMemo(() => {
    const remaining = {};
    TIME_CATEGORIES.forEach(cat => {
      remaining[cat.key] = Math.max(0, SYLLABUS_REQUIREMENTS[cat.key] - creditedTotals[cat.key]);
    });
    return remaining;
  }, [creditedTotals]);

  // Filter phases/events by search
  const filteredPhases = useMemo(() => {
    if (!searchQuery) return phases;

    return phases.map(phase => ({
      ...phase,
      events: phase.events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(phase => phase.events.length > 0);
  }, [phases, searchQuery]);

  // Total counts
  const totalCredited = useMemo(() => {
    return phases.reduce((sum, phase) => sum + phase.events.filter(e => e.credited).length, 0);
  }, [phases]);

  const totalEvents = useMemo(() => {
    return phases.reduce((sum, phase) => sum + phase.events.length, 0);
  }, [phases]);

  // Handlers
  const handleTogglePhase = useCallback((phaseId) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }, []);

  const handleCreditEvent = useCallback((eventId, credited) => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase => ({
      ...phase,
      events: phase.events.map(event =>
        event.id === eventId ? { ...event, credited } : event
      )
    })));
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  const handleCreditPhase = useCallback((phaseId, credited) => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? { ...phase, events: phase.events.map(e => ({ ...e, credited })) }
        : phase
    ));
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  const handleManualOverride = useCallback((categoryKey, value) => {
    setIsSaving(true);
    setManualOverrides(prev => ({
      ...prev,
      [categoryKey]: value
    }));
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  const handleReset = useCallback(() => {
    setIsSaving(true);
    setPhases(prev => prev.map(phase => ({
      ...phase,
      events: phase.events.map(e => ({ ...e, credited: false }))
    })));
    setManualOverrides({});
    setShowResetDialog(false);
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-4xl flex flex-col bg-white shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white">
                  <AirplaneIcon />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Credit Transfer</h2>
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                      {programCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-slate-300">
                    <UserIcon />
                    <span className="text-sm">{studentName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AutoSaveIndicator isSaving={isSaving} />
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-2.5 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                <span className="text-white font-semibold">{totalCredited}</span> of {totalEvents} lessons credited
              </span>
            </div>
            <button
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <ResetIcon />
              Reset All
            </button>
          </div>
        </div>

        {/* Credit Summary Table */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Credit Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pr-4 w-32">
                      Category
                    </th>
                    {TIME_CATEGORIES.map(cat => (
                      <th key={cat.key} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 px-2">
                        {cat.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Syllabus Required Row */}
                  <tr className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-sm font-medium text-gray-600">
                      Syllabus (Required)
                    </td>
                    {TIME_CATEGORIES.map(cat => (
                      <td key={cat.key} className="py-2 px-2 text-center">
                        <span className="text-sm text-gray-500">{formatTime(SYLLABUS_REQUIREMENTS[cat.key])}</span>
                      </td>
                    ))}
                  </tr>
                  {/* Credited Row (Editable) */}
                  <tr className="border-t border-gray-100 bg-blue-50/50">
                    <td className="py-2 pr-4 text-sm font-medium text-blue-700">
                      Credited
                    </td>
                    {TIME_CATEGORIES.map(cat => (
                      <td key={cat.key} className="py-2 px-2 text-center">
                        <EditableTimeCell
                          value={creditedTotals[cat.key]}
                          onChange={(val) => handleManualOverride(cat.key, val)}
                          isEditing={editingCell === cat.key}
                          setIsEditing={(editing) => setEditingCell(editing ? cat.key : null)}
                        />
                      </td>
                    ))}
                  </tr>
                  {/* Remaining Row */}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="py-2 pr-4 text-sm font-semibold text-gray-700">
                      Remaining
                    </td>
                    {TIME_CATEGORIES.map(cat => (
                      <td key={cat.key} className="py-2 px-2 text-center">
                        <span className={`
                          text-sm font-semibold
                          ${remainingTotals[cat.key] === 0 ? 'text-green-600' : 'text-gray-700'}
                        `}>
                          {formatTime(remainingTotals[cat.key])}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Click on credited values to manually override
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search training events..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Training Events Grid */}
        <div className="flex-1 overflow-y-auto">
          {/* Column Headers */}
          <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="w-5" />
            <div className="pl-6 w-5" />
            <div className="flex-1">Training Event</div>
            <div className="flex items-center gap-4">
              {TIME_CATEGORIES.slice(0, 4).map((cat) => (
                <div key={cat.key} className="w-14 text-center">{cat.shortLabel}</div>
              ))}
            </div>
          </div>

          {/* Phases */}
          {filteredPhases.map((phase) => (
            <div key={phase.id} className="border-b border-gray-200">
              <PhaseHeader
                phase={phase}
                isExpanded={expandedPhases.has(phase.id)}
                onToggle={() => handleTogglePhase(phase.id)}
                onCreditChange={(credited) => handleCreditPhase(phase.id, credited)}
              />
              {expandedPhases.has(phase.id) && (
                <div>
                  {phase.events.map((event) => (
                    <TrainingEventRow
                      key={event.id}
                      event={event}
                      onCreditToggle={handleCreditEvent}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredPhases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <SearchIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No training events match your search</p>
            </div>
          )}
        </div>

        {/* Footer - Info only, no save button since auto-save */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{totalCredited}</span> lessons credited · Changes save automatically
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ResetDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
      />

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreditTransferDrawer;
