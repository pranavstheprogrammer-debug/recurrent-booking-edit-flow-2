import React, { useState, useMemo, useCallback } from 'react';

/**
 * Training Footprint View V2 - Objective-Focused Design
 *
 * Key Changes from V1:
 * - Color scheme: Blue gradient (Executed -> Credited -> Planned), Green when target reached
 * - Merged Objectives + Overview into single expandable section
 * - Training Events: Credited shown as icon/gray, "Repeated" label instead of "2x"
 * - No booking status on Training Events
 * - Focus on objective metrics (Flight Time, Solo Time) with targets
 * - Aligned table columns across sections
 */

// ============================================================================
// DATA CONFIGURATION
// ============================================================================

const OBJECTIVE_TYPES = [
  { key: 'flightTime', label: 'Flight Time', shortLabel: 'Flight', color: 'blue', icon: '✈️' },
  { key: 'soloTime', label: 'Solo Time', shortLabel: 'Solo', color: 'rose', icon: '🎯' },
  { key: 'dualTime', label: 'Dual Time', shortLabel: 'Dual', color: 'emerald', icon: '👥' },
  { key: 'spicTime', label: 'SPIC Time', shortLabel: 'SPIC', color: 'purple', icon: '🎖️' },
  { key: 'vfrDual', label: 'VFR Dual', shortLabel: 'VFR-D', color: 'cyan', icon: '☀️' },
  { key: 'vfrSolo', label: 'VFR Solo', shortLabel: 'VFR-S', color: 'teal', icon: '🌤️' },
  { key: 'vfrSim', label: 'VFR SIM', shortLabel: 'VFR-Sim', color: 'indigo', icon: '🖥️' },
  { key: 'ifrDual', label: 'IFR Dual', shortLabel: 'IFR-D', color: 'amber', icon: '🌙' },
];

// Sample data - objectives with planned, executed, credited, extended, total tracking
const INITIAL_OBJECTIVES = {
  flightTime: { planned: 1800, executed: 240, credited: 60, extended: 0, required: 1800, unit: 'h' },
  dualTime: { planned: 1800, executed: 200, credited: 40, extended: 0, required: 1800, unit: 'h' },
  soloTime: { planned: 60, executed: 0, credited: 0, extended: 0, required: 60, unit: 'h' },
  spicTime: { planned: 2400, executed: 120, credited: 0, extended: 30, required: 2400, unit: 'h' },
  vfrDual: { planned: 2400, executed: 180, credited: 60, extended: 0, required: 2400, unit: 'h' },
  vfrSolo: { planned: 60, executed: 0, credited: 0, extended: 0, required: 60, unit: 'h' },
  vfrSim: { planned: 1800, executed: 90, credited: 0, extended: 0, required: 1800, unit: 'h' },
  ifrDual: { planned: 1800, executed: 60, credited: 30, extended: 15, required: 1800, unit: 'h' },
};

