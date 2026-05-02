import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OverviewPDF, StudentPDF, ClassPDF, WasteAnalysisPDF, PortalPDF } from './ReportPDF';

export default function ExportPDFButton({ reportType, data, filters }) {
  const { t } = useTranslation();
  
  const getPDFComponent = () => {
    switch (reportType) {
      case 'overview':
        return OverviewPDF;
      case 'student':
        return StudentPDF;
      case 'portal':
        return PortalPDF;
      case 'class':
        return ClassPDF;
      case 'waste':
        return WasteAnalysisPDF;
      default:
        return OverviewPDF;
    }
  };

  const PDFComponent = getPDFComponent();
  const fileName = `GreenChamps_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFComponent data={data} filters={filters} />}
      fileName={fileName}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#1A6B3C] text-white rounded-xl font-medium hover:bg-[#15803d] transition-colors disabled:opacity-50"
    >
      {({ loading, error }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? t('reports.generating') : t('reports.exportPDF')}
        </>
      )}
    </PDFDownloadLink>
  );
}