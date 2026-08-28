import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    healthy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    moderate: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    critical: 'bg-rose-50 text-rose-700 border border-rose-200',
    high: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    processing: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dots = {
    success: 'bg-emerald-500',
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    moderate: 'bg-amber-500',
    danger: 'bg-rose-500',
    critical: 'bg-rose-500',
    high: 'bg-rose-500',
    info: 'bg-sky-500',
    processing: 'bg-sky-500 animate-pulse',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dots[variant] || dots.neutral}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
