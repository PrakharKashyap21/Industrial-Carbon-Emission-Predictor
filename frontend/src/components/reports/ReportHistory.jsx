import React from 'react';
import { History, Download, FileText, FileSpreadsheet, Table, CheckCircle2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportHistory = ({ reports, onDownload }) => {
  if (!reports || reports.length === 0) return null;

  const getFormatBadge = (fmt) => {
    switch (fmt) {
      case 'EXCEL':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center w-fit">
            <FileSpreadsheet className="w-3 h-3 mr-1" /> EXCEL (.xlsx)
          </span>
        );
      case 'CSV':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 flex items-center w-fit">
            <Table className="w-3 h-3 mr-1" /> CSV (.csv)
          </span>
        );
      case 'PDF':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center w-fit">
            <FileText className="w-3 h-3 mr-1" /> PDF (.pdf)
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <History className="w-4 h-4 mr-1.5 text-cyan-400" />
            Report History & Download Center
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Audit trail of generated executive, analytics, prediction, and optimization reports.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950/50">
              <th className="py-3 px-4">Report ID</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Report Type</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Generated Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-400">RPT#{r.id}</td>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">{r.title}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{r.report_type}</td>
                <td className="py-3 px-4 font-sans">{getFormatBadge(r.file_format)}</td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">
                  {r.created_at?.split('T')[0]} {r.created_at?.split('T')[1]?.substring(0, 8)}
                </td>
                <td className="py-3 px-4 font-sans">
                  <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-sans flex items-center justify-end space-x-2">
                  <Link
                    to={`/reports/${r.id}`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => onDownload(r.id, `${r.title.toLowerCase().replace(/\s+/g, '_')}.${r.file_format.toLowerCase()}`)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-bold transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportHistory;
