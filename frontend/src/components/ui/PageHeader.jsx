import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  badge,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
