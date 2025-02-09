import React from "react";

const VerificationModal = ({
  isOpen,
  onClose,
  onProceed,
  currentStep,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      {/* Modal content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Modal header */}
          <div className="mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Form Validation - Step {currentStep} of 2
            </h3>
          </div>

          {/* Modal body */}
          <div className="mt-3 sm:mt-4">
            <div className="text-sm text-gray-500">{message}</div>
          </div>

          {/* Modal footer */}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
              onClick={onProceed}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
