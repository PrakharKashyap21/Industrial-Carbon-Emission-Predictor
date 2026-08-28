import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  badge,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
};

export default PageHeader;
