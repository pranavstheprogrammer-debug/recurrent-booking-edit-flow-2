import React, { useState } from 'react';
import Modal from './Modal';

export default function EditBookingModal({ isOpen, onClose, onSave, bookingData }) {
  const [editScope, setEditScope] = useState('single'); // 'single' or 'series'
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock data for the form
  const [formData, setFormData] = useState({
    type: 'training',
    startDate: '16/01/2026',
    startTime: '08:30',
    endDate: '16/01/2026',
    endTime: '09:00',
    aircraft: 'N123AB',
    instructor: 'Cypress Test',
    student: 'Demo Middle Man Mr',
    additionalInfo: '',
  });

  const futureBookingsCount = 5; // This would come from props in real implementation

  const handleSave = () => {
    if (editScope === 'series' && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    onSave?.(formData, editScope);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setEditScope('single');
    onClose();
  };

  const bookingTypes = [
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'training', label: 'Training Flight' },
    { id: 'ground', label: 'Ground Training' },
    { id: 'rental', label: 'Rental Flight' },
  ];

  const aircraftOptions = ['N123AB', 'N123AC', 'HOOBS-AFS-EMULATE'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Edit Booking</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recurring
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">08:30 - 09:00, 16/01/2026</p>
        </div>

        {/* Scope Selection - Card Style */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What would you like to edit?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Single Booking Option */}
            <button
              onClick={() => {
                setEditScope('single');
                setShowConfirmation(false);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                editScope === 'single'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  editScope === 'single' ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {editScope === 'single' && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <span className="font-medium text-gray-900">This booking only</span>
              </div>
              <p className="text-xs text-gray-500 ml-6">Changes apply to this single occurrence</p>
            </button>

            {/* Series Option */}
            <button
              onClick={() => setEditScope('series')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                editScope === 'series'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  editScope === 'series' ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {editScope === 'series' && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <span className="font-medium text-gray-900">This & future bookings</span>
              </div>
              <p className="text-xs text-gray-500 ml-6">Changes apply to {futureBookingsCount} bookings in this series</p>
            </button>
          </div>
        </div>

        {/* Confirmation Banner for Series Edit */}
        {editScope === 'series' && showConfirmation && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900">Confirm series update</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You are about to update <strong>{futureBookingsCount} bookings</strong> in this series. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Booking Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {bookingTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Flight Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flight Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={formData.startDate}
                readOnly
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
              />
              <input
                type="text"
                value={formData.startTime}
                readOnly
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
              />
              <input
                type="text"
                value={formData.endDate}
                readOnly
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
              />
              <input
                type="text"
                value={formData.endTime}
                readOnly
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Aircraft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aircraft
            </label>
            <select
              value={formData.aircraft}
              onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {aircraftOptions.map((aircraft) => (
                <option key={aircraft} value={aircraft}>{aircraft}</option>
              ))}
            </select>
          </div>

          {/* Instructor & Student */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-medium text-teal-700">
                  C
                </div>
                <span className="text-sm text-gray-900 flex-1">{formData.instructor}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                  D
                </div>
                <span className="text-sm text-gray-900 flex-1 truncate">{formData.student}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Add notes or special instructions..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-5 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="text-sm text-red-800 font-medium">PIC unavailable: </span>
              <span className="text-sm text-red-700">Cypress Test has been marked unavailable for this period</span>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-green-700">All checks have passed, you may continue!</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              editScope === 'series' && showConfirmation
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {editScope === 'single'
              ? 'Save Changes'
              : showConfirmation
                ? `Confirm Update (${futureBookingsCount} Bookings)`
                : `Update ${futureBookingsCount} Bookings`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