// Training events with bookings
const INITIAL_SECTIONS = [
  {
    id: 'vfr-basic',
    name: 'VFR Basic Training',
    creditedTime: 30, // Only VCON02 has 30 min credited
    objectives: {
      // Total: VCON01 (115) + VCON02 (85) + VCON03 (118+110=228) = 428 executed
      // Credited: Only VCON02 has 30 credited
      flightTime: { target: 360, executed: 428, credited: 30 },
      soloTime: { target: 0, executed: 0, credited: 0 },
    },
    events: [
      {
        id: 'vcon01',
        eventCode: 'ATPA_6_VCON01',
        name: 'VCON 01 - Basic Visual Circuits',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 115, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b1', date: '28/01/2026', status: 'Executed', executedTime: 115, grade: 5, soloTime: null, approvalStatus: 'Approved', remarks: 'Good execution.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon02',
        eventCode: 'ATPA_6_VCON02',
        name: 'VCON 02 - Advanced Circuits',
        plannedTime: 120,
        creditedTime: 30,
        objectives: {
          flightTime: { target: 120, executed: 85, credited: 30 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b2', date: '28/01/2026', status: 'Executed', executedTime: 85, grade: 5, soloTime: null, approvalStatus: 'Approved', remarks: 'Credit applied for prior experience.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon03',
        eventCode: 'ATPA_6_VCON03',
        name: 'VCON 03 - Circuit Emergencies',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 228, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b3', date: '27/01/2026', status: 'Executed', executedTime: 118, grade: 1, soloTime: null, approvalStatus: 'Approved', remarks: 'Needs improvement', instructor: 'F-PSI' },
          { id: 'b4', date: '28/01/2026', status: 'Executed', executedTime: 110, grade: 5, soloTime: null, approvalStatus: 'Student Review', remarks: 'Passed on retry', instructor: 'F-PSI' },
        ]
      },
    ]
  },
  {
    id: 'vfr-advanced',
    name: 'VFR Advanced Training',
    creditedTime: 0,
    objectives: {
      flightTime: { target: 330, executed: 536, credited: 0 },
      soloTime: { target: 30, executed: 0, credited: 0 },
    },
    events: [
      {
        id: 'vcon04',
        eventCode: 'ATPA_6_VCON04',
        name: 'VCON 04 - Cross-wind Operations',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 343, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b5', date: '25/01/2026', status: 'Executed', executedTime: 115, grade: 1, soloTime: null, approvalStatus: 'Approved', remarks: 'Failed - needs practice', instructor: 'F-PSI' },
          { id: 'b6', date: '26/01/2026', status: 'Executed', executedTime: 110, grade: 1, soloTime: null, approvalStatus: 'Approved', remarks: 'Still struggling', instructor: 'F-PSI' },
          { id: 'b7', date: '28/01/2026', status: 'Executed', executedTime: 118, grade: 5, soloTime: null, approvalStatus: 'Student Review', remarks: 'Finally passed!', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon05',
        eventCode: 'ATPA_6_VCON05',
        name: 'VCON 05 - Night Circuits',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 105, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b8', date: '28/01/2026', status: 'Executed', executedTime: 105, grade: 4, soloTime: null, approvalStatus: 'Approved', remarks: 'Satisfactory performance.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon06',
        eventCode: 'ATPA_6_VCON06',
        name: 'VCON 06 - Formation Flying Basics',
        plannedTime: 90,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 90, executed: 88, credited: 0 },
          soloTime: { target: 30, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b9', date: '29/01/2026', status: 'Executed', executedTime: 88, grade: 5, soloTime: null, approvalStatus: 'Approved', remarks: 'Excellent spacing maintained.', instructor: 'J-LIN' },
        ]
      },
    ]
  },
  {
    id: 'ifr-training',
    name: 'IFR Instrument Training',
    creditedTime: 30, // Only IFR01 has 30 min credited
    objectives: {
      // Total: IFR01 (58) + IFR02 (110) + IFR03 (115) + IFR04 (0) = 283 executed
      // Credited: Only IFR01 has 30 credited
      flightTime: { target: 420, executed: 283, credited: 30 },
      soloTime: { target: 0, executed: 0, credited: 0 },
    },
    events: [
      {
        id: 'ifr01',
        eventCode: 'ATPA_7_IFR01',
        name: 'IFR 01 - Basic Instrument Scan',
        plannedTime: 90,
        creditedTime: 30,
        objectives: {
          flightTime: { target: 90, executed: 58, credited: 30 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b10', date: '20/01/2026', status: 'Executed', executedTime: 58, grade: 5, soloTime: null, approvalStatus: 'Approved', remarks: 'Credit applied. Good scan technique.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr02',
        eventCode: 'ATPA_7_IFR02',
        name: 'IFR 02 - Holding Patterns',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 110, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b11', date: '21/01/2026', status: 'Executed', executedTime: 110, grade: 4, soloTime: null, approvalStatus: 'Approved', remarks: 'Minor timing corrections needed.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr03',
        eventCode: 'ATPA_7_IFR03',
        name: 'IFR 03 - ILS Approaches',
        plannedTime: 120,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 120, executed: 115, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b12', date: '22/01/2026', status: 'Executed', executedTime: 115, grade: 3, soloTime: null, approvalStatus: 'Student Review', remarks: 'Glideslope tracking needs work.', instructor: 'M-KAR' },
        ]
      },
      {
        id: 'ifr04',
        eventCode: 'ATPA_7_IFR04',
        name: 'IFR 04 - NDB Approaches',
        plannedTime: 90,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 90, executed: 0, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: []
      },
    ]
  },
  {
    id: 'sim-training',
    name: 'Simulator Training',
    creditedTime: 0,
    objectives: {
      flightTime: { target: 840, executed: 345, credited: 0 },
      soloTime: { target: 0, executed: 0, credited: 0 },
    },
    events: [
      {
        id: 'sim01',
        eventCode: 'ATPA_8_SIM01',
        name: 'SIM 01 - Emergency Procedures',
        plannedTime: 180,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 180, executed: 170, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b13', date: '15/01/2026', status: 'Executed', executedTime: 170, grade: 5, soloTime: null, approvalStatus: 'Approved', remarks: 'Excellent emergency handling.', instructor: 'R-DAS' },
        ]
      },
      {
        id: 'sim02',
        eventCode: 'ATPA_8_SIM02',
        name: 'SIM 02 - Engine Failure Scenarios',
        plannedTime: 180,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 180, executed: 175, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: [
          { id: 'b14', date: '16/01/2026', status: 'Executed', executedTime: 175, grade: 4, soloTime: null, approvalStatus: 'Approved', remarks: 'Good decision making.', instructor: 'R-DAS' },
        ]
      },
      {
        id: 'sim03',
        eventCode: 'ATPA_8_SIM03',
        name: 'SIM 03 - Multi-Engine Operations',
        plannedTime: 240,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 240, executed: 0, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: []
      },
      {
        id: 'sim04',
        eventCode: 'ATPA_8_SIM04',
        name: 'SIM 04 - LOFT Scenario',
        plannedTime: 240,
        creditedTime: 0,
        objectives: {
          flightTime: { target: 240, executed: 0, credited: 0 },
          soloTime: { target: 0, executed: 0, credited: 0 },
        },
        bookings: []
      },
    ]
  },
];

// ============================================================================
// COLOR SYSTEM V2 - Blue gradient for progress, Green when complete
// ============================================================================

// Progress states: Executed (normal blue) -> Credited (lighter) -> Planned (lightest)
// When target reached: same progression but in greens
const getProgressColors = (isTargetReached) => {
  if (isTargetReached) {
    return {
      executed: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        bar: 'bg-emerald-500',
        light: 'bg-emerald-50',
      },
      credited: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        bar: 'bg-emerald-300',
        light: 'bg-emerald-25',
      },
      planned: {
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-500',
        border: 'border-emerald-100',
        bar: 'bg-emerald-200',
        light: 'bg-emerald-25/50',
      },
      extended: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        border: 'border-amber-200',
        bar: 'bg-amber-400',
        light: 'bg-amber-50',
      },
    };
  }
  return {
    executed: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      bar: 'bg-blue-500',
      light: 'bg-blue-50',
    },
    credited: {
      bg: 'bg-blue-50',
      text: 'text-blue-500',
      border: 'border-blue-100',
      bar: 'bg-blue-300',
      light: 'bg-blue-25',
    },
    planned: {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-200',
      bar: 'bg-slate-200',
      light: 'bg-slate-50',
    },
    extended: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
      bar: 'bg-amber-400',
      light: 'bg-amber-50',
    },
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '00:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatTimeCompact = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const getGradeColor = (grade) => {
  if (grade >= 4) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (grade >= 2) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
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

const CreditBadgeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const TargetIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
  </svg>
);

const PlaneIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// ============================================================================
// SEGMENTED PROGRESS BAR V2 - Blue gradient, green when complete
// ============================================================================

const SegmentedProgressBarV2 = ({
  planned,
  executed,
  credited,
  extended = 0,
  showLegend = false,
  compact = false,
  className = ""
}) => {
  const total = executed + credited + extended;
  const isTargetReached = total >= planned && planned > 0;
  const colors = getProgressColors(isTargetReached);

  const maxValue = Math.max(planned, total);
  const executedPercent = maxValue > 0 ? (executed / maxValue) * 100 : 0;
  const creditedPercent = maxValue > 0 ? (credited / maxValue) * 100 : 0;
  const extendedPercent = maxValue > 0 ? (extended / maxValue) * 100 : 0;
  const plannedPercent = maxValue > 0 ? (planned / maxValue) * 100 : 0;
  const completionPercent = planned > 0 ? Math.round((total / planned) * 100) : 0;

  // Build comprehensive tooltip
  const statusText = isTargetReached
    ? `✓ TARGET REACHED (${completionPercent}%)`
    : `IN PROGRESS (${completionPercent}% of target)`;

  const colorExplanation = isTargetReached
    ? 'Green = Target met or exceeded'
    : 'Blue = Target not yet reached';

  const breakdownLines = [
    `Executed: ${formatTime(executed)}`,
    credited > 0 ? `Credited: ${formatTime(credited)}` : null,
    extended > 0 ? `Extended: +${formatTime(extended)}` : null,
    `Target: ${formatTime(planned)}`,
  ].filter(Boolean).join('\n');

  const fullTooltip = `${statusText}\n${colorExplanation}\n\n${breakdownLines}`;

  return (
    <div className={`${className}`}>
      <div
        className={`relative w-full ${compact ? 'h-2' : 'h-3'} bg-slate-100 rounded-full overflow-hidden cursor-help`}
        title={fullTooltip}
      >
        {/* Planned indicator line */}
        {total < planned && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
            style={{ left: `${plannedPercent}%` }}
          />
        )}

        {/* Stacked segments */}
        <div className="absolute inset-0 flex">
          {executed > 0 && (
            <div
              className={`${colors.executed.bar} h-full transition-all duration-300`}
              style={{ width: `${executedPercent}%` }}
            />
          )}
          {credited > 0 && (
            <div
              className={`${colors.credited.bar} h-full transition-all duration-300`}
              style={{ width: `${creditedPercent}%` }}
            />
          )}
          {extended > 0 && (
            <div
              className={`${colors.extended.bar} h-full transition-all duration-300`}
              style={{ width: `${extendedPercent}%` }}
            />
          )}
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${colors.executed.bar}`} />
            <span className="text-gray-600">Executed</span>
            <span className={`font-mono font-medium ${colors.executed.text}`}>{formatTime(executed)}</span>
          </div>
          {credited > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${colors.credited.bar}`} />
              <span className="text-gray-600">Credited</span>
              <span className={`font-mono font-medium ${colors.credited.text}`}>{formatTime(credited)}</span>
            </div>
          )}
          {extended > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${colors.extended.bar}`} />
              <span className="text-gray-600">Extended</span>
              <span className={`font-mono font-medium ${colors.extended.text}`}>+{formatTime(extended)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-gray-500">vs Target</span>
            <span className={`font-semibold ${
              isTargetReached ? 'text-emerald-600' :
              completionPercent >= 50 ? 'text-blue-600' : 'text-slate-600'
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
// OBJECTIVE METRIC CHIP - Shows objective progress with target
// ============================================================================

const ObjectiveMetricChip = ({
  label,
  shortLabel,
  target,
  executed,
  credited = 0,
  compact = false,
  showTarget = true,
  hideLabel = false
}) => {
  const total = executed + credited;
  const isComplete = total >= target && target > 0;
  const percent = target > 0 ? Math.round((total / target) * 100) : 0;
  const colors = getProgressColors(isComplete);

  if (target === 0) return null;

  return (
    <div className={`
      flex items-center gap-2 px-2 py-1 rounded-md border
      ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}
    `}>
      {!hideLabel && (
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${isComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
            {compact ? shortLabel : label}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className={`font-mono text-xs font-semibold ${isComplete ? 'text-emerald-700' : 'text-slate-700'}`}>
          {formatTime(total)}
        </span>
        {showTarget && (
          <>
            <span className="text-slate-400">/</span>
            <span className="font-mono text-xs text-slate-500">{formatTime(target)}</span>
          </>
        )}
      </div>
      {isComplete && (
        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
      )}
      {!isComplete && (
        <span className={`text-[10px] font-medium ${colors.executed.text}`}>
          {percent}%
        </span>
      )}
    </div>
  );
};

// ============================================================================
// MERGED OBJECTIVES + OVERVIEW SECTION
// ============================================================================

const ObjectivesOverviewSection = ({ objectives, overallStats, isExpanded, onToggle }) => {
  const stats = useMemo(() => {
    return OBJECTIVE_TYPES.map(obj => {
      const data = objectives[obj.key] || { planned: 0, executed: 0, credited: 0, extended: 0, required: 0 };
      const total = (data.executed || 0) + (data.credited || 0) + (data.extended || 0);
      const progress = data.required > 0 ? (total / data.required) * 100 : 0;
      const isComplete = total >= data.required && data.required > 0;
      return {
        ...obj,
        planned: data.planned || data.required || 0,
        executed: data.executed || 0,
        credited: data.credited || 0,
        extended: data.extended || 0,
        total,
        required: data.required || 0,
        progress: Math.min(progress, 100),
        isComplete,
      };
    }).filter(obj => obj.required > 0);
  }, [objectives]);

  const completedCount = stats.filter(s => s.isComplete).length;
  const overallProgress = useMemo(() => {
    const totalRequired = stats.reduce((sum, s) => sum + s.required, 0);
    const totalAchieved = stats.reduce((sum, s) => sum + s.total, 0);
    return totalRequired > 0 ? Math.round((totalAchieved / totalRequired) * 100) : 0;
  }, [stats]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Bar - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ChevronDownIcon isOpen={isExpanded} className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">Training Overview</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {completedCount}/{stats.length} objectives
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {overallStats.completedEvents}/{overallStats.totalEvents} events
            </span>
          </div>
        </div>

        {/* Mini Progress Preview */}
        {!isExpanded && (
          <div className="hidden md:flex items-center gap-4">
            {stats.slice(0, 3).map(obj => (
              <ObjectiveMetricChip
                key={obj.key}
                label={obj.label}
                shortLabel={obj.shortLabel}
                target={obj.required}
                executed={obj.executed}
                credited={obj.credited}
                compact
                showTarget={false}
              />
            ))}
            {stats.length > 3 && (
              <span className="text-xs text-gray-400">+{stats.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  overallProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${
              overallProgress >= 100 ? 'text-emerald-600' : 'text-gray-700'
            }`}>{overallProgress}%</span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="border-t border-gray-100">
          {/* Overall Time Summary */}
          <div className="px-4 py-4 bg-gradient-to-r from-blue-50/50 to-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Left: Event Progress */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Progress</div>
                  <div className="text-xl font-bold text-blue-900">
                    {overallStats.completedEvents}/{overallStats.totalEvents} Events
                  </div>
                </div>
                <div className="h-10 w-px bg-blue-200 hidden sm:block" />
              </div>

              {/* Center: Progress Bar */}
              <div className="flex-1">
                <SegmentedProgressBarV2
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
                  <div className="text-xs text-gray-500">Total Time</div>
                  <div className="text-lg font-bold text-blue-600 font-mono">
                    {formatTime(overallStats.totalExecuted + overallStats.totalCredited)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Objectives Grid */}
          <div className="px-4 py-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Objective Targets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map(obj => {
                const colors = getProgressColors(obj.isComplete);
                return (
                  <div
                    key={obj.key}
                    className={`
                      relative p-3 rounded-lg border transition-all
                      ${obj.isComplete
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-gray-200'}
                    `}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{obj.icon}</span>
                        <span className="text-xs font-semibold text-gray-700">{obj.label}</span>
                      </div>
                      {obj.isComplete && (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <SegmentedProgressBarV2
                        planned={obj.required}
                        executed={obj.executed}
                        credited={obj.credited}
                        extended={obj.extended}
                        compact
                      />
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold ${obj.isComplete ? 'text-emerald-700' : 'text-blue-700'}`}>
                          {formatTime(obj.total)}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="font-mono text-sm text-gray-500">{formatTime(obj.required)}</span>
                      </div>
                      <span className={`text-xs font-semibold ${
                        obj.isComplete ? 'text-emerald-600' : 'text-gray-500'
                      }`}>
                        {Math.round(obj.progress)}%
                      </span>
                    </div>

                    {/* Breakdown - only show if has credited */}
                    {obj.credited > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-[10px]">
                        <span className={`${colors.executed.text}`}>Exec: {formatTime(obj.executed)}</span>
                        <span className={`${colors.credited.text}`}>+ Cred: {formatTime(obj.credited)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BOOKING ROW V2 - Simplified, no status column
// ============================================================================

const BookingRowV2 = ({ booking, isLast }) => {
  return (
    <div className={`
      grid grid-cols-[80px_80px_1fr_50px_80px] gap-4 items-center px-4 py-2.5 bg-gray-50/50
      ${!isLast ? 'border-b border-gray-100' : ''}
    `}>
      {/* Date */}
      <div className="flex items-center gap-1.5">
        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-600 font-mono">{booking.date}</span>
      </div>

      {/* Executed Time */}
      <div className="flex items-center gap-1">
        <ClockIcon className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-mono text-blue-600 font-medium">
          {formatTime(booking.executedTime || 0)}
        </span>
      </div>

      {/* Remarks */}
      <div className="text-xs text-gray-500 truncate" title={booking.remarks}>
        {booking.remarks || '—'}
      </div>

      {/* Grade */}
      {booking.grade !== null ? (
        <span className={`
          w-7 h-7 flex items-center justify-center text-xs font-bold rounded border mx-auto
          ${getGradeColor(booking.grade)}
        `}>
          {booking.grade}
        </span>
      ) : (
        <span className="text-gray-300 text-center">—</span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 justify-end">
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
// TRAINING EVENT ROW V2 - Focus on objectives, show credited as gray/icon
// ============================================================================

const TrainingEventRowV2 = ({ event, isExpanded, onToggle }) => {
  const stats = useMemo(() => {
    const bookings = event.bookings || [];
    const totalBookings = bookings.length;
    const passedBookings = bookings.filter(b => b.grade >= 4).length;
    const latestGrade = bookings.length > 0 ? bookings[bookings.length - 1].grade : null;

    const plannedTime = event.plannedTime || 120;
    const creditedTime = event.creditedTime || 0;
    const executedTime = bookings.reduce((sum, b) => sum + (b.executedTime || 0), 0);
    const total = executedTime + creditedTime;
    const isTargetReached = total >= plannedTime;

    // Get objective data
    const objectives = event.objectives || {};
    const flightTime = objectives.flightTime || { target: 0, executed: 0, credited: 0 };
    const soloTime = objectives.soloTime || { target: 0, executed: 0, credited: 0 };

    return {
      totalBookings,
      passedBookings,
      latestGrade,
      plannedTime,
      executedTime,
      creditedTime,
      total,
      isTargetReached,
      hasRepeats: totalBookings > 1,
      isCompleted: passedBookings > 0,
      flightTime,
      soloTime,
    };
  }, [event]);

  const colors = getProgressColors(stats.isTargetReached);

  return (
    <div className={`
      border rounded-lg transition-all duration-200 overflow-hidden
      ${stats.isCompleted && stats.isTargetReached
        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/30 to-white'
        : stats.isCompleted
          ? 'border-blue-200 bg-gradient-to-r from-blue-50/30 to-white'
          : 'border-gray-200 bg-white hover:border-gray-300'}
    `}>
      {/* Main Row - Aligned columns */}
      <div
        className="grid grid-cols-[24px_1fr_140px_140px_60px_60px] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Expand Button */}
        <button className="p-0.5 text-gray-400 hover:text-gray-600">
          <ChevronRightIcon isOpen={isExpanded} />
        </button>

        {/* Event Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline truncate">
              {event.eventCode}
            </a>
            {stats.hasRepeats && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                <RepeatIcon className="w-3 h-3" />
                Repeated
              </span>
            )}
            {stats.creditedTime > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-medium rounded" title={`${formatTime(stats.creditedTime)} credited`}>
                <CreditBadgeIcon className="w-3 h-3" />
                <span className="opacity-75">CR</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{event.name}</p>
        </div>

        {/* Flight Time Objective */}
        <ObjectiveMetricChip
          label="Flight"
          shortLabel="Flight"
          target={stats.flightTime.target}
          executed={stats.flightTime.executed}
          credited={stats.flightTime.credited}
          compact
          hideLabel
        />

        {/* Solo Time Objective (only show if target > 0) */}
        {stats.soloTime.target > 0 ? (
          <ObjectiveMetricChip
            label="Solo"
            shortLabel="Solo"
            target={stats.soloTime.target}
            executed={stats.soloTime.executed}
            credited={stats.soloTime.credited}
            compact
            hideLabel
          />
        ) : (
          <div className="text-center text-gray-300 text-xs">—</div>
        )}

        {/* Latest Grade */}
        {stats.latestGrade !== null ? (
          <span className={`
            w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg border mx-auto
            ${getGradeColor(stats.latestGrade)}
          `}>
            {stats.latestGrade}
          </span>
        ) : (
          <span className="text-gray-300 text-center">—</span>
        )}

        {/* Booking Count */}
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-700">
            {stats.totalBookings}
          </div>
          <div className="text-[9px] text-gray-400">sessions</div>
        </div>
      </div>

      {/* Expanded Bookings */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="border-t border-gray-100">
          {/* Booking Header - Aligned columns */}
          <div className="grid grid-cols-[80px_80px_1fr_50px_80px] gap-4 px-4 py-2 bg-gray-100/50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div>Date</div>
            <div>Time</div>
            <div>Remarks</div>
            <div className="text-center">Grade</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Booking Rows */}
          {event.bookings.length > 0 ? (
            event.bookings.map((booking, idx) => (
              <BookingRowV2
                key={booking.id}
                booking={booking}
                isLast={idx === event.bookings.length - 1}
              />
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No sessions scheduled yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TRAINING SECTION V2 - With objective targets at section level
// ============================================================================

const TrainingSectionV2 = ({ section, expandedEvents, onToggleEvent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const events = section.events || [];
    let totalPlanned = 0;
    let totalExecuted = 0;
    let totalCredited = section.creditedTime || 0;
    let completedEvents = 0;

    events.forEach(event => {
      const bookings = event.bookings || [];
      const plannedTime = event.plannedTime || 120;
      const creditedTime = event.creditedTime || 0;
      const passedBookings = bookings.filter(b => b.grade >= 4).length;
      const executedTime = bookings.reduce((sum, b) => sum + (b.executedTime || 0), 0);

      totalPlanned += plannedTime;
      totalExecuted += executedTime;
      totalCredited += creditedTime;

      if (passedBookings > 0) {
        completedEvents++;
      }
    });

    const total = totalExecuted + totalCredited;
    const isTargetReached = total >= totalPlanned;

    // Get section-level objectives
    const objectives = section.objectives || {};
    const flightTime = objectives.flightTime || { target: 0, executed: 0, credited: 0 };
    const soloTime = objectives.soloTime || { target: 0, executed: 0, credited: 0 };

    return {
      totalEvents: events.length,
      completedEvents,
      totalPlanned,
      totalExecuted,
      totalCredited,
      total,
      isTargetReached,
      flightTime,
      soloTime,
    };
  }, [section]);

  const colors = getProgressColors(stats.isTargetReached);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
      >
        {/* Top row: Title and metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronDownIcon isOpen={isExpanded} className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">{section.name}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {stats.completedEvents}/{stats.totalEvents} events
            </span>
            {stats.totalCredited > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-medium rounded" title={`${formatTime(stats.totalCredited)} credited`}>
                <CreditBadgeIcon className="w-3 h-3" />
                <span className="opacity-75">CR</span>
              </span>
            )}
          </div>

          {/* Objective Chips */}
          <div className="hidden md:flex items-center gap-2">
            <ObjectiveMetricChip
              label="Flight Time"
              shortLabel="Flight"
              target={stats.flightTime.target}
              executed={stats.flightTime.executed}
              credited={stats.flightTime.credited}
              compact
            />
            {stats.soloTime.target > 0 && (
              <ObjectiveMetricChip
                label="Solo Time"
                shortLabel="Solo"
                target={stats.soloTime.target}
                executed={stats.soloTime.executed}
                credited={stats.soloTime.credited}
                compact
              />
            )}
          </div>
        </div>

        {/* Bottom row: Progress bar */}
        <div className="flex items-center gap-4 pl-8">
          <div className="flex-1 max-w-xl">
            <SegmentedProgressBarV2
              planned={stats.totalPlanned}
              executed={stats.totalExecuted}
              credited={stats.totalCredited}
              compact
            />
          </div>
          <span className={`text-sm font-bold ${
            stats.isTargetReached ? 'text-emerald-600' : 'text-blue-600'
          }`}>
            {stats.totalPlanned > 0 ? Math.round((stats.total / stats.totalPlanned) * 100) : 0}%
          </span>
        </div>
      </button>

      {/* Section Content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 space-y-2 border-t border-gray-100">
          {/* Table Header - Aligned columns */}
          <div className="hidden lg:grid grid-cols-[24px_1fr_140px_140px_60px_60px] gap-3 px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-2">
            <div></div>
            <div>Training Event</div>
            <div className="text-center">Flight Time</div>
            <div className="text-center">Solo Time</div>
            <div className="text-center">Grade</div>
            <div className="text-center">Sessions</div>
          </div>

          {/* Event Rows */}
          {section.events.map(event => (
            <TrainingEventRowV2
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
// MAIN COMPONENT V2
// ============================================================================

const TrainingFootprintViewV2 = ({
  studentName = "Dalda Malda",
  programCode = "TC 1",
}) => {
  const [objectives] = useState(INITIAL_OBJECTIVES);
  const [sections] = useState(INITIAL_SECTIONS);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);
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
        {/* Merged Objectives + Overview */}
        <ObjectivesOverviewSection
          objectives={objectives}
          overallStats={overallStats}
          isExpanded={isOverviewExpanded}
          onToggle={() => setIsOverviewExpanded(!isOverviewExpanded)}
        />

        {/* Training Sections */}
        {sections.map(section => (
          <TrainingSectionV2
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

export default TrainingFootprintViewV2;
