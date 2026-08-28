import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  helperText,
  error,
  id,
  className = '',
  required = false,
  disabled = false,
  value,
  onChange,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          <span>{label}</span>
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-white appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 pr-10 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 text-slate-900'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default Select;
