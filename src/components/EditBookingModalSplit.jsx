import React, { useState, useMemo, useCallback } from 'react';
import Modal from './Modal';

/**
 * Split View Edit Booking Modal
 * Uses a side-by-side layout similar to CreateBookingModalSplit.
 * Left panel: Edit form
 * Right panel: Scope selector + affected bookings preview with current booking highlighted
 *
 * Enhanced with bulk operations:
 * - Multi-select bookings for targeted updates
 * - Skip/exclude specific bookings
 * - Reschedule selected bookings
 * - Delete selected bookings
 */
export default function EditBookingModalSplit({ isOpen, onClose, onSave }) {
  const [editScope, setEditScope] = useState('single');
  const [formData, setFormData] = useState({
    type: 'training',
    startDate: '18/01/2026',
    startTime: '10:30',
    endDate: '18/01/2026',
    endTime: '11:00',
    aircraft: 'N123AB',
    instructor: 'Cypress Test',
    student: 'Demo Middle Man Mr',
    additionalInfo: '',
  });

  // Selection and bulk operations state
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [skippedBookings, setSkippedBookings] = useState(new Set());
  const [showBulkTimeEdit, setShowBulkTimeEdit] = useState(false);
  const [bulkTimeOffset, setBulkTimeOffset] = useState({ hours: 0, minutes: 0 });

  // Current booking being edited (3rd in the series)
  const currentBookingIndex = 2;
  const totalBookingsInSeries = 8;

  const bookingTypes = [
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'training', label: 'Training', icon: '✈️' },
    { id: 'ground', label: 'Ground', icon: '📚' },
    { id: 'rental', label: 'Rental', icon: '🛫' },
  ];

  const aircraftOptions = ['N123AB', 'N123AC', 'HOOBS-AFS'];

  // Generate affected bookings based on scope
  const affectedBookings = useMemo(() => {
    const bookings = [];
    const baseDate = new Date(2026, 0, 16); // Start of series

    if (editScope === 'single') {
      // Only show the current booking
      const date = new Date(baseDate);
      date.setDate(date.getDate() + currentBookingIndex);
      bookings.push({
        id: currentBookingIndex + 1,
        date: date.toLocaleDateString('en-GB'),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        time: `${formData.startTime} - ${formData.endTime}`,
        isCurrent: true,
        status: 'will_update',
      });
    } else {
      // Show current and all future bookings
      for (let i = currentBookingIndex; i < totalBookingsInSeries; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const bookingId = i + 1;
        bookings.push({
          id: bookingId,
          date: date.toLocaleDateString('en-GB'),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          time: `${formData.startTime} - ${formData.endTime}`,
          isCurrent: i === currentBookingIndex,
          status: skippedBookings.has(bookingId) ? 'skipped' : 'will_update',
          isSkipped: skippedBookings.has(bookingId),
        });
      }
    }

    return bookings;
  }, [editScope, formData.startTime, formData.endTime, skippedBookings]);

  const futureBookingsCount = totalBookingsInSeries - currentBookingIndex;
  const activeBookingsCount = affectedBookings.filter(b => !b.isSkipped).length;
  const hasSelection = selectedBookings.size > 0;

  // Selection handlers
  const toggleBookingSelection = useCallback((bookingId) => {
    setSelectedBookings(prev => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  }, []);

  const selectAllBookings = useCallback(() => {
    const allIds = affectedBookings.filter(b => !b.isCurrent).map(b => b.id);
    setSelectedBookings(new Set(allIds));
  }, [affectedBookings]);

  const clearSelection = useCallback(() => {
    setSelectedBookings(new Set());
  }, []);

  // Bulk action handlers
  const skipSelectedBookings = useCallback(() => {
    setSkippedBookings(prev => {
      const next = new Set(prev);
      selectedBookings.forEach(id => next.add(id));
      return next;
    });
    setSelectedBookings(new Set());
  }, [selectedBookings]);

  const unskipSelectedBookings = useCallback(() => {
    setSkippedBookings(prev => {
      const next = new Set(prev);
      selectedBookings.forEach(id => next.delete(id));
      return next;
    });
    setSelectedBookings(new Set());
  }, [selectedBookings]);

  const includeAllBookings = useCallback(() => {
    setSkippedBookings(new Set());
    setSelectedBookings(new Set());
  }, []);

  // Check if any selected booking is skipped
  const anySelectedSkipped = useMemo(() => {
    return Array.from(selectedBookings).some(id => skippedBookings.has(id));
  }, [selectedBookings, skippedBookings]);

  const allSelectedSkipped = useMemo(() => {
    return selectedBookings.size > 0 && Array.from(selectedBookings).every(id => skippedBookings.has(id));
  }, [selectedBookings, skippedBookings]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex h-[80vh] max-h-[700px]">
        {/* Left Panel - Form */}
        <div className="w-3/5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Edit Booking</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recurring
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{formData.startDate} • {formData.startTime}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">
              {/* Type - Visual Cards */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Booking Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bookingTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.type === type.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className={`text-xs font-medium ${
                        formData.type === type.id ? 'text-teal-700' : 'text-gray-600'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Picker - Compact */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Time Slot
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center font-mono"
                  />
                  <div className="flex-1 h-1 bg-gray-300 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-teal-500 rounded-full" />
                  </div>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center font-mono"
                  />
                  <span className="text-xs text-gray-500 ml-2">30 min</span>
                </div>
              </div>

              {/* Aircraft - Pills */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Aircraft
                </label>
                <div className="flex flex-wrap gap-2">
                  {aircraftOptions.map((aircraft) => (
                    <button
                      key={aircraft}
                      onClick={() => setFormData({ ...formData, aircraft })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.aircraft === aircraft
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {aircraft}
                    </button>
                  ))}
                </div>
              </div>

              {/* People - Avatar Style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <div className="text-xs text-gray-500 mb-2">Instructor</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                      CT
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{formData.instructor}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <div className="text-xs text-gray-500 mb-2">Student</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      DM
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">Demo Middle Man</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Add notes or special instructions..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:border-teal-300 focus:ring-1 focus:ring-teal-300"
                />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-red-800">PIC unavailable</div>
                  <div className="text-xs text-red-700 mt-0.5">Cypress Test is marked unavailable for this period</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All checks passed
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave?.(formData, editScope, { skippedBookings: Array.from(skippedBookings) })}
                  className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  {editScope === 'series' ? (
                    <>
                      <span>Update {activeBookingsCount} Booking{activeBookingsCount !== 1 ? 's' : ''}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Affected Bookings Preview */}
        <div className="w-2/5 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 flex flex-col">
          {/* Preview Header with Scope Selector */}
          <div className="px-5 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Edit Scope</h3>
            </div>

            {/* Scope Selector - Prominent */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setEditScope('single');
                  setSelectedBookings(new Set());
                  setSkippedBookings(new Set());
                }}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  editScope === 'single'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This only
              </button>
              <button
                onClick={() => {
                  setEditScope('series');
                  // Select all future bookings (non-current) by default
                  const futureIds = [];
                  for (let i = currentBookingIndex + 1; i < totalBookingsInSeries; i++) {
                    futureIds.push(i + 1);
                  }
                  setSelectedBookings(new Set(futureIds));
                }}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  editScope === 'series'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All future ({futureBookingsCount})
              </button>
            </div>
          </div>

          {/* Warning Banner for Series Edit */}
          {editScope === 'series' && !hasSelection && (
            <div className="mx-5 mt-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs text-amber-800">Select bookings below for targeted actions</span>
            </div>
          )}

          {/* Bulk Actions Toolbar - appears when items are selected */}
          {editScope === 'series' && hasSelection && (
            <div className="mx-5 mt-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-700">
                  {selectedBookings.size} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
              <div className="flex gap-1.5">
                {/* Skip / Include Toggle */}
                {allSelectedSkipped ? (
                  <button
                    onClick={unskipSelectedBookings}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Include
                  </button>
                ) : (
                  <button
                    onClick={skipSelectedBookings}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Skip
                  </button>
                )}

                {/* Time Adjust */}
                <button
                  onClick={() => setShowBulkTimeEdit(!showBulkTimeEdit)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    showBulkTimeEdit
                      ? 'text-teal-700 bg-teal-100 border-teal-300'
                      : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Time
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    // Would trigger delete confirmation
                    clearSelection();
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Time adjustment popover */}
              {showBulkTimeEdit && (
                <div className="mt-2 pt-2 border-t border-indigo-100">
                  <div className="text-xs text-gray-500 mb-1.5">Shift time by:</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBulkTimeOffset(p => ({ ...p, hours: Math.max(-12, p.hours - 1) }))}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        −
                      </button>
                      <span className="text-xs font-mono w-8 text-center">{bulkTimeOffset.hours}h</span>
                      <button
                        onClick={() => setBulkTimeOffset(p => ({ ...p, hours: Math.min(12, p.hours + 1) }))}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-gray-300">:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBulkTimeOffset(p => ({ ...p, minutes: Math.max(-45, p.minutes - 15) }))}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        −
                      </button>
                      <span className="text-xs font-mono w-8 text-center">{bulkTimeOffset.minutes}m</span>
                      <button
                        onClick={() => setBulkTimeOffset(p => ({ ...p, minutes: Math.min(45, p.minutes + 15) }))}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        // Apply time offset to selected bookings
                        setShowBulkTimeEdit(false);
                        setBulkTimeOffset({ hours: 0, minutes: 0 });
                      }}
                      className="ml-auto px-2 py-1 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Affected Bookings Header */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {editScope === 'single' ? 'Booking to Update' : (
                skippedBookings.size > 0
                  ? `${activeBookingsCount} of ${affectedBookings.length} to Update`
                  : 'Bookings to Update'
              )}
            </h4>
            {editScope === 'series' && affectedBookings.length > 1 && (
              <div className="flex items-center gap-2">
                {skippedBookings.size > 0 && (
                  <button
                    onClick={includeAllBookings}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Include all
                  </button>
                )}
                {selectedBookings.size === 0 ? (
                  <button
                    onClick={selectAllBookings}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Select all
                  </button>
                ) : (
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Deselect
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Booking List */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="space-y-2">
              {affectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => editScope === 'series' && !booking.isCurrent && toggleBookingSelection(booking.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    booking.isCurrent
                      ? 'bg-teal-50 border-teal-300 shadow-sm ring-2 ring-teal-200'
                      : booking.isSkipped
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : selectedBookings.has(booking.id)
                          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                  } ${editScope === 'series' && !booking.isCurrent ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {/* Checkbox for series mode (non-current bookings) */}
                      {editScope === 'series' && !booking.isCurrent && (
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedBookings.has(booking.id)
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookingSelection(booking.id);
                          }}
                        >
                          {selectedBookings.has(booking.id) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className={`text-xs font-medium ${
                        booking.isCurrent ? 'text-teal-600' : booking.isSkipped ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        #{booking.id}
                      </span>
                      {booking.isCurrent && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                          Current
                        </span>
                      )}
                      {booking.isSkipped && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          Skipped
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${booking.isSkipped ? 'text-gray-300' : 'text-gray-400'}`}>{booking.dayName}</span>
                  </div>
                  <div className={`text-sm font-medium ${
                    booking.isCurrent ? 'text-teal-900' : booking.isSkipped ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {booking.date}
                  </div>
                  <div className={`text-xs mt-0.5 ${booking.isSkipped ? 'text-gray-300' : 'text-gray-500'}`}>{booking.time}</div>

                  {/* Update indicator */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex items-center gap-1.5">
                    {booking.isSkipped ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-xs text-gray-400">Will be skipped</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-2 h-2 rounded-full ${booking.isCurrent ? 'bg-teal-500' : 'bg-blue-500'}`} />
                        <span className="text-xs text-gray-500">Will be updated</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Footer */}
          {editScope === 'series' && affectedBookings.length > 1 && (
            <div className="px-5 py-3 border-t border-gray-200 bg-white">
              {skippedBookings.size > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Active</div>
                      <div className="text-sm font-semibold text-teal-600">{activeBookingsCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Skipped</div>
                      <div className="text-sm font-semibold text-amber-600">{skippedBookings.size}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Date Range</div>
                    <div className="text-xs font-medium text-gray-700">
                      {affectedBookings.find(b => !b.isSkipped)?.date} → {[...affectedBookings].reverse().find(b => !b.isSkipped)?.date}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-500">First Update</div>
                    <div className="text-sm font-semibold text-gray-900">{affectedBookings[0]?.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last Update</div>
                    <div className="text-sm font-semibold text-gray-900">{affectedBookings[affectedBookings.length - 1]?.date}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single booking info */}
          {editScope === 'single' && (
            <div className="px-5 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Only this booking will be modified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
