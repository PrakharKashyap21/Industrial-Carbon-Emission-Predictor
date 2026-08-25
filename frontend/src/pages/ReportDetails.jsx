import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, ArrowLeft, CheckCircle2, Shield, Calendar, Factory } from 'lucide-react';
import { getReportById, downloadReportFile } from '../services/reportService';

export const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    const res = await getReportById(id);
    setLoading(false);
    if (res.success) {
      setReport(res.data);
    } else {
      setError(res.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-slate-950 text-cyan-400 text-xs font-semibold">
        Loading Report Details...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-400">Report Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not load details for requested report ID'}</p>
        <Link to="/reports" className="inline-flex items-center space-x-2 text-cyan-400 font-bold text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Report History</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link to="/reports" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Report Center</span>
      </Link>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
              RPT#{report.id}
            </span>
            <h1 className="text-xl font-extrabold text-white mt-1">{report.title}</h1>
            <p className="text-xs text-slate-400">Type: {report.report_type} | Format: {report.file_format}</p>
          </div>

          <button
            onClick={() => downloadReportFile(report.id, `report_${report.id}.${report.file_format.toLowerCase()}`)}
            className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block flex items-center">
              <Factory className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Facility Scope
            </span>
            <div className="text-base font-extrabold text-slate-200 font-mono">
              {report.plant_id ? `Plant #${report.plant_id}` : 'All Industrial Facilities'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Reporting Period
            </span>
            <div className="text-base font-extrabold text-slate-200 font-mono">
              {report.period_start || 'N/A'} to {report.period_end || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {report.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Created At:</span>
            <span className="text-slate-200">{report.created_at}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">User ID:</span>
            <span className="text-slate-200">#{report.created_by || 'System'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
