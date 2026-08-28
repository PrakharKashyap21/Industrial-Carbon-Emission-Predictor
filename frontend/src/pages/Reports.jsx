import React, { useState, useEffect } from 'react';
import { generateReport, previewReport, downloadReportFile } from '../services/reportService';
import { useFilter } from '../context/FilterContext';

import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

import ReportTypeSelector from '../components/reports/ReportTypeSelector';
import ReportFilters from '../components/reports/ReportFilters';
import ExportButtons from '../components/reports/ExportButtons';
import ReportPreviewModal from '../components/reports/ReportPreviewModal';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export const Reports = () => {
  const { selectedPlantId } = useFilter();

  const [selectedType, setSelectedType] = useState('EXECUTIVE');
  const [plantId, setPlantId] = useState(selectedPlantId === 'all' ? 1 : parseInt(selectedPlantId) || 1);
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-31');
  const [fileFormat, setFileFormat] = useState('PDF');

  const [previewData, setPreviewData] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const [generatedReport, setGeneratedReport] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (selectedPlantId !== 'all') {
      setPlantId(parseInt(selectedPlantId) || 1);
    }
  }, [selectedPlantId]);

  useEffect(() => {
    fetchPreview();
  }, [selectedType, plantId, periodStart, periodEnd]);

  const fetchPreview = async () => {
    const res = await previewReport({
      report_type: selectedType,
      plant_id: parseInt(plantId),
      period_start: periodStart,
      period_end: periodEnd,
    });
    if (res.success) {
      setPreviewData(res.data);
    }
  };

  const handleGenerateReport = async () => {
    setGenerateLoading(true);
    setError(null);

    let activePreview = previewData;
    if (!activePreview) {
      const prevRes = await previewReport({
        report_type: selectedType,
        plant_id: parseInt(plantId),
        period_start: periodStart,
        period_end: periodEnd,
      });
      if (prevRes.success) {
        activePreview = prevRes.data;
        setPreviewData(prevRes.data);
      }
    }

    const res = await generateReport({
      report_type: selectedType,
      file_format: fileFormat,
      plant_id: parseInt(plantId),
      period_start: periodStart,
      period_end: periodEnd,
    });
    setGenerateLoading(false);

    if (res.success) {
      setGeneratedReport(res.data);
      setIsPreviewModalOpen(true);
    } else {
      setError(res.error);
    }
  };

  const handleDownloadFile = async (reportId, filename) => {
    setDownloading(true);
    await downloadReportFile(reportId, filename);
    setDownloading(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Industrial Carbon Intelligence Reports"
        subtitle="Select a report type, configure parameters, and generate exact document previews with instant PDF/Excel downloads."
        badge={
          <Badge variant="healthy" dot>
            Report Generator
          </Badge>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Report Generation Error">
          {error}
        </Alert>
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

      {/* Step 3: Export & Preview Button */}
      <ExportButtons
        fileFormat={fileFormat}
        onGenerate={handleGenerateReport}
        loading={generateLoading}
      />

      {/* Document Preview Modal with Download Button */}
      <ErrorBoundary>
        <ReportPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          reportData={previewData}
          generatedReport={generatedReport}
          onDownload={handleDownloadFile}
          downloading={downloading}
        />
      </ErrorBoundary>
    </div>
  );
};

export default Reports;
