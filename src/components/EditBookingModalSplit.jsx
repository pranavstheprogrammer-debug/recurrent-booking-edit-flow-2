import React, { useState, useMemo } from 'react';
import Modal from './Modal';

/**
 * Split View Edit Booking Modal
 * Uses a side-by-side layout similar to CreateBookingModalSplit.
 * Left panel: Edit form
 * Right panel: Scope selector + affected bookings preview with current booking highlighted
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
        bookings.push({
          id: i + 1,
          date: date.toLocaleDateString('en-GB'),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          time: `${formData.startTime} - ${formData.endTime}`,
          isCurrent: i === currentBookingIndex,
          status: 'will_update',
        });
      }
    }

    return bookings;
  }, [editScope, formData.startTime, formData.endTime]);

  const futureBookingsCount = totalBookingsInSeries - currentBookingIndex;

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
                  onClick={() => onSave?.(formData, editScope)}
                  className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  {editScope === 'series' ? (
                    <>
                      <span>Update {futureBookingsCount} Bookings</span>
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
                onClick={() => setEditScope('single')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  editScope === 'single'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This only
              </button>
              <button
                onClick={() => setEditScope('series')}
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
          {editScope === 'series' && (
            <div className="mx-5 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-amber-800">Bulk edit mode</div>
                <div className="text-xs text-amber-700 mt-0.5">This action cannot be undone</div>
              </div>
            </div>
          )}

          {/* Affected Bookings Header */}
          <div className="px-5 pt-4 pb-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {editScope === 'single' ? 'Booking to Update' : 'Bookings to Update'}
            </h4>
          </div>

          {/* Booking List */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="space-y-2">
              {affectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-3 rounded-lg border transition-all ${
                    booking.isCurrent
                      ? 'bg-teal-50 border-teal-300 shadow-sm ring-2 ring-teal-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        booking.isCurrent ? 'text-teal-600' : 'text-gray-500'
                      }`}>
                        #{booking.id}
                      </span>
                      {booking.isCurrent && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{booking.dayName}</span>
                  </div>
                  <div className={`text-sm font-medium ${booking.isCurrent ? 'text-teal-900' : 'text-gray-900'}`}>
                    {booking.date}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{booking.time}</div>

                  {/* Update indicator */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${booking.isCurrent ? 'bg-teal-500' : 'bg-blue-500'}`} />
                    <span className="text-xs text-gray-500">Will be updated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Footer */}
          {editScope === 'series' && affectedBookings.length > 1 && (
            <div className="px-5 py-4 border-t border-gray-200 bg-white">
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
