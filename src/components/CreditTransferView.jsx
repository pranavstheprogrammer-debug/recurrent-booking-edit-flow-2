import React, { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Credit Transfer View - PLAR System for Flight Training (Wireframe Design)
 *
 * Based on the NORTÁVIA wireframe specification:
 * - Student identification header (ID + Code + Name)
 * - Two-row column headers with VFR/IFR groupings
 * - Summary table with Syllabus/Credited rows
 * - Phase-based lesson structure with phase totals
 * - Checkboxes on the right side
 * - Blue/lavender highlighting for credited items
 * - Auto-save functionality
 *
 * Target: Multi-Engine Instrument Rating (ME-IR) training syllabus
 */

// Time columns organized by flight rules category (matches wireframe exactly)
const TIME_COLUMNS = [
  { key: 'vfrDual', label: 'Dual', category: 'VFR', colSpan: 1 },
  { key: 'ifrDual', label: 'Dual', category: 'IFR', colSpan: 1 },
  { key: 'ifrHood', label: '(?)', category: 'IFR', colSpan: 1 },
  { key: 'sim', label: 'Sim', category: null, colSpan: 1 },
  { key: 'xc', label: 'XC', category: null, colSpan: 1 },
];

// Sample training data organized by phases (ME-IR Syllabus)
const INITIAL_PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1 - BIFM',
    description: 'Basic Instrument Flight Maneuvers',
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
    name: 'Phase 2 - Adv instruments',
    description: 'Advanced Instrument Procedures',
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

// Syllabus requirements (read-only totals from wireframe)
const SYLLABUS_REQUIREMENTS = {
  vfrDual: 250, // 4:10 in minutes
  ifrDual: 3000, // 50:00 in minutes
  ifrHood: 0,
  sim: 0,
  xc: 0,
};

// Helper to format minutes to H:MM display
const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '';
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
  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// Simple Checkbox matching wireframe style
const Checkbox = ({ checked, onChange, indeterminate = false }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`
        w-4 h-4 border border-gray-400 flex items-center justify-center
        ${checked ? 'bg-blue-600 border-blue-600 text-white' :
          indeterminate ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white'}
      `}>
        {checked && <CheckIcon />}
        {indeterminate && !checked && <div className="w-2 h-0.5 bg-white" />}
      </div>
    </label>
  );
};

// Editable Time Input (like the wireframe shows with [ ] brackets)
const EditableTimeInput = ({ value, onChange, showBrackets = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(formatTime(value) || '0 : 00');

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(formatTime(value) || '0 : 00');
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseTime(localValue);
    if (parsed !== null && parsed !== value) {
      onChange(parsed);
    } else if (localValue.trim() === '' || localValue === '0 : 00') {
      onChange(0);
    } else {
      setLocalValue(formatTime(value) || '0 : 00');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') {
      setLocalValue(formatTime(value) || '0 : 00');
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
        className="w-14 px-1 py-0.5 text-center text-sm border border-blue-500 focus:outline-none bg-white"
      />
    );
  }

  const displayValue = formatTime(value) || '0 : 00';

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center text-sm hover:bg-gray-100 px-1 py-0.5"
    >
      {showBrackets && <span className="text-gray-400">[</span>}
      <span className="mx-1">{displayValue}</span>
      {showBrackets && <span className="text-gray-400">]</span>}
    </button>
  );
};

