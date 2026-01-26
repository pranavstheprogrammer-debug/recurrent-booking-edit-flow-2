import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/**
 * NORTAVIA Credit Transfer View - SIMPLIFIED SINGLE-STEP UI
 *
 * Key improvements over the multi-step popover approach:
 * - Inline editing: Click directly on time to edit, no popover needed
 * - Stepper controls: +/- buttons for quick adjustments
 * - Quick chips: Hover reveals +15m, +30m, +1h buttons inline
 * - Consistent UI: Same card design for objectives and event breakdowns
 * - Auto-save: Changes save immediately on blur/enter
 */

// ============================================================================
// DATA CONFIGURATION
// ============================================================================

const OBJECTIVE_TYPES = [
  { key: 'vfrDual', label: 'VFR Dual', shortLabel: 'VFR', color: 'emerald', description: 'Visual Flight Rules with instructor' },
  { key: 'ifrDual', label: 'IFR Dual', shortLabel: 'IFR', color: 'blue', description: 'Instrument Flight Rules with instructor' },
  { key: 'ifrHood', label: 'IFR Hood', shortLabel: 'Hood', color: 'indigo', description: 'Simulated instrument conditions' },
  { key: 'sim', label: 'Simulator', shortLabel: 'Sim', color: 'purple', description: 'Flight simulator training' },
  { key: 'xc', label: 'Cross Country', shortLabel: 'XC', color: 'amber', description: 'Cross country navigation' },
  { key: 'night', label: 'Night', shortLabel: 'Night', color: 'slate', description: 'Night flying hours' },
  { key: 'solo', label: 'Solo', shortLabel: 'Solo', color: 'rose', description: 'Solo flight time' },
  { key: 'pic', label: 'PIC', shortLabel: 'PIC', color: 'cyan', description: 'Pilot in Command time' },
  { key: 'sic', label: 'SIC', shortLabel: 'SIC', color: 'teal', description: 'Second in Command time' },
  { key: 'instrument', label: 'Instrument', shortLabel: 'Inst', color: 'violet', description: 'Actual instrument time' },
];

const createEmptyCredits = () =>
  OBJECTIVE_TYPES.reduce((acc, obj) => ({ ...acc, [obj.key]: 0 }), {});

const INITIAL_MANUAL_CREDITS = {
  global: createEmptyCredits(),
  section1: createEmptyCredits(),
  section2: createEmptyCredits(),
  section3: createEmptyCredits(),
};

