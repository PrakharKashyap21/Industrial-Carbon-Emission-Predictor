import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white ${className}`}>
    <table className="w-full text-left text-sm text-slate-700">{children}</table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`transition-colors ${onClick ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/40'} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>
);

export default Table;
