import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OverviewPDF, StudentPDF, ClassPDF, WasteAnalysisPDF, PortalPDF, ClassWastePDF } from './ReportPDF';

export default function ExportPDFButton({ reportType, data, filters }) {
  const { t, i18n } = useTranslation();

  const pdfTranslations = {
    title: t('pdf.title'),
    subtitle: t('pdf.subtitle'),
    system: t('pdf.system'),
    overviewTitle: t('pdf.overviewTitle'),
    studentTitle: t('pdf.studentTitle'),
    classTitle: t('pdf.classTitle'),
    classStudentWasteTitle: t('pdf.classStudentWasteTitle'),
    classWasteTitle: t('pdf.classWasteTitle'),
    wasteAnalysisTitle: t('pdf.wasteAnalysisTitle'),
    studentCollectionTitle: t('pdf.studentCollectionTitle'),
    dateRange: t('pdf.dateRange'),
    period: t('pdf.period'),
    class: t('pdf.class'),
    wasteType: t('pdf.wasteType'),
    all: t('pdf.all'),
    studentId: t('pdf.studentId'),
    joined: t('pdf.joined'),
    kg: t('pdf.kg'),
    totalWaste: t('pdf.totalWaste'),
    totalEarnings: t('pdf.totalEarnings'),
    activeStudents: t('pdf.activeStudents'),
    avgPerStudent: t('pdf.avgPerStudent'),
    totalEntries: t('pdf.totalEntries'),
    avgPerEntry: t('pdf.avgPerEntry'),
    activeClasses: t('pdf.activeClasses'),
    totalStudents: t('pdf.totalStudents'),
    avgPerClass: t('pdf.avgPerClass'),
    wasteTypesCount: t('pdf.wasteTypesCount'),
    topStudents: t('pdf.topStudents'),
    classRankings: t('pdf.classRankings'),
    wasteTypeSummary: t('pdf.wasteTypeSummary'),
    wasteEntries: t('pdf.wasteEntries'),
    collectionDetails: t('pdf.collectionDetails'),
    insights: t('pdf.insights'),
    tableRank: t('pdf.tableRank'),
    tableStudent: t('pdf.tableStudent'),
    tableClass: t('pdf.tableClass'),
    tableWeight: t('pdf.tableWeight'),
    tableEarnings: t('pdf.tableEarnings'),
    tableDate: t('pdf.tableDate'),
    tableWasteType: t('pdf.tableWasteType'),
    tablePrice: t('pdf.tablePrice'),
    tableAmount: t('pdf.tableAmount'),
    tablePercentage: t('pdf.tablePercentage'),
    tableAvgPrice: t('pdf.tableAvgPrice'),
    wasteIncreased: t('pdf.wasteIncreased'),
    classLeading: t('pdf.classLeading'),
    classesActive: t('pdf.classesActive'),
    mostCollected: t('pdf.mostCollected'),
    secondMost: t('pdf.secondMost'),
    moreEntries: t('pdf.moreEntries'),
    pageInfo: t('pdf.pageInfo'),
    generatedOn: t('pdf.generatedOn'),
    locale: i18n.language,
    subtotal: t('pdf.subtotal'),
    grandTotal: t('pdf.grandTotal'),
    dateEntries: t('pdf.dateEntries'),
  };

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
      case 'classWaste':
        return ClassWastePDF;
      default:
        return OverviewPDF;
    }
  };

  const PDFComponent = getPDFComponent();
  const fileName = `TabunganSampahDigital_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFComponent data={data} filters={filters} translations={pdfTranslations} />}
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