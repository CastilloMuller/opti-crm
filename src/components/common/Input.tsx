import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-highlight' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-highlight">{error}</p>
      )}
    </div>
  );
};