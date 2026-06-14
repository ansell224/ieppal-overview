import React from 'react';
import { X } from 'lucide-react';

// Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-400 text-white hover:shadow-lg transform hover:scale-105',
    secondary: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

// Modal Components
export const Modal = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl max-w-md w-full overflow-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, onClose, gradient = "from-blue-500 to-indigo-400", icon: Icon }) => (
  <div className={`bg-gradient-to-r ${gradient} p-8 rounded-t-3xl`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {Icon && (
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
);

export const ModalContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

export const ModalFooter = ({ children }) => (
  <div className="flex items-center justify-end space-x-3 px-6 pb-6">
    {children}
  </div>
);

export const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error.message}</p>
      {error.details && error.details.length > 0 && (
        <ul className="text-sm text-red-700 dark:text-red-400 mt-1 list-disc list-inside">
          {error.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 ${className}`}>
      <div
        className="bg-gradient-to-r from-blue-500 to-indigo-400 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};
