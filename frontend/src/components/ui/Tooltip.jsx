import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const Tooltip = ({
  content,
  children,
  position = 'top',
  icon = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        icon && <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
      )}

      {isVisible && content && (
        <div
          className={`absolute z-40 px-3 py-1.5 text-xs text-white bg-slate-900 rounded-lg shadow-lg max-w-xs whitespace-normal pointer-events-none border border-slate-700 ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
