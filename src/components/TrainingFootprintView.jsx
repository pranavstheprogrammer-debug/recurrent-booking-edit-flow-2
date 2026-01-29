import React, { useState, useMemo, useCallback } from 'react';

/**
 * Training Footprint View - Modern UI for Training Report
 *
 * Features:
 * - Compact collapsible objectives overview with progress bars
 * - Grouped training events (repeated events consolidated)
 * - Expandable booking details for each event
 * - Section-level summaries with executed/credited/extended time
 * - Multi-color segmented progress bar with legends
 * - Time display in HH:mm format
 *
 * Stats Definitions:
 * - Planned: Target time for an event/section
 * - Executed: Actual time spent on training
 * - Credited: Time credited for prior experience (student competency)
 * - Extended: Additional time over planned target (repeats/reattempts)
 * - Total: Executed + Credited + Extended
 */

// ============================================================================
// DATA CONFIGURATION
// ============================================================================

const OBJECTIVE_TYPES = [
  { key: 'flightTime', label: 'Flight Time', shortLabel: 'Flight', color: 'blue', icon: '✈️' },
  { key: 'dualTime', label: 'Dual Time', shortLabel: 'Dual', color: 'emerald', icon: '👥' },
  { key: 'soloTime', label: 'Solo Time', shortLabel: 'Solo', color: 'rose', icon: '🎯' },
  { key: 'spicTime', label: 'SPIC Time', shortLabel: 'SPIC', color: 'purple', icon: '🎖️' },
  { key: 'vfrDual', label: 'VFR Dual', shortLabel: 'VFR-D', color: 'cyan', icon: '☀️' },
  { key: 'vfrSolo', label: 'VFR Solo', shortLabel: 'VFR-S', color: 'teal', icon: '🌤️' },
  { key: 'vfrSim', label: 'VFR SIM', shortLabel: 'VFR-Sim', color: 'indigo', icon: '🖥️' },
  { key: 'ifrDual', label: 'IFR Dual', shortLabel: 'IFR-D', color: 'amber', icon: '🌙' },
];

// Sample data - objectives with planned, executed, credited, extended, total tracking
// Note: Executed <= Planned always; Total = Executed + Credited + Extended
const INITIAL_OBJECTIVES = {
  flightTime: { planned: 1800, executed: 240, credited: 60, extended: 0, required: 1800, unit: 'h' },
  dualTime: { planned: 1800, executed: 200, credited: 40, extended: 0, required: 1800, unit: 'h' },
  soloTime: { planned: 60, executed: 0, credited: 0, extended: 0, required: 60, unit: 'h' },  // No credit/extended
  spicTime: { planned: 2400, executed: 120, credited: 0, extended: 30, required: 2400, unit: 'h' },  // No credit
  vfrDual: { planned: 2400, executed: 180, credited: 60, extended: 0, required: 2400, unit: 'h' },
  vfrSolo: { planned: 60, executed: 0, credited: 0, extended: 0, required: 60, unit: 'h' },  // No credit/extended
  vfrSim: { planned: 1800, executed: 90, credited: 0, extended: 0, required: 1800, unit: 'h' },  // No credit/extended
  ifrDual: { planned: 1800, executed: 60, credited: 30, extended: 15, required: 1800, unit: 'h' },
};

