import React from 'react';
import { HelpCircle } from 'lucide-react';

export const Input = ({
  label,
  unit,
  helperText,
  error,
  id,
  type = 'text',
  className = '',
  required = false,
  disabled = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <label htmlFor={inputId} className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
          {unit && <span className="font-mono text-slate-500 text-[11px]">Unit: {unit}</span>}
        </div>
      )}

      <div className="relative rounded-lg shadow-sm">
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 text-slate-900'
          } ${unit ? 'pr-14' : ''} ${className}`}
          {...props}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-medium text-slate-400">
            {unit}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-1">
          <HelpCircle className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <span>{helperText}</span>
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
