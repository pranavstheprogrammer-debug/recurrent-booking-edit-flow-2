import React, { useState, useMemo } from 'react';
import Modal from './Modal';

/**
 * Unified Create Booking Modal
 * Combines the booking form and recurring preview into a single modal,
 * eliminating the need for a separate preview confirmation modal.
 */
export default function CreateBookingModal({ isOpen, onClose, onBook }) {
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
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
    repeatEndDate: '',
  });

  const bookingTypes = [
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'training', label: 'Training Flight' },
    { id: 'ground', label: 'Ground Training' },
    { id: 'rental', label: 'Rental Flight' },
  ];

  const aircraftOptions = ['N123AB', 'N123AC', 'HOOBS-AFS-EMULATE'];
  const frequencyOptions = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
  const endsOptions = ['After', 'On date'];

  // Generate preview bookings based on form data
  const previewBookings = useMemo(() => {
    if (!isRepeatEnabled) return [];

    const bookings = [];
    const baseDate = new Date(2026, 0, 16); // 16/01/2026

    for (let i = 0; i < formData.numberOfBookings; i++) {
      const date = new Date(baseDate);
      if (formData.frequency === 'daily') {
        date.setDate(date.getDate() + i);
      } else if (formData.frequency === 'weekly') {
        date.setDate(date.getDate() + (i * 7));
      } else if (formData.frequency === 'bi-weekly') {
        date.setDate(date.getDate() + (i * 14));
      } else if (formData.frequency === 'monthly') {
        date.setMonth(date.getMonth() + i);
      }

      bookings.push({
        id: i + 1,
        date: date.toLocaleDateString('en-GB'),
        time: `${formData.startTime} - ${formData.endTime}`,
        trainingEvent: 'None',
        status: 'valid', // valid, conflict, warning
      });
    }

    return bookings;
  }, [isRepeatEnabled, formData.numberOfBookings, formData.frequency, formData.startTime, formData.endTime]);

  // Calculate duration info
  const durationInfo = useMemo(() => {
    if (previewBookings.length === 0) return null;

    const firstDate = previewBookings[0]?.date;
    const lastDate = previewBookings[previewBookings.length - 1]?.date;

    // Calculate approximate duration
    const days = previewBookings.length - 1;
    let duration = '';
    if (formData.frequency === 'daily') {
      duration = days < 7 ? 'Less than a week' : `${Math.ceil(days / 7)} week(s)`;
    } else if (formData.frequency === 'weekly') {
      duration = `${days} week(s)`;
    } else if (formData.frequency === 'bi-weekly') {
      duration = `${days * 2} week(s)`;
    } else {
      duration = `${days} month(s)`;
    }

    return { firstDate, lastDate, duration };
  }, [previewBookings, formData.frequency]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col max-h-[85vh]">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Make a booking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Form Section */}
          <div className="space-y-5">
            {/* Type Selection */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Type
                <span className="text-red-500">★</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {bookingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.type === type.id
                        ? 'bg-indigo-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
                <button className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center gap-1">
                  Select Booking Type
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Flight Period */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Flight Period
                <span className="text-red-500">★</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                    />
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                  />
                </div>
                <span className="text-gray-400">—</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.startDate}
                      readOnly
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8 bg-gray-50"
                    />
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                  />
                </div>
              </div>
            </div>

            {/* Aircraft Selection */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Select aircraft
                <span className="text-red-500">★</span>
              </label>
              <div className="flex items-center gap-2">
                {aircraftOptions.map((aircraft) => (
                  <button
                    key={aircraft}
                    onClick={() => setFormData({ ...formData, aircraft })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.aircraft === aircraft
                        ? 'bg-indigo-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {aircraft}
                  </button>
                ))}
                <button className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Instructor + Student Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Instructor
                  <span className="text-red-500">★</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      C
                    </div>
                    <span className="text-sm text-gray-900 flex-1">{formData.instructor}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                      D
                    </div>
                    <span className="text-sm text-gray-900 flex-1 truncate">{formData.student}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Additional information</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Add notes or special instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20"
              />
            </div>

            {/* Repeat Booking Section */}
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">Repeat booking</label>
                <button
                  onClick={() => setIsRepeatEnabled(!isRepeatEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isRepeatEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isRepeatEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isRepeatEnabled && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Frequency */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value.toLowerCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      {frequencyOptions.map((freq) => (
                        <option key={freq} value={freq.toLowerCase()}>{freq}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ends */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Ends</label>
                    <select
                      value={formData.ends}
                      onChange={(e) => setFormData({ ...formData, ends: e.target.value.toLowerCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      {endsOptions.map((end) => (
                        <option key={end} value={end.toLowerCase().replace(' ', '_')}>{end}</option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Bookings */}
                  {formData.ends === 'after' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Number of bookings</label>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={formData.numberOfBookings}
                        onChange={(e) => setFormData({ ...formData, numberOfBookings: parseInt(e.target.value) || 1 })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}

                  {/* Show More Link */}
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Show More
                  </button>

                  {/* Inline Preview Section - THE KEY INNOVATION */}
                  {previewBookings.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      {/* Preview Header - Always Visible */}
                      <button
                        onClick={() => setShowFullPreview(!showFullPreview)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-left">
                              <div className="text-xs text-gray-500">Total Bookings</div>
                              <div className="text-lg font-semibold text-gray-900">{previewBookings.length}</div>
                            </div>
                          </div>
                          <div className="h-8 w-px bg-gray-300" />
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                              <div className="text-xs text-gray-500">Duration</div>
                              <div className="text-sm font-medium text-gray-900">{durationInfo?.duration}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {durationInfo?.firstDate} → {durationInfo?.lastDate}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${showFullPreview ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expandable Full Preview */}
                      {showFullPreview && (
                        <div className="border-t border-gray-200">
                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-3">Date</div>
                            <div className="col-span-3">Time</div>
                            <div className="col-span-3">Training Event</div>
                            <div className="col-span-2 text-center">Status</div>
                          </div>

                          {/* Table Body */}
                          <div className="max-h-48 overflow-y-auto">
                            {previewBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
                              >
                                <div className="col-span-1 text-sm text-gray-600">{booking.id}</div>
                                <div className="col-span-3 text-sm text-gray-900">{booking.date}</div>
                                <div className="col-span-3 text-sm text-gray-600">{booking.time}</div>
                                <div className="col-span-3 text-sm text-gray-400">{booking.trainingEvent}</div>
                                <div className="col-span-2 flex justify-center">
                                  {booking.status === 'valid' && (
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                  {booking.status === 'conflict' && (
                                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </div>
                                  )}
                                  {booking.status === 'warning' && (
                                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Warning Banner */}
          <div className="mt-5 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-800">PIC is marked not available</h4>
                <p className="text-sm text-red-700 mt-1">
                  Blocks flight booking when the Pilot-in-Command is marked as unavailable for the scheduled time period.
                  This only checks the PIC "availability" status, not whether there are other bookings.
                </p>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Cypress Test has been marked unavailable for this period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                All checks passed
              </span>
              <div className="flex items-center gap-1.5 text-sm text-green-700">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                All checks have passed, you may continue!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={() => onBook?.(formData, previewBookings)}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {isRepeatEnabled && previewBookings.length > 1
                  ? `Create ${previewBookings.length} Bookings`
                  : 'Book'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
