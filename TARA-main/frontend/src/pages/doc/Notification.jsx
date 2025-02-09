import React from "react";
import { GrClose } from "react-icons/gr";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

// Notification Component
const Notification = ({ type = "info", message, onClose, className = "" }) => {
  const typeStyles = {
    success: {
      background: "bg-green-50",
      text: "text-green-800",
      icon: "text-green-500",
      border: "border-green-200",
    },
    error: {
      background: "bg-red-50",
      text: "text-red-800",
      icon: "text-red-500",
      border: "border-red-200",
    },
    warning: {
      background: "bg-yellow-50",
      text: "text-yellow-800",
      icon: "text-yellow-500",
      border: "border-yellow-200",
    },
    info: {
      background: "bg-blue-50",
      text: "text-blue-800",
      icon: "text-blue-500",
      border: "border-blue-200",
    },
  };

  const icons = {
    success: FaRegCheckCircle,
    error: IoAlertCircleOutline,
    warning: IoAlertCircleOutline,
    info: FiInfo,
  };

  const currentStyle = typeStyles[type];
  const Icon = icons[type];

  return (
    <div
      className={`
        flex items-center justify-between 
        p-4 rounded-lg shadow-md 
        ${currentStyle.background} 
        ${currentStyle.text} 
        ${currentStyle.border} 
        border 
        animate-slide-in
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${currentStyle.icon}`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <GrClose className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4x1",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
      aria-modal="true"
    >
      {/* Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`
          relative w-full ${sizeClasses[size]} 
          mx-auto bg-white rounded-xl shadow-2xl 
          border border-gray-200 
          transform transition-all 
          animate-modal-enter
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 
            text-gray-400 hover:text-gray-600 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            rounded-full p-2
          "
        >
          <GrClose className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal, Notification };
