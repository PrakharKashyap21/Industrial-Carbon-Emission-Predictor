import React from 'react';
import { Factory, Calendar, FileCheck } from 'lucide-react';

export const ReportFilters = ({
  plantId,
  setPlantId,
  periodStart,
  setPeriodStart,
  periodEnd,
  setPeriodEnd,
  fileFormat,
  setFileFormat,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Configure Parameters & Output Format</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
        {/* Plant Filter */}
        <div className="space-y-1">
          <label className="text-slate-400 font-semibold block flex items-center">
            <Factory className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Industrial Facility
          </label>
          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none"
          >
            <option value={1}>Plant Alpha (Steel Facility)</option>
            <option value={2}>Plant Beta (Cement Facility)</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-slate-400 font-semibold block flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Period Start Date
          </label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-slate-400 font-semibold block flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Period End Date
          </label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Export Format */}
        <div className="space-y-1">
          <label className="text-slate-400 font-semibold block flex items-center">
            <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Export File Format
          </label>
          <select
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-sans focus:border-cyan-500 focus:outline-none font-bold"
          >
            <option value="PDF">PDF (Formatted Multi-page Report)</option>
            <option value="EXCEL">Excel Workbook (.xlsx Multi-sheet)</option>
            <option value="CSV">CSV Data File (.csv Tabular)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