// Training events with bookings - each booking now has executedTime
// Note: Executed <= Planned always; some sections have no credited/extended times
const INITIAL_SECTIONS = [
  // Section 1: VFR Basic Training - Has credited time at section level
  {
    id: 'vfr-basic',
    name: 'VFR Basic Training',
    creditedTime: 30, // Only VCON02 has 30 min credited for prior experience
    events: [
      {
        id: 'vcon01',
        eventCode: 'ATPA_6_VCON01',
        name: 'VCON 01 - Basic Visual Circuits',
        plannedTime: 120, // 2 hours planned
        creditedTime: 0, // No prior credit for this event
        bookings: [
          { id: 'b1', date: '28/01/2026', status: 'Executed', executedTime: 115, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Good execution.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon02',
        eventCode: 'ATPA_6_VCON02',
        name: 'VCON 02 - Advanced Circuits',
        plannedTime: 120,
        creditedTime: 30, // 30 min credited for prior experience
        bookings: [
          { id: 'b2', date: '28/01/2026', status: 'Executed', executedTime: 85, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Credit applied for prior experience.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon03',
        eventCode: 'ATPA_6_VCON03',
        name: 'VCON 03 - Circuit Emergencies',
        plannedTime: 120,
        creditedTime: 0,
        bookings: [
          { id: 'b3', date: '27/01/2026', status: 'Executed', executedTime: 118, grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Needs improvement', instructor: 'F-PSI' },
          { id: 'b4', date: '28/01/2026', status: 'Executed', executedTime: 110, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Passed on retry', instructor: 'F-PSI' },
        ]
      },
    ]
  },

  // Section 2: VFR Advanced - No credited time (clean start)
  {
    id: 'vfr-advanced',
    name: 'VFR Advanced Training',
    creditedTime: 0, // No section-level credit
    events: [
      {
        id: 'vcon04',
        eventCode: 'ATPA_6_VCON04',
        name: 'VCON 04 - Cross-wind Operations',
        plannedTime: 120,
        creditedTime: 0, // No credit
        bookings: [
          { id: 'b5', date: '25/01/2026', status: 'Executed', executedTime: 115, grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Failed - needs practice', instructor: 'F-PSI' },
          { id: 'b6', date: '26/01/2026', status: 'Executed', executedTime: 110, grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Still struggling', instructor: 'F-PSI' },
          { id: 'b7', date: '28/01/2026', status: 'Executed', executedTime: 118, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Finally passed!', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon05',
        eventCode: 'ATPA_6_VCON05',
        name: 'VCON 05 - Night Circuits',
        plannedTime: 120,
        creditedTime: 0,
        bookings: [
          { id: 'b8', date: '28/01/2026', status: 'Executed', executedTime: 105, grade: 4, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Satisfactory performance.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon06',
        eventCode: 'ATPA_6_VCON06',
        name: 'VCON 06 - Formation Flying Basics',
        plannedTime: 90,
        creditedTime: 0,
        bookings: [
          { id: 'b9', date: '29/01/2026', status: 'Executed', executedTime: 88, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Excellent spacing maintained.', instructor: 'J-LIN' },
        ]
      },
    ]
  },

  // Section 3: IFR Training - Has credited time, some events with no bookings
  {
    id: 'ifr-training',
    name: 'IFR Instrument Training',
    creditedTime: 30, // Only IFR01 has 30 min credited for prior instrument experience
    events: [
      {
        id: 'ifr01',
        eventCode: 'ATPA_7_IFR01',
        name: 'IFR 01 - Basic Instrument Scan',
        plannedTime: 90,
        creditedTime: 30, // 30 min credited
        bookings: [
          { id: 'b10', date: '20/01/2026', status: 'Executed', executedTime: 58, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Credit applied. Good scan technique.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr02',
        eventCode: 'ATPA_7_IFR02',
        name: 'IFR 02 - Holding Patterns',
        plannedTime: 120,
        creditedTime: 0, // No credit
        bookings: [
          { id: 'b11', date: '21/01/2026', status: 'Executed', executedTime: 110, grade: 4, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Minor timing corrections needed.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr03',
        eventCode: 'ATPA_7_IFR03',
        name: 'IFR 03 - ILS Approaches',
        plannedTime: 120,
        creditedTime: 0,
        bookings: [
          { id: 'b12', date: '22/01/2026', status: 'Executed', executedTime: 115, grade: 3, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Glideslope tracking needs work.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr04',
        eventCode: 'ATPA_7_IFR04',
        name: 'IFR 04 - NDB Approaches',
        plannedTime: 90,
        creditedTime: 0,
        bookings: [] // Not yet started - no bookings
      },
    ]
  },

  // Section 4: Simulator Training - No credited time, no extended time (clean execution)
  {
    id: 'sim-training',
    name: 'Simulator Training',
    creditedTime: 0, // No section-level credit
    events: [
      {
        id: 'sim01',
        eventCode: 'ATPA_8_SIM01',
        name: 'SIM 01 - Emergency Procedures',
        plannedTime: 180, // 3 hours
        creditedTime: 0,
        bookings: [
          { id: 'b13', date: '15/01/2026', status: 'Executed', executedTime: 170, grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Excellent emergency handling.', instructor: 'R-DAS' },
        ]
      },
      {
        id: 'sim02',
        eventCode: 'ATPA_8_SIM02',
        name: 'SIM 02 - Engine Failure Scenarios',
        plannedTime: 180,
        creditedTime: 0,
        bookings: [
          { id: 'b14', date: '16/01/2026', status: 'Executed', executedTime: 175, grade: 4, soloTime: null, vfrSolo: null, approvalStatus: 'Approved', remarks: 'Good decision making.', instructor: 'R-DAS' },
        ]
      },
      {
        id: 'sim03',
        eventCode: 'ATPA_8_SIM03',
        name: 'SIM 03 - Multi-Engine Operations',
        plannedTime: 240, // 4 hours
        creditedTime: 0,
        bookings: [] // Not yet started
      },
      {
        id: 'sim04',
        eventCode: 'ATPA_8_SIM04',
        name: 'SIM 04 - LOFT Scenario',
        plannedTime: 240,
        creditedTime: 0,
        bookings: [] // Not yet started
      },
    ]
  },
];

// ============================================================================
// STAT COLORS - Semantic color system for time tracking
// ============================================================================

const STAT_COLORS = {
  planned: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    bar: 'bg-slate-300',
    light: 'bg-slate-50',
  },
  executed: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bar: 'bg-blue-500',
    light: 'bg-blue-50',
  },
  credited: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
    light: 'bg-emerald-50',
  },
  extended: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
    light: 'bg-amber-50',
  },
  total: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
    bar: 'bg-purple-500',
    light: 'bg-purple-50',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format time in HH:mm format
const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '00:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Format time with "h" suffix for compact display
const formatTimeCompact = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const getProgressColor = (percent) => {
  if (percent >= 100) return 'bg-emerald-500';
  if (percent >= 50) return 'bg-blue-500';
  if (percent >= 25) return 'bg-amber-500';
  return 'bg-gray-300';
};

const getGradeColor = (grade) => {
  if (grade >= 4) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (grade >= 2) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

// Get color classes for an objective type (matching Training Credit view)
const getColorClasses = (color) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', progress: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', progress: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', progress: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', progress: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', progress: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', progress: 'bg-slate-500', gradient: 'from-slate-500 to-slate-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', progress: 'bg-rose-500', gradient: 'from-rose-500 to-rose-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', progress: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', progress: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', progress: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600' },
  };
  return colors[color] || colors.blue;
};

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const ChevronDownIcon = ({ isOpen, className = "w-5 h-5" }) => (
  <svg
    className={`${className} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ isOpen, className = "w-4 h-4" }) => (
  <svg
    className={`${className} transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RepeatIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const GradingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PlayIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CreditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const PlusCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================================
// MULTI-SEGMENT PROGRESS BAR COMPONENT
// ============================================================================

const SegmentedProgressBar = ({
  planned,
  executed,
  credited,
  extended,
  showLegend = false,
  compact = false,
  className = ""
}) => {
  const total = executed + credited + extended;
  const maxValue = Math.max(planned, total);

  // Calculate percentages relative to max
  const executedPercent = maxValue > 0 ? (executed / maxValue) * 100 : 0;
  const creditedPercent = maxValue > 0 ? (credited / maxValue) * 100 : 0;
  const extendedPercent = maxValue > 0 ? (extended / maxValue) * 100 : 0;
  const plannedPercent = maxValue > 0 ? (planned / maxValue) * 100 : 0;

  // Calculate fill vs planned ratio
  const completionPercent = planned > 0 ? Math.round((total / planned) * 100) : 0;

  return (
    <div className={`${className}`}>
      {/* Progress Bar Container */}
      <div className={`relative w-full ${compact ? 'h-2' : 'h-3'} bg-slate-100 rounded-full overflow-hidden`}>
        {/* Planned indicator line (if total < planned) */}
        {total < planned && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
            style={{ left: `${plannedPercent}%` }}
          />
        )}

        {/* Stacked segments */}
        <div className="absolute inset-0 flex">
          {/* Executed segment */}
          {executed > 0 && (
            <div
              className={`${STAT_COLORS.executed.bar} h-full transition-all duration-300`}
              style={{ width: `${executedPercent}%` }}
              title={`Executed: ${formatTime(executed)}`}
            />
          )}

          {/* Credited segment */}
          {credited > 0 && (
            <div
              className={`${STAT_COLORS.credited.bar} h-full transition-all duration-300`}
              style={{ width: `${creditedPercent}%` }}
              title={`Credited: ${formatTime(credited)}`}
            />
          )}

          {/* Extended segment */}
          {extended > 0 && (
            <div
              className={`${STAT_COLORS.extended.bar} h-full transition-all duration-300`}
              style={{ width: `${extendedPercent}%` }}
              title={`Extended: ${formatTime(extended)}`}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STAT_COLORS.executed.bar}`} />
            <span className="text-gray-600">Executed</span>
            <span className={`font-mono font-medium ${STAT_COLORS.executed.text}`}>{formatTime(executed)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STAT_COLORS.credited.bar}`} />
            <span className="text-gray-600">Credited</span>
            <span className={`font-mono font-medium ${STAT_COLORS.credited.text}`}>{formatTime(credited)}</span>
          </div>
          {extended > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${STAT_COLORS.extended.bar}`} />
              <span className="text-gray-600">Extended</span>
              <span className={`font-mono font-medium ${STAT_COLORS.extended.text}`}>+{formatTime(extended)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-gray-500">vs Planned</span>
            <span className={`font-semibold ${
              completionPercent >= 100 ? 'text-emerald-600' :
              completionPercent >= 50 ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {completionPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STAT CHIP COMPONENT - Compact time display
// ============================================================================

const StatChip = ({ label, value, type = 'default', showPlus = false, compact = false }) => {
  const colors = STAT_COLORS[type] || STAT_COLORS.planned;

  return (
    <div className={`
      flex items-center gap-1.5 px-2 py-1 rounded-md
      ${colors.light} ${colors.border} border
    `}>
      <span className={`text-[10px] font-medium ${colors.text} uppercase tracking-wide`}>
        {label}
      </span>
      <span className={`font-mono font-semibold ${colors.text} ${compact ? 'text-xs' : 'text-sm'}`}>
        {showPlus && value !== '00:00' ? '+' : ''}{value}
      </span>
    </div>
  );
};

// ============================================================================
// COMPACT OBJECTIVES BAR
// ============================================================================

const ObjectivesBar = ({ objectives, isExpanded, onToggle }) => {
  const stats = useMemo(() => {
    return OBJECTIVE_TYPES.map(obj => {
      const data = objectives[obj.key] || { planned: 0, executed: 0, credited: 0, extended: 0, required: 0 };
      const total = (data.executed || 0) + (data.credited || 0) + (data.extended || 0);
      const progress = data.required > 0 ? (total / data.required) * 100 : 0;
      return {
        ...obj,
        planned: data.planned || data.required || 0,
        executed: data.executed || 0,
        credited: data.credited || 0,
        extended: data.extended || 0,
        total,
        required: data.required || 0,
        progress: Math.min(progress, 100),
        isComplete: total >= data.required && data.required > 0,
      };
    }).filter(obj => obj.required > 0);
  }, [objectives]);

  const overallProgress = useMemo(() => {
    const totalRequired = stats.reduce((sum, s) => sum + s.required, 0);
    const totalAchieved = stats.reduce((sum, s) => sum + s.total, 0);
    return totalRequired > 0 ? Math.round((totalAchieved / totalRequired) * 100) : 0;
  }, [stats]);

  const completedCount = stats.filter(s => s.isComplete).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Collapsed Summary Bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Objectives Overview</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {completedCount}/{stats.length} complete
            </span>
          </div>

          {/* Mini progress indicators when collapsed */}
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-2 ml-4">
              {stats.slice(0, 4).map(obj => (
                <div key={obj.key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-br ${getColorClasses(obj.color).gradient}`} />
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getColorClasses(obj.color).progress}`}
                      style={{ width: `${obj.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{obj.shortLabel}</span>
                </div>
              ))}
              {stats.length > 4 && (
                <span className="text-[10px] text-gray-400">+{stats.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(overallProgress)}`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700">{overallProgress}%</span>
          </div>
          <ChevronDownIcon isOpen={isExpanded} className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {/* Expanded Content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(obj => (
              <div
                key={obj.key}
                className={`
                  relative p-3 rounded-lg border transition-all
                  ${obj.isComplete
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'}
                `}
              >
                {/* Header with label and completion status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gradient-to-br ${getColorClasses(obj.color).gradient}`} />
                    <span className="text-xs font-semibold text-gray-700">{obj.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {obj.isComplete && (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className={`text-xs font-medium ${obj.isComplete ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {Math.round(obj.progress)}%
                    </span>
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="mb-3">
                  <SegmentedProgressBar
                    planned={obj.planned}
                    executed={obj.executed}
                    credited={obj.credited}
                    extended={obj.extended}
                    compact
                  />
                </div>

                {/* Time Metrics Grid - 5 metrics in 2 rows */}
                <div className="grid grid-cols-5 gap-1 text-center">
                  {/* Planned */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-medium text-slate-500 uppercase tracking-wider">Plan</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-700">{formatTime(obj.planned)}</span>
                  </div>
                  {/* Executed */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-medium text-blue-500 uppercase tracking-wider">Exec</span>
                    <span className="text-[10px] font-mono font-semibold text-blue-600">{formatTime(obj.executed)}</span>
                  </div>
                  {/* Credited */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-medium text-emerald-500 uppercase tracking-wider">Cred</span>
                    <span className={`text-[10px] font-mono font-semibold ${obj.credited > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {obj.credited > 0 ? formatTime(obj.credited) : '—'}
                    </span>
                  </div>
                  {/* Extended */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-medium text-amber-500 uppercase tracking-wider">Ext</span>
                    <span className={`text-[10px] font-mono font-semibold ${obj.extended > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {obj.extended > 0 ? formatTime(obj.extended) : '—'}
                    </span>
                  </div>
                  {/* Total */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-medium text-purple-500 uppercase tracking-wider">Total</span>
                    <span className="text-[10px] font-mono font-semibold text-purple-600">{formatTime(obj.total)}</span>
                  </div>
                </div>

                {/* Required indicator */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[9px] text-gray-500">Required</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-700">{formatTime(obj.required)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BOOKING ROW COMPONENT
// ============================================================================

const BookingRow = ({ booking, isLast }) => {
  return (
    <div className={`
      flex items-center gap-4 px-4 py-2.5 bg-gray-50/50
      ${!isLast ? 'border-b border-gray-100' : ''}
    `}>
      <div className="w-8" /> {/* Indent spacer */}

      <div className="flex items-center gap-2 min-w-[100px]">
        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-600 font-mono">{booking.date}</span>
      </div>

      <span className={`
        px-2 py-0.5 text-[10px] font-semibold rounded-full
        ${booking.status === 'Executed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
      `}>
        {booking.status}
      </span>

      {/* Executed Time for this booking */}
      <div className="flex items-center gap-1 min-w-[70px]">
        <ClockIcon className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-mono text-blue-600 font-medium">
          {formatTime(booking.executedTime || 0)}
        </span>
      </div>

      <div className="flex-1" />

      {booking.grade !== null && (
        <span className={`
          w-6 h-6 flex items-center justify-center text-xs font-bold rounded border
          ${getGradeColor(booking.grade)}
        `}>
          {booking.grade}
        </span>
      )}

      <span className={`
        px-2 py-0.5 text-[10px] font-medium rounded
        ${booking.approvalStatus === 'Student Review'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-600'}
      `}>
        {booking.approvalStatus}
      </span>

      <div className="w-32 text-xs text-gray-500 truncate" title={booking.remarks}>
        {booking.remarks || '—'}
      </div>

      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="View Details">
          <EyeIcon className="w-4 h-4 text-gray-400" />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Perform Grading">
          <GradingIcon className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// GROUPED EVENT ROW COMPONENT
// ============================================================================

const GroupedEventRow = ({ event, isExpanded, onToggle }) => {
  const stats = useMemo(() => {
    const bookings = event.bookings || [];
    const totalBookings = bookings.length;
    const executedBookings = bookings.filter(b => b.status === 'Executed').length;
    const passedBookings = bookings.filter(b => b.grade >= 4).length;
    const failedBookings = bookings.filter(b => b.grade < 4).length;
    const latestGrade = bookings.length > 0 ? bookings[bookings.length - 1].grade : null;

    // Calculate times
    const plannedTime = event.plannedTime || 120; // Default 2 hours
    const creditedTime = event.creditedTime || 0; // Prior experience credit

    // Sum of all executed time from bookings
    const executedTime = bookings.reduce((sum, b) => sum + (b.executedTime || 0), 0);

    // Extended time is the amount over (planned - credited) if completed
    // Only count as extended if they've actually done more work than required
    const requiredTime = Math.max(0, plannedTime - creditedTime);
    const extendedTime = passedBookings > 0 ? Math.max(0, executedTime - requiredTime) : 0;

    // Total = Executed + Credited + Extended (but extended is part of executed in repeats)
    // Actually: Total is the sum towards completion = Executed + Credited
    // Extended is just time spent beyond planned
    const totalTime = executedTime + creditedTime;

    return {
      totalBookings,
      executedBookings,
      passedBookings,
      failedBookings,
      latestGrade,
      plannedTime,
      executedTime,
      creditedTime,
      extendedTime,
      totalTime,
      hasRepeats: totalBookings > 1,
      isCompleted: passedBookings > 0,
      hasFailed: failedBookings > 0 && passedBookings === 0,
    };
  }, [event]);

  return (
    <div className={`
      border rounded-lg transition-all duration-200 overflow-hidden
      ${stats.isCompleted
        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white'
        : stats.hasFailed
          ? 'border-amber-200 bg-gradient-to-r from-amber-50/50 to-white'
          : 'border-gray-200 bg-white hover:border-gray-300'}
    `}>
      {/* Main Row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Expand Button */}
        <button className="p-0.5 text-gray-400 hover:text-gray-600">
          <ChevronRightIcon isOpen={isExpanded} />
        </button>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline truncate">
              {event.eventCode}
            </a>
            {stats.hasRepeats && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                <RepeatIcon className="w-3 h-3" />
                {stats.totalBookings}x
              </span>
            )}
            {stats.creditedTime > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                <CreditIcon className="w-3 h-3" />
                Credit
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{event.name}</p>
        </div>

        {/* Time Stats - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <StatChip label="Plan" value={formatTime(stats.plannedTime)} type="planned" compact />
          <StatChip label="Exec" value={formatTime(stats.executedTime)} type="executed" compact />
          {stats.creditedTime > 0 && (
            <StatChip label="Cred" value={formatTime(stats.creditedTime)} type="credited" compact />
          )}
          {stats.extendedTime > 0 && (
            <StatChip label="Ext" value={formatTime(stats.extendedTime)} type="extended" showPlus compact />
          )}
        </div>

        {/* Mini Progress Bar - Tablet */}
        <div className="hidden md:block lg:hidden w-32">
          <SegmentedProgressBar
            planned={stats.plannedTime}
            executed={stats.executedTime}
            credited={stats.creditedTime}
            extended={stats.extendedTime}
            compact
          />
        </div>

        {/* Latest Grade */}
        {stats.latestGrade !== null && (
          <span className={`
            w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg border
            ${getGradeColor(stats.latestGrade)}
          `}>
            {stats.latestGrade}
          </span>
        )}

        {/* Status Badge */}
        <span className={`
          px-2 py-1 text-[10px] font-semibold rounded
          ${stats.isCompleted
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-blue-100 text-blue-700'}
        `}>
          {stats.isCompleted ? 'Completed' : 'In Progress'}
        </span>

        {/* Booking Count */}
        <div className="text-center min-w-[50px]">
          <div className="text-xs font-semibold text-gray-700">
            {stats.executedBookings}/{stats.totalBookings}
          </div>
          <div className="text-[10px] text-gray-400">bookings</div>
        </div>

      </div>

      {/* Expanded Bookings */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="border-t border-gray-100">
          {/* Mobile/Tablet Time Stats Summary */}
          <div className="lg:hidden px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatChip label="Planned" value={formatTime(stats.plannedTime)} type="planned" />
              <StatChip label="Executed" value={formatTime(stats.executedTime)} type="executed" />
              {stats.creditedTime > 0 && (
                <StatChip label="Credited" value={formatTime(stats.creditedTime)} type="credited" />
              )}
              {stats.extendedTime > 0 && (
                <StatChip label="Extended" value={formatTime(stats.extendedTime)} type="extended" showPlus />
              )}
            </div>
            <SegmentedProgressBar
              planned={stats.plannedTime}
              executed={stats.executedTime}
              credited={stats.creditedTime}
              extended={stats.extendedTime}
            />
          </div>

          {/* Booking Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-100/50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-8" />
            <div className="min-w-[100px]">Date</div>
            <div>Status</div>
            <div className="min-w-[70px]">Time</div>
            <div className="flex-1" />
            <div className="w-6 text-center">Grade</div>
            <div>Approval</div>
            <div className="w-32">Remarks</div>
            <div className="w-16">Actions</div>
          </div>

          {/* Booking Rows */}
          {event.bookings.map((booking, idx) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              isLast={idx === event.bookings.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION COMPONENT
// ============================================================================

const TrainingSection = ({ section, expandedEvents, onToggleEvent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const events = section.events || [];
    let totalPlanned = 0;
    let totalExecuted = 0;
    let totalCredited = section.creditedTime || 0; // Section-level credit
    let totalExtended = 0;
    let completedEvents = 0;

    events.forEach(event => {
      const bookings = event.bookings || [];
      const plannedTime = event.plannedTime || 120;
      const creditedTime = event.creditedTime || 0;
      const passedBookings = bookings.filter(b => b.grade >= 4).length;
      const executedTime = bookings.reduce((sum, b) => sum + (b.executedTime || 0), 0);
      const requiredTime = Math.max(0, plannedTime - creditedTime);

      totalPlanned += plannedTime;
      totalExecuted += executedTime;
      totalCredited += creditedTime;

      if (passedBookings > 0) {
        completedEvents++;
        totalExtended += Math.max(0, executedTime - requiredTime);
      }
    });

    const totalTime = totalExecuted + totalCredited;

    return {
      totalEvents: events.length,
      completedEvents,
      totalPlanned,
      totalExecuted,
      totalCredited,
      totalExtended,
      totalTime,
    };
  }, [section]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
      >
        {/* Top row: Title and basic info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronDownIcon isOpen={isExpanded} className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">{section.name}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {stats.completedEvents}/{stats.totalEvents} events
            </span>
          </div>

          {/* Completion percentage */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${
              stats.completedEvents === stats.totalEvents ? 'text-emerald-600' : 'text-blue-600'
            }`}>
              {stats.totalEvents > 0 ? Math.round((stats.completedEvents / stats.totalEvents) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Bottom row: Time stats and progress bar */}
        <div className="flex items-center gap-4 pl-8">
          {/* Progress Bar */}
          <div className="flex-1 max-w-md">
            <SegmentedProgressBar
              planned={stats.totalPlanned}
              executed={stats.totalExecuted}
              credited={stats.totalCredited}
              extended={stats.totalExtended}
              compact
            />
          </div>

          {/* Time Stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-gray-500">Plan:</span>
              <span className="font-mono font-semibold text-slate-700">{formatTime(stats.totalPlanned)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-gray-500">Exec:</span>
              <span className="font-mono font-semibold text-blue-600">{formatTime(stats.totalExecuted)}</span>
            </div>
            {stats.totalCredited > 0 && (
              <div className="flex items-center gap-1.5">
                <CreditIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-gray-500">Cred:</span>
                <span className="font-mono font-semibold text-emerald-600">{formatTime(stats.totalCredited)}</span>
              </div>
            )}
            {stats.totalExtended > 0 && (
              <div className="flex items-center gap-1.5">
                <PlusCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-gray-500">Ext:</span>
                <span className="font-mono font-semibold text-amber-600">+{formatTime(stats.totalExtended)}</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Section Content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 space-y-2 border-t border-gray-100">
          {/* Legend */}
          <div className="flex items-center gap-4 px-2 py-2 text-xs text-gray-500 border-b border-gray-100 mb-3">
            <span className="font-medium text-gray-700">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${STAT_COLORS.executed.bar}`} />
              <span>Executed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${STAT_COLORS.credited.bar}`} />
              <span>Credited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${STAT_COLORS.extended.bar}`} />
              <span>Extended</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
              <span>Planned (target)</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-5" />
            <div className="flex-1">Training Event</div>
            <div className="w-[72px] text-center">Planned</div>
            <div className="w-[72px] text-center">Executed</div>
            <div className="w-[72px] text-center">Credited</div>
            <div className="w-[72px] text-center">Extended</div>
            <div className="w-8 text-center">Grade</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-[50px] text-center">Bookings</div>
          </div>

          {/* Event Rows */}
          {section.events.map(event => (
            <GroupedEventRow
              key={event.id}
              event={event}
              isExpanded={expandedEvents.has(event.id)}
              onToggle={() => onToggleEvent(event.id)}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TrainingFootprintView = ({
  studentName = "Dalda Malda",
  programCode = "TC 1",
}) => {
  const [objectives] = useState(INITIAL_OBJECTIVES);
  const [sections] = useState(INITIAL_SECTIONS);
  const [isObjectivesExpanded, setIsObjectivesExpanded] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

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

  // Calculate overall stats
  const overallStats = useMemo(() => {
    let totalPlanned = 0;
    let totalExecuted = 0;
    let totalCredited = 0;
    let totalExtended = 0;
    let totalEvents = 0;
    let completedEvents = 0;

    sections.forEach(section => {
      totalCredited += section.creditedTime || 0;

      section.events.forEach(event => {
        const bookings = event.bookings || [];
        const plannedTime = event.plannedTime || 120;
        const creditedTime = event.creditedTime || 0;
        const passedBookings = bookings.filter(b => b.grade >= 4).length;
        const executedTime = bookings.reduce((sum, b) => sum + (b.executedTime || 0), 0);
        const requiredTime = Math.max(0, plannedTime - creditedTime);

        totalEvents++;
        totalPlanned += plannedTime;
        totalExecuted += executedTime;
        totalCredited += creditedTime;

        if (passedBookings > 0) {
          completedEvents++;
          totalExtended += Math.max(0, executedTime - requiredTime);
        }
      });
    });

    const totalTime = totalExecuted + totalCredited;
    const completionPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    return {
      totalPlanned,
      totalExecuted,
      totalCredited,
      totalExtended,
      totalTime,
      totalEvents,
      completedEvents,
      completionPercent,
    };
  }, [sections]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Training Report</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {programCode}
                </span>
                <span className="text-sm text-gray-500">{studentName}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Issue Document
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Add Grading
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6">
            {['Footprint', 'TI Progress', 'Competency', 'Deferred/Repeated Items', 'Documents', 'Comments', 'Syllabus', 'Class', 'Instructors'].map((tab, idx) => (
              <button
                key={tab}
                className={`
                  py-3 text-sm font-medium border-b-2 transition-colors
                  ${idx === 0
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Objectives Overview */}
        <ObjectivesBar
          objectives={objectives}
          isExpanded={isObjectivesExpanded}
          onToggle={() => setIsObjectivesExpanded(!isObjectivesExpanded)}
        />

        {/* Overall Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left: Event Progress */}
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Training Progress</div>
                <div className="text-2xl font-bold text-blue-900">
                  {overallStats.completedEvents}/{overallStats.totalEvents} Events
                </div>
              </div>
              <div className="h-12 w-px bg-blue-200 hidden sm:block" />
            </div>

            {/* Center: Time Stats */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <StatChip label="Planned" value={formatTime(overallStats.totalPlanned)} type="planned" />
                <StatChip label="Executed" value={formatTime(overallStats.totalExecuted)} type="executed" />
                <StatChip label="Credited" value={formatTime(overallStats.totalCredited)} type="credited" />
                {overallStats.totalExtended > 0 && (
                  <StatChip label="Extended" value={formatTime(overallStats.totalExtended)} type="extended" showPlus />
                )}
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-medium text-purple-600 uppercase tracking-wide">Total</span>
                  <span className="font-mono font-semibold text-purple-600 text-sm">
                    {formatTime(overallStats.totalTime)}
                  </span>
                </div>
              </div>

              {/* Progress Bar with Legend */}
              <SegmentedProgressBar
                planned={overallStats.totalPlanned}
                executed={overallStats.totalExecuted}
                credited={overallStats.totalCredited}
                extended={overallStats.totalExtended}
                showLegend
              />
            </div>

            {/* Right: Completion Circle */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-blue-200">
              <div className="text-right">
                <div className="text-xs text-gray-500">Completion</div>
                <div className="text-xl font-bold text-blue-600">
                  {overallStats.completionPercent}%
                </div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallStats.completionPercent / 100) * 176} 176`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Training Sections */}
        {sections.map(section => (
          <TrainingSection
            key={section.id}
            section={section}
            expandedEvents={expandedEvents}
            onToggleEvent={toggleEventExpand}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingFootprintView;
