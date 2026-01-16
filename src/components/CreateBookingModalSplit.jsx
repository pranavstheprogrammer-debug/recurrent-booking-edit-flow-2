import React, { useState, useMemo } from 'react';
import Modal from './Modal';

/**
 * Split View Create Booking Modal
 * Uses a side-by-side layout where the preview panel slides in when repeat is enabled.
 * This design keeps both form and preview visible simultaneously.
 */
export default function CreateBookingModalSplit({ isOpen, onClose, onBook }) {
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(true);
  const [formData, setFormData] = useState({
    type: 'training',
    startDate: '16/01/2026',
    startTime: '14:00',
    endDate: '16/01/2026',
    endTime: '14:30',
    aircraft: 'N123AB',
    instructor: 'Cypress Test',
    student: 'Demo Middle Man Mr',
    additionalInfo: '',
    frequency: 'daily',
    ends: 'after',
    numberOfBookings: 3,
  });

  const bookingTypes = [
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'training', label: 'Training', icon: '✈️' },
    { id: 'ground', label: 'Ground', icon: '📚' },
    { id: 'rental', label: 'Rental', icon: '🛫' },
  ];

  const aircraftOptions = ['N123AB', 'N123AC', 'HOOBS-AFS'];

  // Generate preview bookings
  const previewBookings = useMemo(() => {
    if (!isRepeatEnabled) return [];

    const bookings = [];
    const baseDate = new Date(2026, 0, 16);

    for (let i = 0; i < formData.numberOfBookings; i++) {
      const date = new Date(baseDate);
      if (formData.frequency === 'daily') {
        date.setDate(date.getDate() + i);
      } else if (formData.frequency === 'weekly') {
        date.setDate(date.getDate() + (i * 7));
      }

      bookings.push({
        id: i + 1,
        date: date.toLocaleDateString('en-GB'),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        time: `${formData.startTime} - ${formData.endTime}`,
        status: i === 0 ? 'current' : 'valid',
      });
    }

    return bookings;
  }, [isRepeatEnabled, formData.numberOfBookings, formData.frequency, formData.startTime, formData.endTime]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex h-[80vh] max-h-[700px]">
        {/* Left Panel - Form */}
        <div className={`flex flex-col transition-all duration-300 ${isRepeatEnabled ? 'w-3/5' : 'w-full'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New Booking</h2>
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
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className={`text-xs font-medium ${
                        formData.type === type.id ? 'text-indigo-700' : 'text-gray-600'
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
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-indigo-500 rounded-full" />
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

              {/* Repeat Toggle - Prominent */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isRepeatEnabled ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Repeat booking</div>
                      <div className="text-xs text-gray-500">Create multiple bookings at once</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRepeatEnabled(!isRepeatEnabled)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      isRepeatEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        isRepeatEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isRepeatEnabled && (
                  <div className="mt-4 pt-4 border-t border-indigo-200 grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Frequency</label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Ends</label>
                      <select
                        value={formData.ends}
                        onChange={(e) => setFormData({ ...formData, ends: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="after">After</option>
                        <option value="on_date">On date</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Count</label>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={formData.numberOfBookings}
                        onChange={(e) => setFormData({ ...formData, numberOfBookings: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-amber-800">PIC unavailable</div>
                  <div className="text-xs text-amber-700 mt-0.5">Cypress Test is marked unavailable for this period</div>
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
                Ready to book
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onBook?.(formData, previewBookings)}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  {isRepeatEnabled && previewBookings.length > 1 ? (
                    <>
                      <span>Create {previewBookings.length} Bookings</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview (Slides in when repeat is enabled) */}
        {isRepeatEnabled && (
          <div className="w-2/5 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Preview Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Booking Preview</h3>
                  <p className="text-xs text-gray-500">{previewBookings.length} bookings will be created</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-green-700">All valid</span>
                </div>
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

                {/* Booking Items */}
                <div className="space-y-4">
                  {previewBookings.map((booking, index) => (
                    <div key={booking.id} className="relative flex items-start gap-4 pl-2">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        booking.status === 'current'
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'bg-white border-gray-300'
                      }`}>
                        {booking.status === 'current' && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                        {booking.status === 'valid' && (
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Booking Card */}
                      <div className={`flex-1 p-3 rounded-lg border transition-all ${
                        booking.status === 'current'
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            booking.status === 'current' ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            #{booking.id}
                          </span>
                          <span className="text-xs text-gray-400">{booking.dayName}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{booking.date}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{booking.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500">First Booking</div>
                  <div className="text-sm font-semibold text-gray-900">{previewBookings[0]?.date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Booking</div>
                  <div className="text-sm font-semibold text-gray-900">{previewBookings[previewBookings.length - 1]?.date}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
