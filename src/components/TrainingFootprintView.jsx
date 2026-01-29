import React, { useState, useMemo, useCallback } from 'react';

/**
 * Training Footprint View - Modern UI for Training Report
 *
 * Features:
 * - Compact collapsible objectives overview with progress bars
 * - Grouped training events (repeated events consolidated)
 * - Expandable booking details for each event
 * - Section-level summaries with credited/extended time
 * - Clear indication of planned, credited, and extended time
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

// Sample data matching the screenshot
const INITIAL_OBJECTIVES = {
  flightTime: { credited: 240, required: 1800, unit: 'h' },
  dualTime: { credited: 240, required: 1800, unit: 'h' },
  soloTime: { credited: 0, required: 60, unit: 'h' },
  spicTime: { credited: 0, required: 2400, unit: 'h' },
  vfrDual: { credited: 240, required: 2400, unit: 'h' },
  vfrSolo: { credited: 0, required: 60, unit: 'h' },
  vfrSim: { credited: 0, required: 1800, unit: 'h' },
  ifrDual: { credited: 0, required: 1800, unit: 'h' },
};

// Training events with bookings - simulating the screenshot data
const INITIAL_SECTIONS = [
  {
    id: 'default',
    name: 'Default Section',
    events: [
      {
        id: 'vcon01',
        eventCode: 'ATPA_6_VCON01',
        name: 'VCON 01 - Basic Visual Circuits',
        plannedTime: 120, // 2 hours planned
        bookings: [
          { id: 'b1', date: '28/01/2026', status: 'Executed', grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'done. All good.', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon02',
        eventCode: 'ATPA_6_VCON02',
        name: 'VCON 02 - Advanced Circuits',
        plannedTime: 120,
        bookings: [
          { id: 'b2', date: '28/01/2026', status: 'Executed', grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: '', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon03',
        eventCode: 'ATPA_6_VCON03',
        name: 'VCON 03 - Circuit Emergencies',
        plannedTime: 120,
        bookings: [
          { id: 'b3', date: '28/01/2026', status: 'Executed', grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Needs improvement', instructor: 'F-PSI' },
          { id: 'b4', date: '28/01/2026', status: 'Executed', grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Passed on retry', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon04',
        eventCode: 'ATPA_6_VCON04',
        name: 'VCON 04 - Cross-wind Operations',
        plannedTime: 120,
        bookings: [
          { id: 'b5', date: '28/01/2026', status: 'Executed', grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Failed - needs practice', instructor: 'F-PSI' },
          { id: 'b6', date: '28/01/2026', status: 'Executed', grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Still struggling', instructor: 'F-PSI' },
          { id: 'b7', date: '28/01/2026', status: 'Executed', grade: 5, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: 'Finally passed!', instructor: 'F-PSI' },
        ]
      },
      {
        id: 'vcon05',
        eventCode: 'ATPA_6_VCON05',
        name: 'VCON 05 - Night Circuits',
        plannedTime: 120,
        bookings: [
          { id: 'b8', date: '28/01/2026', status: 'Executed', grade: 1, soloTime: null, vfrSolo: null, approvalStatus: 'Student Review', remarks: '', instructor: 'F-PSI' },
        ]
      },
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0 h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}.0 h`;
  return `${h}:${m.toString().padStart(2, '0')} h`;
};

const formatTimeShort = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
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

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const GradingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ============================================================================
// COMPACT OBJECTIVES BAR
// ============================================================================

const ObjectivesBar = ({ objectives, isExpanded, onToggle }) => {
  const stats = useMemo(() => {
    return OBJECTIVE_TYPES.map(obj => {
      const data = objectives[obj.key] || { credited: 0, required: 0 };
      const progress = data.required > 0 ? (data.credited / data.required) * 100 : 0;
      return {
        ...obj,
        ...data,
        progress: Math.min(progress, 100),
        isComplete: data.credited >= data.required && data.required > 0,
      };
    }).filter(obj => obj.required > 0);
  }, [objectives]);

  const overallProgress = useMemo(() => {
    const total = stats.reduce((sum, s) => sum + s.required, 0);
    const credited = stats.reduce((sum, s) => sum + s.credited, 0);
    return total > 0 ? Math.round((credited / total) * 100) : 0;
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
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(obj.progress)}`}
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
        ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">{obj.label}</span>
                  {obj.isComplete && (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-lg font-bold ${obj.isComplete ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {formatTimeShort(obj.credited)}
                  </span>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500">{formatTimeShort(obj.required)}</span>
                </div>

                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      obj.isComplete ? 'bg-emerald-500' : getProgressColor(obj.progress)
                    }`}
                    style={{ width: `${obj.progress}%` }}
                  />
                </div>

                <span className="absolute top-2 right-2 text-xs text-gray-400">
                  {Math.round(obj.progress)}%
                </span>
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
    const actualTime = totalBookings * plannedTime; // Each booking is the planned duration
    const extendedTime = Math.max(0, actualTime - plannedTime); // Time over the original plan
    const creditedTime = passedBookings > 0 ? plannedTime : 0; // Only credited if passed

    return {
      totalBookings,
      executedBookings,
      passedBookings,
      failedBookings,
      latestGrade,
      plannedTime,
      actualTime,
      extendedTime,
      creditedTime,
      hasRepeats: totalBookings > 1,
      isCompleted: passedBookings > 0,
      hasFailed: failedBookings > 0,
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
            {stats.isCompleted && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                <CheckCircleIcon className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{event.name}</p>
        </div>

        {/* Time Stats */}
        <div className="hidden md:flex items-center gap-4">
          {/* Planned Time */}
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Planned</div>
            <div className="text-sm font-semibold text-gray-700 font-mono">
              {formatTimeShort(stats.plannedTime)}
            </div>
          </div>

          {/* Credited Time */}
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Credited</div>
            <div className={`text-sm font-semibold font-mono ${
              stats.creditedTime > 0 ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {formatTimeShort(stats.creditedTime)}
            </div>
          </div>

          {/* Extended Time */}
          <div className="text-center min-w-[70px]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Extended</div>
            <div className={`text-sm font-semibold font-mono ${
              stats.extendedTime > 0 ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {stats.extendedTime > 0 ? `+${formatTimeShort(stats.extendedTime)}` : '—'}
            </div>
          </div>
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
          {stats.isCompleted ? 'Completed' : 'Student Review'}
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
        ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="border-t border-gray-100">
          {/* Mobile Time Stats */}
          <div className="md:hidden flex items-center justify-around py-2 bg-gray-50 border-b border-gray-100">
            <div className="text-center">
              <div className="text-[10px] text-gray-400">Planned</div>
              <div className="text-sm font-semibold text-gray-700">{formatTimeShort(stats.plannedTime)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400">Credited</div>
              <div className={`text-sm font-semibold ${stats.creditedTime > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {formatTimeShort(stats.creditedTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400">Extended</div>
              <div className={`text-sm font-semibold ${stats.extendedTime > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                {stats.extendedTime > 0 ? `+${formatTimeShort(stats.extendedTime)}` : '—'}
              </div>
            </div>
          </div>

          {/* Booking Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-100/50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-8" />
            <div className="min-w-[100px]">Date</div>
            <div>Status</div>
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
    let totalCredited = 0;
    let totalExtended = 0;
    let completedEvents = 0;

    events.forEach(event => {
      const bookings = event.bookings || [];
      const plannedTime = event.plannedTime || 120;
      const passedBookings = bookings.filter(b => b.grade >= 4).length;
      const actualTime = bookings.length * plannedTime;

      totalPlanned += plannedTime;
      if (passedBookings > 0) {
        totalCredited += plannedTime;
        completedEvents++;
      }
      totalExtended += Math.max(0, actualTime - plannedTime);
    });

    return {
      totalEvents: events.length,
      completedEvents,
      totalPlanned,
      totalCredited,
      totalExtended,
    };
  }, [section]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
      >
        <div className="flex items-center gap-3">
          <ChevronDownIcon isOpen={isExpanded} className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">{section.name}</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {stats.completedEvents}/{stats.totalEvents} events
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">Planned:</span>
              <span className="font-semibold text-gray-700">{formatTimeShort(stats.totalPlanned)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-500">Credited:</span>
              <span className="font-semibold text-emerald-600">{formatTimeShort(stats.totalCredited)}</span>
            </div>
            {stats.totalExtended > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-gray-500">Extended:</span>
                <span className="font-semibold text-amber-600">+{formatTimeShort(stats.totalExtended)}</span>
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
          {/* Table Header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-5" />
            <div className="flex-1">Training Event</div>
            <div className="w-[70px] text-center">Planned</div>
            <div className="w-[70px] text-center">Credited</div>
            <div className="w-[70px] text-center">Extended</div>
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
    let totalCredited = 0;
    let totalExtended = 0;
    let totalEvents = 0;
    let completedEvents = 0;

    sections.forEach(section => {
      section.events.forEach(event => {
        const bookings = event.bookings || [];
        const plannedTime = event.plannedTime || 120;
        const passedBookings = bookings.filter(b => b.grade >= 4).length;
        const actualTime = bookings.length * plannedTime;

        totalEvents++;
        totalPlanned += plannedTime;
        if (passedBookings > 0) {
          totalCredited += plannedTime;
          completedEvents++;
        }
        totalExtended += Math.max(0, actualTime - plannedTime);
      });
    });

    return { totalPlanned, totalCredited, totalExtended, totalEvents, completedEvents };
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Training Progress</div>
                <div className="text-2xl font-bold text-blue-900">
                  {overallStats.completedEvents}/{overallStats.totalEvents} Events
                </div>
              </div>
              <div className="h-12 w-px bg-blue-200" />
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Total Planned</div>
                  <div className="text-lg font-bold text-gray-700">{formatTimeShort(overallStats.totalPlanned)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-emerald-600 uppercase">Total Credited</div>
                  <div className="text-lg font-bold text-emerald-600">{formatTimeShort(overallStats.totalCredited)}</div>
                </div>
                {overallStats.totalExtended > 0 && (
                  <div className="text-center">
                    <div className="text-[10px] text-amber-600 uppercase">Extra Time (Repeats)</div>
                    <div className="text-lg font-bold text-amber-600">+{formatTimeShort(overallStats.totalExtended)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Completion</div>
                <div className="text-xl font-bold text-blue-600">
                  {Math.round((overallStats.completedEvents / overallStats.totalEvents) * 100)}%
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
                    strokeDasharray={`${(overallStats.completedEvents / overallStats.totalEvents) * 176} 176`}
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
