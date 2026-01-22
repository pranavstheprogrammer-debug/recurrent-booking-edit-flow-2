import { useState } from 'react';
import EditBookingModal from '@components/EditBookingModal';
import EditBookingModalCompact from '@components/EditBookingModalCompact';
import EditBookingModalSplit from '@components/EditBookingModalSplit';
import CreateBookingModal from '@components/CreateBookingModal';
import CreateBookingModalSplit from '@components/CreateBookingModalSplit';
import CreditTransferDrawer from '@components/CreditTransferDrawer';
import CreditTransferView from '@components/CreditTransferView';
import Toast from '@components/Toast';

const App = () => {
  const [activeDesign, setActiveDesign] = useState('split'); // 'standard', 'compact', or 'split'
  const [activeCreateDesign, setActiveCreateDesign] = useState('inline'); // 'inline' or 'split'
  const [activeCreditDesign, setActiveCreditDesign] = useState('wireframe'); // 'drawer' or 'wireframe'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreditTransferOpen, setIsCreditTransferOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', description: '' });

  const handleSave = (formData, editScope) => {
    setIsModalOpen(false);

    // Show toast notification instead of a modal
    const bookingsUpdated = editScope === 'series' ? 5 : 1;
    setToast({
      isVisible: true,
      message: `${bookingsUpdated} booking${bookingsUpdated > 1 ? 's' : ''} updated`,
      description: 'The changes have been applied successfully',
    });
  };

  const handleBook = (formData, previewBookings) => {
    setIsCreateModalOpen(false);

    // Show toast notification
    const bookingsCreated = previewBookings?.length || 1;
    setToast({
      isVisible: true,
      message: `${bookingsCreated} booking${bookingsCreated > 1 ? 's' : ''} created`,
      description: 'Your bookings have been scheduled successfully',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Booking Flow UI/UX Demos</h1>
          <p className="text-sm text-gray-500 mt-1">Unified modal designs - reducing multi-modal friction</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Design Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Improvements</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Before: 4 Separate Modals
              </h3>
              <ol className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">1</span>
                  <span>Edit Recurring Booking (scope selection)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">2</span>
                  <span>Edit Booking (the actual form)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">3</span>
                  <span>Update Recurring Series (confirmation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">4</span>
                  <span>Update Complete (success message)</span>
                </li>
              </ol>
            </div>

            {/* After */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                After: 1 Modal + Toast
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">1</span>
                  <span><strong>Unified Modal</strong> - scope toggle + form + inline confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">2</span>
                  <span><strong>Toast Notification</strong> - replaces success modal</span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600">
                  <strong>Key improvements:</strong> Scope selection integrated as toggle, confirmation shown inline, success shown as non-blocking toast
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Design Variants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Variants</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Standard Design */}
            <button
              onClick={() => setActiveDesign('standard')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeDesign === 'standard'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeDesign === 'standard' ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {activeDesign === 'standard' && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Standard</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Card-style radio buttons for scope selection with inline confirmation banner.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Spacious</span>
              </div>
            </button>

            {/* Compact Design */}
            <button
              onClick={() => setActiveDesign('compact')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeDesign === 'compact'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeDesign === 'compact' ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {activeDesign === 'compact' && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Compact</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Segmented control in header. Condensed form with collapsible options.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Minimal</span>
              </div>
            </button>

            {/* Split Panel Design */}
            <button
              onClick={() => setActiveDesign('split')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeDesign === 'split'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeDesign === 'split' ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {activeDesign === 'split' && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Split Panel</h3>
                <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs rounded font-medium">New</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Side-by-side layout with form left, affected bookings preview right.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Visual preview</span>
              </div>
            </button>
          </div>
        </div>

        {/* Demo Trigger - Edit Booking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Edit Booking Demo</h2>
          <p className="text-sm text-gray-500 mb-4">
            Click the button below to see the <strong>{activeDesign === 'standard' ? 'Standard' : activeDesign === 'compact' ? 'Compact' : 'Split Panel'}</strong> modal design in action.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Booking
          </button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 text-sm mb-2">Try these interactions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Toggle between "This only" and "All future" in the scope selector</li>
              <li>• Notice how the booking list updates to show affected bookings</li>
              <li>• See the current booking highlighted in the preview (Split Panel)</li>
              <li>• Watch the warning banner appear when editing multiple bookings</li>
              <li>• Complete the save to see the toast notification</li>
              <li>• Switch between design variants above to compare</li>
            </ul>
          </div>
        </div>

        {/* ========== CREATE BOOKING SECTION ========== */}
        <div className="mt-8 pt-8 border-t-2 border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create Booking Flow</h2>
          <p className="text-sm text-gray-500 mb-6">Unified modal that combines booking form + recurring preview into one</p>
        </div>

        {/* Create Booking - Design Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Improvements</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Before: 2 Separate Modals
              </h3>
              <ol className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">1</span>
                  <span>Make a Booking (large form with all fields)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs">2</span>
                  <span>Preview Recurring Bookings (confirmation table)</span>
                </li>
              </ol>
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600">
                  <strong>Problems:</strong> Context switching, can't see preview while editing, extra clicks to confirm
                </p>
              </div>
            </div>

            {/* After */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                After: 1 Unified Modal
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">✓</span>
                  <span><strong>Form + Preview Together</strong> - see changes in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">✓</span>
                  <span><strong>Single Action</strong> - one "Create" button for all</span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600">
                  <strong>Benefits:</strong> No context switching, live preview, fewer clicks, better UX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Booking - Design Variants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Booking Variants</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Inline Preview Design */}
            <button
              onClick={() => setActiveCreateDesign('inline')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeCreateDesign === 'inline'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeCreateDesign === 'inline' ? 'border-indigo-500' : 'border-gray-300'
                }`}>
                  {activeCreateDesign === 'inline' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Inline Preview</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Traditional form layout with a collapsible preview section that appears when repeat booking is enabled. Preview expands to show full booking table.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Familiar layout</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Collapsible preview</span>
              </div>
            </button>

            {/* Split Panel Design */}
            <button
              onClick={() => setActiveCreateDesign('split')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeCreateDesign === 'split'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeCreateDesign === 'split' ? 'border-indigo-500' : 'border-gray-300'
                }`}>
                  {activeCreateDesign === 'split' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Split Panel</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Side-by-side layout with form on the left and a timeline preview panel that slides in from the right. Always visible when repeat is on.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Modern layout</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Timeline preview</span>
              </div>
            </button>
          </div>
        </div>

        {/* Create Booking - Demo Trigger */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Create Booking Demo</h2>
          <p className="text-sm text-gray-500 mb-4">
            Click the button below to see the <strong>{activeCreateDesign === 'inline' ? 'Inline Preview' : 'Split Panel'}</strong> modal design in action.
          </p>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Make a Booking
          </button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 text-sm mb-2">Try these interactions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Toggle the "Repeat booking" switch to see the preview appear</li>
              <li>• Change frequency and number of bookings to see preview update</li>
              <li>• Click the preview header to expand/collapse the full table (Inline design)</li>
              <li>• Notice the timeline visualization (Split Panel design)</li>
              <li>• Click "Create X Bookings" to see the toast notification</li>
            </ul>
          </div>
        </div>

        {/* ========== CREDIT TRANSFER SECTION ========== */}
        <div className="mt-8 pt-8 border-t-2 border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Credit Transfer System</h2>
          <p className="text-sm text-gray-500 mb-6">PLAR (Prior Learning Assessment and Recognition) system for flight training credit management</p>
        </div>

        {/* Credit Transfer - Design Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Credit Transfer</h2>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-medium text-blue-800 mb-2">What is PLAR?</h3>
            <p className="text-sm text-blue-700">
              Prior Learning Assessment and Recognition allows flight schools to credit students for training completed at other institutions,
              reducing redundant training when students transfer between schools. This interface manages credit transfers for
              <strong> Multi-Engine Instrument Rating (ME-IR)</strong> training syllabuses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Drawer Design */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Modern Drawer Design
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Gradient header with student info</li>
                <li>• Search and filter functionality</li>
                <li>• Collapsible phase sections</li>
                <li>• Progress badges and stats</li>
              </ul>
            </div>

            {/* Wireframe Design */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                NORTÁVIA Wireframe Design
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">New</span>
              </h3>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Two-row VFR/IFR column headers</li>
                <li>• Syllabus vs Credited summary</li>
                <li>• Phase totals at bottom of each phase</li>
                <li>• Checkboxes on right side (like original)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Credit Transfer - Design Variants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Transfer Variants</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Drawer Design */}
            <button
              onClick={() => setActiveCreditDesign('drawer')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeCreditDesign === 'drawer'
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeCreditDesign === 'drawer' ? 'border-slate-500' : 'border-gray-300'
                }`}>
                  {activeCreditDesign === 'drawer' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">Modern Drawer</h3>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Feature-rich design with search, collapsible phases, progress indicators, and modern styling.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Search</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Collapsible</span>
              </div>
            </button>

            {/* Wireframe Design */}
            <button
              onClick={() => setActiveCreditDesign('wireframe')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activeCreditDesign === 'wireframe'
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  activeCreditDesign === 'wireframe' ? 'border-slate-500' : 'border-gray-300'
                }`}>
                  {activeCreditDesign === 'wireframe' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                </div>
                <h3 className="font-semibold text-gray-900">NORTÁVIA Wireframe</h3>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">New</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Table-based layout matching the NORTÁVIA flight school wireframe with VFR/IFR column headers.
              </p>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">VFR/IFR columns</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Phase totals</span>
              </div>
            </button>
          </div>
        </div>

        {/* Credit Transfer - Demo Trigger */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Credit Transfer Demo</h2>
          <p className="text-sm text-gray-500 mb-4">
            Click the button below to see the <strong>{activeCreditDesign === 'drawer' ? 'Modern Drawer' : 'NORTÁVIA Wireframe'}</strong> design in action.
          </p>

          <button
            onClick={() => setIsCreditTransferOpen(true)}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Open Credit Transfer
          </button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 text-sm mb-2">Key features to explore:</h3>
            {activeCreditDesign === 'wireframe' ? (
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Student Header</strong> - shows Student ID, Code, and Name (17094 NRO - Nuno Rodrigues)</li>
                <li>• <strong>VFR/IFR Column Groups</strong> - two-row headers matching wireframe spec</li>
                <li>• <strong>Syllabus Row</strong> - total hours required for the training program</li>
                <li>• <strong>Credited Row</strong> - editable inputs with [H:MM] format, Reset button</li>
                <li>• <strong>Phase Structure</strong> - BIFM, Adv Instruments phases with totals</li>
                <li>• <strong>Lesson Links</strong> - clickable INST XX links (would navigate to lesson details)</li>
                <li>• <strong>Right-side Checkboxes</strong> - phase and lesson selection on right</li>
                <li>• <strong>Blue Highlighting</strong> - credited rows highlighted with blue bar</li>
                <li>• <strong>Auto-save</strong> - changes save immediately</li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Credit Summary Table</strong> - shows Syllabus (Required), Credited, and Remaining</li>
                <li>• <strong>Editable credited values</strong> - click any credited cell to manually override</li>
                <li>• <strong>Phase-based organization</strong> - events grouped by training phases</li>
                <li>• <strong>Checkbox credit toggling</strong> - check/uncheck to credit lessons</li>
                <li>• <strong>Phase-level selection</strong> - check phase header to credit all lessons in phase</li>
                <li>• <strong>Visual indicators</strong> - Blue = credited, Orange = partial phase credit</li>
                <li>• <strong>Auto-save</strong> - no save button needed, changes save immediately</li>
                <li>• <strong>Search</strong> - filter training events by name</li>
                <li>• <strong>Reset All</strong> - clear all credits with confirmation dialog</li>
                <li>• <strong>Collapsible phases</strong> - click chevron to expand/collapse</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* The Unified Modal - Standard Design */}
      {activeDesign === 'standard' && (
        <EditBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* The Unified Modal - Compact Design */}
      {activeDesign === 'compact' && (
        <EditBookingModalCompact
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* The Unified Modal - Split Panel Design */}
      {activeDesign === 'split' && (
        <EditBookingModalSplit
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Create Booking Modal - Inline Preview Design */}
      {activeCreateDesign === 'inline' && (
        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onBook={handleBook}
        />
      )}

      {/* Create Booking Modal - Split Panel Design */}
      {activeCreateDesign === 'split' && (
        <CreateBookingModalSplit
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onBook={handleBook}
        />
      )}

      {/* Credit Transfer - Modern Drawer */}
      {activeCreditDesign === 'drawer' && (
        <CreditTransferDrawer
          isOpen={isCreditTransferOpen}
          onClose={() => setIsCreditTransferOpen(false)}
          studentName="Hello Gomora"
          programCode="ATPA_FI"
        />
      )}

      {/* Credit Transfer - Wireframe Design */}
      {activeCreditDesign === 'wireframe' && (
        <CreditTransferView
          isOpen={isCreditTransferOpen}
          onClose={() => setIsCreditTransferOpen(false)}
          studentId="17094"
          studentCode="NRO"
          studentName="Nuno Rodrigues"
        />
      )}

      {/* Toast Notification (replaces the "Update Complete" modal) */}
      <Toast
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        message={toast.message}
        description={toast.description}
        type="success"
      />
    </div>
  );
};

export default App;