const INITIAL_SECTIONS = [
  {
    id: 'section1',
    name: 'Section 1 - Basic Instrument Flight Maneuvers (BIFM)',
    shortName: 'Section 1 - BIFM',
    description: 'Introduction to instrument flight fundamentals',
    icon: '✈️',
    events: [
      { id: 'inst01', name: 'INST 01 - Basic Attitudes', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst02', name: 'INST 02 - Straight & Level', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: true },
      { id: 'inst03', name: 'INST 03 - Turns & Climbs', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 45, credited: true },
      { id: 'inst04', name: 'INST 04 - Descents', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst05', name: 'INST 05 - Speed Changes', vfrDual: 0, ifrDual: 10, ifrHood: 90, sim: 30, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'inst06', name: 'INST 06 - Phase Check', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 60, solo: 0, pic: 0, sic: 0, instrument: 45, credited: false },
    ]
  },
  {
    id: 'section2',
    name: 'Section 2 - Advanced Instrument Procedures',
    shortName: 'Section 2 - Adv Inst',
    description: 'Complex approaches and navigation',
    icon: '🎯',
    events: [
      { id: 'inst07', name: 'INST 07 - ILS Approach', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 60, night: 0, solo: 0, pic: 30, sic: 0, instrument: 60, credited: true },
      { id: 'inst08', name: 'INST 08 - VOR Approach', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 60, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst09', name: 'INST 09 - NDB Approach', vfrDual: 30, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 30, solo: 0, pic: 0, sic: 30, instrument: 60, credited: true },
      { id: 'inst10', name: 'INST 10 - GPS/RNAV', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 90, night: 0, solo: 60, pic: 60, sic: 0, instrument: 60, credited: true },
      { id: 'inst11', name: 'INST 11 - Holding Patterns', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 60, solo: 0, pic: 0, sic: 0, instrument: 60, credited: true },
      { id: 'inst12', name: 'INST 12 - Missed Approaches', vfrDual: 60, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: true },
      { id: 'inst13', name: 'INST 13 - DME Arc', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 90, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst14', name: 'INST 14 - Cross Country', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 120, night: 90, solo: 0, pic: 90, sic: 0, instrument: 60, credited: false },
      { id: 'inst15', name: 'INST 15 - Night Operations', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 90, pic: 0, sic: 60, instrument: 60, credited: false },
      { id: 'inst16', name: 'INST 16 - Emergency Procedures', vfrDual: 45, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst17', name: 'INST 17 - Partial Panel', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 45, solo: 0, pic: 0, sic: 0, instrument: 60, credited: false },
      { id: 'inst18', name: 'INST 18 - Phase Check', vfrDual: 0, ifrDual: 10, ifrHood: 120, sim: 0, xc: 0, night: 0, solo: 0, pic: 45, sic: 0, instrument: 60, credited: false },
    ]
  },
  {
    id: 'section3',
    name: 'Section 3 - Multi-Engine Rating',
    shortName: 'Section 3 - ME',
    description: 'Multi-engine aircraft operations',
    icon: '🛩️',
    events: [
      { id: 'me01', name: 'ME 01 - Systems Ground', vfrDual: 60, ifrDual: 0, ifrHood: 0, sim: 120, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 0, credited: false },
      { id: 'me02', name: 'ME 02 - Normal Operations', vfrDual: 90, ifrDual: 30, ifrHood: 0, sim: 0, xc: 0, night: 0, solo: 0, pic: 30, sic: 0, instrument: 0, credited: false },
      { id: 'me03', name: 'ME 03 - Engine Out', vfrDual: 60, ifrDual: 30, ifrHood: 60, sim: 60, xc: 0, night: 0, solo: 0, pic: 0, sic: 0, instrument: 30, credited: false },
      { id: 'me04', name: 'ME 04 - Final Check', vfrDual: 60, ifrDual: 30, ifrHood: 60, sim: 0, xc: 90, night: 0, solo: 0, pic: 60, sic: 0, instrument: 30, credited: false },
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const formatTimeCompact = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const parseTime = (timeStr) => {
  if (!timeStr || timeStr === '—') return 0;
  const match = timeStr.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    if (mins < 60) return hours * 60 + mins;
  }
  const justMins = parseInt(timeStr, 10);
  if (!isNaN(justMins)) return justMins;
  return null;
};

const getColorClasses = (color) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-100', ring: 'ring-emerald-500', gradient: 'from-emerald-500 to-emerald-600', hover: 'hover:bg-emerald-100', active: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', pill: 'bg-blue-100', ring: 'ring-blue-500', gradient: 'from-blue-500 to-blue-600', hover: 'hover:bg-blue-100', active: 'bg-blue-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', pill: 'bg-indigo-100', ring: 'ring-indigo-500', gradient: 'from-indigo-500 to-indigo-600', hover: 'hover:bg-indigo-100', active: 'bg-indigo-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', pill: 'bg-purple-100', ring: 'ring-purple-500', gradient: 'from-purple-500 to-purple-600', hover: 'hover:bg-purple-100', active: 'bg-purple-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', pill: 'bg-amber-100', ring: 'ring-amber-500', gradient: 'from-amber-500 to-amber-600', hover: 'hover:bg-amber-100', active: 'bg-amber-500' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', pill: 'bg-slate-200', ring: 'ring-slate-500', gradient: 'from-slate-500 to-slate-600', hover: 'hover:bg-slate-200', active: 'bg-slate-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', pill: 'bg-rose-100', ring: 'ring-rose-500', gradient: 'from-rose-500 to-rose-600', hover: 'hover:bg-rose-100', active: 'bg-rose-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', pill: 'bg-cyan-100', ring: 'ring-cyan-500', gradient: 'from-cyan-500 to-cyan-600', hover: 'hover:bg-cyan-100', active: 'bg-cyan-500' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', pill: 'bg-teal-100', ring: 'ring-teal-500', gradient: 'from-teal-500 to-teal-600', hover: 'hover:bg-teal-100', active: 'bg-teal-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', pill: 'bg-violet-100', ring: 'ring-violet-500', gradient: 'from-violet-500 to-violet-600', hover: 'hover:bg-violet-100', active: 'bg-violet-500' },
  };
  return colors[color] || colors.blue;
};

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronIcon = ({ isOpen, className = "w-5 h-5" }) => (
  <svg
    className={`${className} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CreditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MinusIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const PlusIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

// ============================================================================
// INLINE EDITABLE TIME INPUT - Single step editing
// ============================================================================

const InlineTimeEditor = ({
  value,
  onChange,
  color = 'blue',
  size = 'md',
  showSteppers = true,
  showQuickAdd = true,
  label = '',
  minimal = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(formatTimeCompact(value));
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);
  const colors = getColorClasses(color);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(formatTimeCompact(value));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseTime(localValue);
    if (parsed !== null && parsed !== value) {
      onChange(parsed);
    } else {
      setLocalValue(formatTimeCompact(value));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') {
      setLocalValue(formatTimeCompact(value));
      setIsEditing(false);
    }
  };

  const handleStep = (delta) => {
    const newValue = Math.max(0, value + delta);
    onChange(newValue);
  };

  const handleQuickAdd = (minutes) => {
    const newValue = Math.max(0, value + minutes);
    onChange(newValue);
  };

  const sizeClasses = {
    sm: {
      container: 'h-8',
      input: 'text-sm w-12 px-1',
      time: 'text-sm',
      stepper: 'w-5 h-5',
      quickAdd: 'text-[9px] px-1 py-0.5',
    },
    md: {
      container: 'h-10',
      input: 'text-base w-14 px-1.5',
      time: 'text-base',
      stepper: 'w-6 h-6',
      quickAdd: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      container: 'h-12',
      input: 'text-lg w-16 px-2',
      time: 'text-lg',
      stepper: 'w-7 h-7',
      quickAdd: 'text-xs px-2 py-1',
    },
  };

  const s = sizeClasses[size];

  if (minimal) {
    // Minimal mode - just the time value, click to edit
    return (
      <div className="relative inline-flex items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`
              ${s.input} text-center font-mono font-bold
              border-2 border-blue-500 rounded-md bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/30
              transition-all
            `}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`
              ${s.time} font-mono font-bold px-1 rounded
              ${value > 0 ? colors.text : 'text-gray-400'}
              hover:bg-gray-100 transition-colors cursor-text
            `}
          >
            {value > 0 ? formatTime(value) : '0:00'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        flex items-center gap-1 rounded-lg border transition-all duration-200
        ${isHovered || isEditing
          ? `${colors.bg} ${colors.border} shadow-sm`
          : 'bg-white border-gray-200'}
      `}>
        {/* Minus stepper */}
        {showSteppers && (isHovered || isEditing) && (
          <button
            onClick={() => handleStep(-15)}
            className={`
              ${s.stepper} flex items-center justify-center rounded-l-md
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-all duration-200 flex-shrink-0
            `}
            title="Subtract 15 minutes"
          >
            <MinusIcon className="w-2.5 h-2.5" />
          </button>
        )}

        {/* Time value / input */}
        <div className="flex-1 flex items-center justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`
                ${s.input} text-center font-mono font-bold
                bg-transparent border-0
                focus:outline-none
                transition-all
              `}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`
                ${s.time} font-mono font-bold py-1 px-2
                ${value > 0 ? colors.text : 'text-gray-400'}
                cursor-text
              `}
              title={label ? `Click to edit ${label}` : 'Click to edit'}
            >
              {value > 0 ? formatTime(value) : '0:00'}
            </button>
          )}
        </div>

        {/* Plus stepper */}
        {showSteppers && (isHovered || isEditing) && (
          <button
            onClick={() => handleStep(15)}
            className={`
              ${s.stepper} flex items-center justify-center rounded-r-md
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-all duration-200 flex-shrink-0
            `}
            title="Add 15 minutes"
          >
            <PlusIcon className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Quick add chips - shown on hover, positioned above to stay within card */}
      {showQuickAdd && isHovered && !isEditing && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 flex items-center gap-0.5 z-10 animate-fadeIn">
          {[15, 30, 60].map(mins => (
            <button
              key={mins}
              onClick={() => handleQuickAdd(mins)}
              className={`
                ${s.quickAdd} font-semibold rounded
                bg-white border border-gray-200 text-gray-500
                hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700
                shadow-sm transition-all
              `}
            >
              +{mins >= 60 ? `${mins/60}h` : `${mins}m`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UNIFIED TIME CARD - Used for both objectives overview and event breakdown
// ============================================================================

const UnifiedTimeCard = ({
  label,
  shortLabel,
  color,
  creditedTime,
  requiredTime,
  manualCredit = 0,
  onManualCreditChange,
  isComplete = false,
  showProgress = true,
  compact = false,
  editable = true,
}) => {
  const colors = getColorClasses(color);
  const progress = requiredTime > 0 ? (creditedTime / requiredTime) * 100 : 0;

  if (compact) {
    // Compact mode for event time breakdown
    return (
      <div className={`
        flex flex-col p-2 rounded-lg transition-all duration-200 border
        ${creditedTime > 0 || manualCredit > 0
          ? `${colors.bg} ${colors.border}`
          : 'bg-gray-50 border-gray-100 hover:border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colors.gradient}`} />
            <span className={`text-[10px] font-semibold ${creditedTime > 0 ? colors.text : 'text-gray-500'}`}>
              {shortLabel}
            </span>
          </div>
        </div>

        {editable && onManualCreditChange ? (
          <InlineTimeEditor
            value={manualCredit}
            onChange={onManualCreditChange}
            color={color}
            size="sm"
            showSteppers={true}
            showQuickAdd={false}
          />
        ) : (
          <span className={`text-sm font-bold font-mono ${creditedTime > 0 ? colors.text : 'text-gray-400'}`}>
            {formatTime(creditedTime) || '0:00'}
          </span>
        )}
      </div>
    );
  }

  // Full mode for objectives overview
  return (
    <div
      className={`
        relative group p-2.5 rounded-xl transition-all duration-200 border
        ${isComplete
          ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 ring-1 ring-emerald-200/50'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${colors.gradient}`} />
          <span className={`text-xs font-semibold ${isComplete ? 'text-emerald-700' : 'text-gray-700'}`}>
            {shortLabel}
          </span>
        </div>
        {isComplete && (
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Time display */}
      <div className="flex items-baseline gap-1 font-mono mb-1">
        <span className={`text-lg font-bold ${isComplete ? 'text-emerald-600' : 'text-gray-800'}`}>
          {formatTime(creditedTime)}
        </span>
        {showProgress && requiredTime > 0 && (
          <>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500">{formatTime(requiredTime)}</span>
          </>
        )}
      </div>

      {/* Editable manual credit section */}
      {editable && onManualCreditChange && !isComplete && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-gray-400 uppercase tracking-wide">Manual</span>
            <InlineTimeEditor
              value={manualCredit}
              onChange={onManualCreditChange}
              color={color}
              size="sm"
              showSteppers={true}
              showQuickAdd={true}
              label={`${label} manual credit`}
            />
          </div>
        </div>
      )}

      {/* Manual credit badge (read-only display) */}
      {manualCredit > 0 && !editable && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-gray-400">
            +{formatTime(manualCredit)} manual
          </span>
        </div>
      )}

      {/* Progress bar */}
      {showProgress && requiredTime > 0 && (
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-emerald-500'
                : progress > 50
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// OBJECTIVES OVERVIEW - Simplified with inline editing
// ============================================================================

const ObjectivesOverview = ({ sections, manualCredits = {}, onManualCreditChange }) => {
  const objectiveStats = useMemo(() => {
    return OBJECTIVE_TYPES.map(objective => {
      let fromEvents = 0;
      let required = 0;
      let sectionManualCredits = 0;

      sections.forEach(section => {
        section.events.forEach(event => {
          const eventTime = event[objective.key] || 0;
          required += eventTime;
          if (event.credited) {
            fromEvents += eventTime;
          }
        });
        sectionManualCredits += manualCredits[section.id]?.[objective.key] || 0;
      });

      const globalManualCredit = manualCredits.global?.[objective.key] || 0;
      const totalManualCredit = globalManualCredit + sectionManualCredits;
      const credited = fromEvents + totalManualCredit;
      const progress = required > 0 ? (credited / required) * 100 : 0;

      return {
        ...objective,
        credited,
        fromEvents,
        manualCredit: totalManualCredit,
        globalManualCredit,
        required,
        progress,
        isComplete: credited >= required && required > 0,
        hasValue: required > 0,
      };
    }).filter(obj => obj.hasValue);
  }, [sections, manualCredits]);

  if (objectiveStats.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Objectives Overview
          </span>
          <span className="text-[9px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-md flex items-center gap-1">
            <SparkleIcon />
            Click to edit inline
          </span>
        </div>
        <span className="text-[10px] text-gray-500">
          {objectiveStats.filter(o => o.isComplete).length}/{objectiveStats.length} complete
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {objectiveStats.map(obj => (
          <UnifiedTimeCard
            key={obj.key}
            label={obj.label}
            shortLabel={obj.shortLabel}
            color={obj.color}
            creditedTime={obj.credited}
            requiredTime={obj.required}
            manualCredit={obj.globalManualCredit}
            onManualCreditChange={(value) => onManualCreditChange('global', obj.key, value)}
            isComplete={obj.isComplete}
            showProgress={true}
            editable={!obj.isComplete}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PROGRESS RING
// ============================================================================

const ProgressRing = ({ progress, size = 48, strokeWidth = 4, color = 'blue' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-500',
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    purple: 'stroke-purple-500',
    slate: 'stroke-slate-500',
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

// ============================================================================
// MODERN CHECKBOX
// ============================================================================

const ModernCheckbox = ({ checked, onChange, indeterminate = false, size = 'md', disabled = false }) => {
  const ref = useRef(null);

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
    <label className={`inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} group`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
      />
      <div className={`
        ${sizeClasses[size]} rounded-md border-2 flex items-center justify-center
        transition-all duration-200 ease-out
        ${checked
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-lg shadow-blue-500/30 scale-105'
          : indeterminate
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-400 shadow-lg shadow-amber-400/30'
            : disabled
              ? 'bg-gray-100 border-gray-300'
              : 'bg-white border-gray-300 group-hover:border-blue-400 group-hover:shadow-md'}
      `}>
        {checked && <span className="text-white"><CheckIcon /></span>}
        {indeterminate && !checked && <div className="w-3 h-0.5 bg-white rounded-full" />}
      </div>
    </label>
  );
};

// ============================================================================
// RESET DIALOG
// ============================================================================

const ResetDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scaleIn border border-gray-200">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <RefreshIcon />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Reset All Credits?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will uncheck all credited events and reset all time values to zero. This action cannot be undone.
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

// ============================================================================
// SECTION MANUAL CREDIT - Simplified inline editing
// ============================================================================

const SectionManualCredit = ({ sectionId, manualCredits = {}, onManualCreditChange, isExpanded, onToggle }) => {
  const sectionCredits = manualCredits[sectionId] || {};
  const totalManualMinutes = useMemo(() => {
    return OBJECTIVE_TYPES.reduce((sum, obj) => sum + (sectionCredits[obj.key] || 0), 0);
  }, [sectionCredits]);

  const hasAnyCredits = totalManualMinutes > 0;

  return (
    <div className={`
      rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
      ${hasAnyCredits
        ? 'border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50'
        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'}
    `}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
      >
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          ${hasAnyCredits
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30'
            : 'bg-gray-200'}
        `}>
          <CreditIcon className={`w-3.5 h-3.5 ${hasAnyCredits ? 'text-white' : 'text-gray-500'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${hasAnyCredits ? 'text-violet-700' : 'text-gray-600'}`}>
              Manual Credit
            </span>
            {hasAnyCredits && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-violet-100 text-violet-700 rounded-md">
                {formatTime(totalManualMinutes)} total
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Click to expand and edit directly
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PlusIcon className={`w-4 h-4 ${hasAnyCredits ? 'text-violet-500' : 'text-gray-400'}`} />
          <ChevronRightIcon isOpen={isExpanded} />
        </div>
      </button>

      {/* Expanded Content with inline editing */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 pt-2 border-t border-dashed border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {OBJECTIVE_TYPES.map(obj => {
              const value = sectionCredits[obj.key] || 0;
              return (
                <UnifiedTimeCard
                  key={obj.key}
                  label={obj.label}
                  shortLabel={obj.shortLabel}
                  color={obj.color}
                  creditedTime={value}
                  requiredTime={0}
                  manualCredit={value}
                  onManualCreditChange={(val) => onManualCreditChange(sectionId, obj.key, val)}
                  showProgress={false}
                  compact={true}
                  editable={true}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EVENT CARD - Simplified with consistent UI
// ============================================================================

const EventCard = ({ event, onCredit, expanded, onToggleExpand, onEventTimeChange }) => {
  const nonZeroTimes = useMemo(() => {
    return OBJECTIVE_TYPES.filter(col => event[col.key] > 0);
  }, [event]);

  const totalEventTime = useMemo(() => {
    return OBJECTIVE_TYPES.reduce((sum, col) => sum + (event[col.key] || 0), 0);
  }, [event]);

  return (
    <div className={`
      rounded-xl border transition-all duration-200 overflow-hidden
      ${event.credited
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}
    `}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div onClick={(e) => e.stopPropagation()}>
          <ModernCheckbox
            checked={event.credited}
            onChange={(checked) => onCredit(event.id, checked)}
            size="sm"
          />
        </div>

        <button
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 min-w-0 text-left"
        >
          <span className="text-gray-500">
            <ChevronRightIcon isOpen={expanded} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`
                font-semibold text-sm truncate
                ${event.credited ? 'text-blue-700' : 'text-gray-800'}
              `}>
                {event.name}
              </span>
              {event.credited && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                  <CheckIcon className="w-3 h-3" />
                  Credited
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {nonZeroTimes.slice(0, 3).map(col => {
                const colors = getColorClasses(col.color);
                return (
                  <span
                    key={col.key}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.pill} ${colors.text}`}
                  >
                    <span className="opacity-70">{col.shortLabel}</span>
                    <span className="font-bold font-mono">{formatTime(event[col.key])}</span>
                  </span>
                );
              })}
              {nonZeroTimes.length > 3 && (
                <span className="text-[10px] text-gray-400 px-1">
                  +{nonZeroTimes.length - 3} more
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-500">Total</div>
          <div className={`text-sm font-bold font-mono ${event.credited ? 'text-blue-700' : 'text-gray-800'}`}>
            {formatTime(totalEventTime)}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
              Time Breakdown
            </span>
            <span className="text-[9px] text-gray-400 flex items-center gap-1">
              <SparkleIcon />
              Click values to edit
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {OBJECTIVE_TYPES.map(col => {
              const value = event[col.key];
              return (
                <UnifiedTimeCard
                  key={col.key}
                  label={col.label}
                  shortLabel={col.shortLabel}
                  color={col.color}
                  creditedTime={value}
                  requiredTime={0}
                  manualCredit={value}
                  onManualCreditChange={(val) => onEventTimeChange(event.id, col.key, val)}
                  showProgress={false}
                  compact={true}
                  editable={true}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TRAINING SECTION
// ============================================================================

const TrainingSection = ({
  section,
  isExpanded,
  onToggle,
  onCreditEvent,
  onCreditSection,
  status,
  expandedEvents,
  onToggleEventExpand,
  onEventTimeChange,
  manualCredits,
  onManualCreditChange,
  manualCreditExpanded,
  onToggleManualCredit,
}) => {
  const creditedCount = section.events.filter(e => e.credited).length;
  const progress = (creditedCount / section.events.length) * 100;

  return (
    <div className={`
      bg-white rounded-2xl border transition-all duration-300 overflow-hidden
      ${status.allCredited
        ? 'border-emerald-200 shadow-lg shadow-emerald-500/10'
        : status.someCredited
          ? 'border-blue-200 shadow-lg shadow-blue-500/10'
          : 'border-gray-200 shadow-sm hover:shadow-md'}
    `}>
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
            {section.icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">{section.shortName}</h3>
            <p className="text-xs text-gray-500">{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{creditedCount}/{section.events.length}</div>
              <div className="text-[10px] text-gray-500">events</div>
            </div>
            <ProgressRing
              progress={progress}
              size={40}
              strokeWidth={3}
              color={status.allCredited ? 'emerald' : 'blue'}
            />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <ModernCheckbox
              checked={status.allCredited}
              indeterminate={status.someCredited}
              onChange={(checked) => onCreditSection(section.id, checked)}
              size="md"
            />
          </div>

          <span className="text-gray-500">
            <ChevronIcon isOpen={isExpanded} />
          </span>
        </div>
      </button>

      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 space-y-3">
          <SectionManualCredit
            sectionId={section.id}
            manualCredits={manualCredits}
            onManualCreditChange={onManualCreditChange}
            isExpanded={manualCreditExpanded}
            onToggle={onToggleManualCredit}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-gray-700">Training Events</span>
              <span className="text-[10px] text-gray-500">
                {creditedCount} of {section.events.length} credited
              </span>
            </div>
            {section.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onCredit={onCreditEvent}
                expanded={expandedEvents.has(event.id)}
                onToggleExpand={() => onToggleEventExpand(event.id)}
                onEventTimeChange={onEventTimeChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreditTransferViewSimple = ({
  isOpen,
  onClose,
  studentId = "17094",
  studentCode = "NRO",
  studentName = "Nuno Rodrigues",
}) => {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [manualCredits, setManualCredits] = useState(INITIAL_MANUAL_CREDITS);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['section1', 'section2', 'section3']);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [expandedManualCredits, setExpandedManualCredits] = useState(new Set());

  const overallStats = useMemo(() => {
    const totalEvents = sections.reduce((sum, s) => sum + s.events.length, 0);
    const creditedEvents = sections.reduce((sum, s) => sum + s.events.filter(e => e.credited).length, 0);

    return {
      totalEvents,
      creditedEvents,
      eventProgress: totalEvents > 0 ? (creditedEvents / totalEvents) * 100 : 0,
    };
  }, [sections]);

  const getSectionStatus = useCallback((section) => {
    const creditedCount = section.events.filter(e => e.credited).length;
    const totalCount = section.events.length;
    return {
      allCredited: creditedCount === totalCount,
      someCredited: creditedCount > 0 && creditedCount < totalCount,
    };
  }, []);

  const handleCreditEvent = useCallback((eventId, credited) => {
    setIsSaving(true);
    setSections(prev => prev.map(section => ({
      ...section,
      events: section.events.map(event =>
        event.id === eventId ? { ...event, credited } : event
      )
    })));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleCreditSection = useCallback((sectionId, credited) => {
    setIsSaving(true);
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, events: section.events.map(e => ({ ...e, credited })) }
        : section
    ));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleEventTimeChange = useCallback((eventId, objectiveKey, value) => {
    setIsSaving(true);
    setSections(prev => prev.map(section => ({
      ...section,
      events: section.events.map(event =>
        event.id === eventId ? { ...event, [objectiveKey]: value } : event
      )
    })));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleManualCreditChange = useCallback((scope, objectiveKey, value) => {
    setIsSaving(true);
    setManualCredits(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [objectiveKey]: value
      }
    }));
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const handleReset = useCallback(() => {
    setIsSaving(true);
    setSections(prev => prev.map(section => ({
      ...section,
      events: section.events.map(e => ({ ...e, credited: false }))
    })));
    setManualCredits(INITIAL_MANUAL_CREDITS);
    setShowResetDialog(false);
    setTimeout(() => setIsSaving(false), 600);
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
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

  const toggleManualCreditExpand = useCallback((sectionId) => {
    setExpandedManualCredits(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl flex flex-col bg-gray-50 shadow-2xl animate-slideIn">

        {/* Header */}
        <div className="bg-white text-gray-900 border-b border-gray-200">
          {/* Top Bar */}
          <div className="flex justify-between items-center px-5 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">Credit Transfer</h1>
              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                PLAR
              </span>
              <span className="px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-md text-[10px] font-medium text-violet-700 flex items-center gap-1">
                <SparkleIcon />
                SIMPLE MODE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                transition-all duration-300
                ${isSaving
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'}
              `}>
                {isSaving ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Auto-save
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{studentName}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-mono">{studentId}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-mono">{studentCode}</span>
                  <span>ME-IR Training Program</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Card */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Events Credited</span>
                <ProgressRing progress={overallStats.eventProgress} size={36} strokeWidth={3} color="emerald" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {overallStats.creditedEvents} <span className="text-sm font-normal text-gray-500">/ {overallStats.totalEvents}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${overallStats.eventProgress}%` }} />
              </div>
            </div>

            {/* Objectives Overview with inline editing */}
            <ObjectivesOverview
              sections={sections}
              manualCredits={manualCredits}
              onManualCreditChange={handleManualCreditChange}
            />
          </div>

        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-4 bg-gray-50">
          {sections.map((section) => (
            <TrainingSection
              key={section.id}
              section={section}
              isExpanded={expandedSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
              onCreditEvent={handleCreditEvent}
              onCreditSection={handleCreditSection}
              status={getSectionStatus(section)}
              expandedEvents={expandedEvents}
              onToggleEventExpand={toggleEventExpand}
              onEventTimeChange={handleEventTimeChange}
              manualCredits={manualCredits}
              onManualCreditChange={handleManualCreditChange}
              manualCreditExpanded={expandedManualCredits.has(section.id)}
              onToggleManualCredit={() => toggleManualCreditExpand(section.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600
                       bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            <RefreshIcon />
            Reset All
          </button>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{overallStats.creditedEvents}</span> of{' '}
              <span className="font-semibold text-gray-900">{overallStats.totalEvents}</span> events credited
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white
                         bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                         rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              Done
            </button>
          </div>
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

export default CreditTransferViewSimple;
