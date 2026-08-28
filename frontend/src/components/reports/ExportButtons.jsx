import React from 'react';
import { Download, FileText, FileSpreadsheet, Table, Loader2 } from 'lucide-react';

export const ExportButtons = ({ fileFormat, onGenerate, loading }) => {
  const getFormatIcon = () => {
    switch (fileFormat) {
      case 'EXCEL':
        return <FileSpreadsheet className="w-4 h-4 mr-2" />;
      case 'CSV':
        return <Table className="w-4 h-4 mr-2" />;
      case 'PDF':
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Ready to Generate Document</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Click generate to build the {fileFormat} file, store metadata, record audit log, and enable instant download.
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full sm:w-auto py-3 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Generating {fileFormat} Report...</span>
          </>
        ) : (
          <>
            {getFormatIcon()}
            <span>Generate & Preview {fileFormat} Report</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButtons;