// Reset Confirmation Dialog
const ResetDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded shadow-xl p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset All Credits?</h3>
        <p className="text-sm text-gray-600 mb-4">
          This will uncheck all credited lessons and set credited totals to zero.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Reset
          </button>
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
    setManualOverrides(prev => ({ ...prev, [categoryKey]: value }));
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
      <div className="absolute inset-0 bg-gray-900/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-4xl flex flex-col bg-white shadow-2xl animate-slide-in">

        {/* Close Button Row */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className={`text-xs ${isSaving ? 'text-green-600' : 'text-gray-400'}`}>
            {isSaving ? 'Saving...' : 'Auto-save enabled'}
          </span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>

        {/* Student Identification Row */}
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-300">
          <h2 className="text-base font-semibold text-gray-800">
            {studentId} {studentCode} - {studentName}
          </h2>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: '650px' }}>
            <thead className="sticky top-0 z-10">
              {/* First Header Row - VFR / IFR Category Groups */}
              <tr className="bg-gray-200">
                <th className="text-left px-3 py-2 border border-gray-300 w-40"></th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-semibold text-gray-700 text-xs uppercase">
                  VFR
                </th>
                <th colSpan="2" className="text-center px-2 py-1.5 border border-gray-300 font-semibold text-gray-700 text-xs uppercase">
                  IFR
                </th>
                <th className="text-center px-2 py-1.5 border border-gray-300 w-16"></th>
                <th className="text-center px-2 py-1.5 border border-gray-300 w-16"></th>
                <th className="w-12 border border-gray-300"></th>
              </tr>
              {/* Second Header Row - Dual, Dual, (?), Sim, XC */}
              <tr className="bg-gray-100">
                <th className="text-left px-3 py-1.5 border border-gray-300 font-normal text-gray-600"></th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-medium text-gray-600 w-16">Dual</th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-medium text-gray-600 w-16">Dual</th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-medium text-gray-600 w-16">(?)</th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-medium text-gray-600 w-16">Sim</th>
                <th className="text-center px-2 py-1.5 border border-gray-300 font-medium text-gray-600 w-16">XC</th>
                <th className="w-12 border border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {/* Syllabus Row */}
              <tr className="bg-white">
                <td className="px-3 py-2 border border-gray-200 font-medium text-gray-700">
                  Syllabus
                </td>
                {TIME_COLUMNS.map(col => (
                  <td key={col.key} className="text-center px-2 py-2 border border-gray-200 text-gray-600">
                    {SYLLABUS_REQUIREMENTS[col.key] > 0 ? formatTime(SYLLABUS_REQUIREMENTS[col.key]) : ''}
                  </td>
                ))}
                <td className="border border-gray-200"></td>
              </tr>

              {/* Credited Row */}
              <tr className="bg-white">
                <td className="px-3 py-2 border border-gray-200 font-medium text-gray-700">
                  Credited
                </td>
                {TIME_COLUMNS.map(col => (
                  <td key={col.key} className="text-center px-2 py-1.5 border border-gray-200">
                    <EditableTimeInput
                      value={creditedTotals[col.key]}
                      onChange={(val) => handleManualOverride(col.key, val)}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 border border-gray-200">
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded"
                  >
                    Reset
                  </button>
                </td>
              </tr>

              {/* Spacer */}
              <tr className="h-3 bg-gray-50">
                <td colSpan="7"></td>
              </tr>

              {/* Phases and Events */}
              {phases.map((phase) => {
                const status = getPhaseStatus(phase);
                const phaseTotals = calculatePhaseTotals(phase);

                return (
                  <React.Fragment key={phase.id}>
                    {/* Phase Header Row */}
                    <tr className="bg-gray-100">
                      <td colSpan="6" className="px-3 py-2 border border-gray-300">
                        <span className="font-semibold text-gray-800">{phase.name}</span>
                      </td>
                      <td className="text-center px-2 py-2 border border-gray-300">
                        <Checkbox
                          checked={status.allCredited}
                          indeterminate={status.someCredited}
                          onChange={(checked) => handleCreditPhase(phase.id, checked)}
                        />
                      </td>
                    </tr>

                    {/* Event Rows */}
                    {phase.events.map((event) => (
                      <tr
                        key={event.id}
                        className={event.credited ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                      >
                        <td className="px-3 py-1.5 border border-gray-200">
                          <div className="flex items-center gap-2">
                            {event.credited && (
                              <div className="w-10 h-1 bg-blue-400 rounded-sm" />
                            )}
                            <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                              {event.name}
                            </button>
                          </div>
                        </td>
                        {TIME_COLUMNS.map(col => (
                          <td
                            key={col.key}
                            className={`text-center px-2 py-1.5 border border-gray-200 ${
                              event.credited ? 'text-blue-700' : 'text-gray-600'
                            }`}
                          >
                            {event[col.key] > 0 ? formatTime(event[col.key]) : ''}
                          </td>
                        ))}
                        <td className="text-center px-2 py-1.5 border border-gray-200">
                          <Checkbox
                            checked={event.credited}
                            onChange={(checked) => handleCreditEvent(event.id, checked)}
                          />
                        </td>
                      </tr>
                    ))}

                    {/* Phase Total Row */}
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 border border-gray-300 text-gray-600">
                        <div className="font-medium">Total - {phase.name.split(' - ')[0]}</div>
                        <div className="text-xs text-gray-400 ml-4">- {phase.name.split(' - ')[1]}</div>
                      </td>
                      {TIME_COLUMNS.map(col => (
                        <td key={col.key} className="text-center px-2 py-2 border border-gray-300 font-medium text-gray-700">
                          {phaseTotals[col.key] > 0 ? formatTime(phaseTotals[col.key]) : ''}
                        </td>
                      ))}
                      <td className="border border-gray-300"></td>
                    </tr>

                    {/* Spacer between phases */}
                    <tr className="h-2 bg-gray-50">
                      <td colSpan="7"></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Click on credited values to manually override
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Reset Dialog */}
      <ResetDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
      />

      {/* Animation */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreditTransferView;
