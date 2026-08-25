import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import ReportHeader from '../components/reports/ReportHeader';
import ReportTypeSelector from '../components/reports/ReportTypeSelector';
import ReportFilters from '../components/reports/ReportFilters';
import ReportPreview from '../components/reports/ReportPreview';
import ExportButtons from '../components/reports/ExportButtons';
import ReportHistory from '../components/reports/ReportHistory';
import { generateReport, previewReport, listReports, downloadReportFile } from '../services/reportService';

export const Reports = () => {
  const [selectedType, setSelectedType] = useState('EXECUTIVE');
  const [plantId, setPlantId] = useState(1);
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-31');
  const [fileFormat, setFileFormat] = useState('PDF');

  const [previewData, setPreviewData] = useState(null);
  const [reportsHistory, setReportsHistory] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreview();
    fetchHistory();
  }, [selectedType, plantId, periodStart, periodEnd]);

  const fetchPreview = async () => {
    setPreviewLoading(true);
    const res = await previewReport({
      report_type: selectedType,
      plant_id: parseInt(plantId),
      period_start: periodStart,
      period_end: periodEnd,
    });
    setPreviewLoading(false);
    if (res.success) {
      setPreviewData(res.data);
    } else {
      setError(res.error);
    }
  };

  const fetchHistory = async () => {
    const res = await listReports({ plant_id: parseInt(plantId) });
    if (res.success) {
      setReportsHistory(res.data);
    }
  };

  const handleGenerateReport = async () => {
    setGenerateLoading(true);
    setError(null);
    const res = await generateReport({
      report_type: selectedType,
      file_format: fileFormat,
      plant_id: parseInt(plantId),
      period_start: periodStart,
      period_end: periodEnd,
    });
    setGenerateLoading(false);

    if (res.success) {
      fetchHistory();
      // Auto trigger download
      downloadReportFile(res.data.id, `report_${selectedType.toLowerCase()}.${fileFormat.toLowerCase()}`);
    } else {
      setError(res.error);
    }
  };

  const handleDownloadFile = (reportId, filename) => {
    downloadReportFile(reportId, filename);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <ReportHeader />

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-4 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Step 1: Report Type Selector */}
      <ReportTypeSelector selectedType={selectedType} onSelect={setSelectedType} />

      {/* Step 2: Configure Filters */}
      <ReportFilters
        plantId={plantId}
        setPlantId={setPlantId}
        periodStart={periodStart}
        setPeriodStart={setPeriodStart}
        periodEnd={periodEnd}
        setPeriodEnd={setPeriodEnd}
        fileFormat={fileFormat}
        setFileFormat={setFileFormat}
      />

      {/* Step 3: Data Preview */}
      <ReportPreview previewData={previewData} loading={previewLoading} />

      {/* Step 4: Export Buttons */}
      <ExportButtons
        fileFormat={fileFormat}
        onGenerate={handleGenerateReport}
        loading={generateLoading}
      />

      {/* Report History */}
      <ReportHistory reports={reportsHistory} onDownload={handleDownloadFile} />
    </div>
  );
};

export default Reports;
