import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, AlertCircle } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  action,
  className = '',
}) => {
  const types = {
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-500',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: XCircle,
      iconColor: 'text-rose-500',
    },
    reliability: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      icon: AlertCircle,
      iconColor: 'text-indigo-500',
    },
  };

  const config = types[type] || types.info;
  const IconComponent = config.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${config.bg} ${className}`}>
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold leading-tight mb-0.5">{title}</h4>}
        <div className="text-xs opacity-90 leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
};

export default Alert;
