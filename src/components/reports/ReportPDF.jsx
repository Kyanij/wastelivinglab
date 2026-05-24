import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { logo1, logo2, logo3, logo4 } from '../../firebase/logoImages';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowHeader: {
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
  },
  col: {
    flex: 1,
  },
  col2: { flex: 2 },
  col3: { flex: 3 },
  textRight: { textAlign: 'right' },
  textCenter: { textAlign: 'center' },
  bold: { fontWeight: 'bold' },
  green: { color: '#16a34a' },
  gray: { color: '#6b7280' },
  small: { fontSize: 9 },

  kpiGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  kpiLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiChange: {
    fontSize: 9,
    marginTop: 4,
  },
  positive: { color: '#16a34a' },
  negative: { color: '#ef4444' },

  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    fontSize: 9,
    color: '#16a34a',
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  footerCredit: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'right',
  },

  insightsBox: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
  },
  insightsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
  },
  insightsList: {
    gap: 4,
  },
  insightsItem: {
    fontSize: 10,
    color: '#15803d',
  },

  twoCol: {
    flexDirection: 'row',
    gap: 15,
  },
  colHalf: { flex: 1 },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },

  dateGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  dateGroupTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
    flex: 2,
  },
  dateGroupBadge: {
    fontSize: 8,
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  dateGroupWeight: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  dateGroupEarnings: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
    flex: 1,
    textAlign: 'right',
  },
  subtotalRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f0fdf4',
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    marginBottom: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#dcfce7',
    borderTopWidth: 2,
    borderTopColor: '#16a34a',
    borderRadius: 4,
    marginTop: 6,
  },
  dateGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  barTrack: {
    height: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 7,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 8,
  },
  barFill: {
    height: 14,
    backgroundColor: '#16a34a',
    borderRadius: 7,
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f0fdf4',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeBarTrack: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 6,
  },
  typeBarFill: {
    height: 10,
    borderRadius: 5,
  },
});

const formatDate = (date, locale) => {
  if (!date || date === 'N/A') return 'N/A';
  try {
    if (typeof date?.toDate === 'function') {
      date = date.toDate();
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const opts = locale === 'id' ? { locale: id } : {};
    return format(d, 'dd MMM yyyy', opts);
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};

const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0.00';
  return value.toFixed(decimals);
};

const groupEntriesByDate = (entries, locale) => {
  const groups = {};
  entries.forEach(entry => {
    let entryDate;
    if (typeof entry.date?.toDate === 'function') {
      entryDate = entry.date.toDate();
    } else if (entry.date instanceof Date) {
      entryDate = entry.date;
    } else if (entry.date) {
      entryDate = new Date(entry.date);
    } else {
      entryDate = new Date();
    }
    if (isNaN(entryDate.getTime())) entryDate = new Date();
    const normalizedKey = format(entryDate, 'yyyy-MM-dd');
    if (!groups[normalizedKey]) {
      groups[normalizedKey] = {
        dateLabel: formatDate(entry.date || entryDate, locale),
        sortDate: entryDate,
        items: [],
        totalWeight: 0,
        totalAmount: 0,
      };
    }
    groups[normalizedKey].items.push(entry);
    groups[normalizedKey].totalWeight += entry.weight || 0;
    groups[normalizedKey].totalAmount += entry.amount || 0;
  });
  return Object.values(groups).sort((a, b) => b.sortDate - a.sortDate);
};

const TableHeader = ({ cols }) => (
  <View style={styles.tableHeader}>
    {cols.map((col, i) => (
      <Text key={i} style={[styles.col, col.width ? { flex: col.width } : {}, col.align === 'right' ? styles.textRight : {}]}>
        {col.label}
      </Text>
    ))}
  </View>
);

const TableRow = ({ cols, data }) => (
  <View style={styles.tableRow}>
    {cols.map((col, i) => (
      <Text
        key={i}
        style={[
          styles.col,
          col.width ? { flex: col.width } : {},
          col.align === 'right' ? styles.textRight : {},
          col.bold ? styles.bold : {},
        ]}
      >
        {col.render ? col.render(data[col.key], data) : data[col.key]}
      </Text>
    ))}
  </View>
);

const KPICard = ({ label, value, change, isCurrency = false }) => (
  <View style={styles.kpiCard}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>
      {isCurrency ? formatCurrency(value) : formatNumber(value, 1)}
    </Text>
    {change !== undefined && (
      <Text style={[styles.kpiChange, change >= 0 ? styles.positive : styles.negative]}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </Text>
    )}
  </View>
);

const defaultTrans = {
  title: 'Tabungan Sampah Digital',
  subtitle: 'Model School-Based Living Lab',
  system: 'Waste Collection System',
  overviewTitle: 'Overview Report',
  studentTitle: 'Student Performance Report',
  classTitle: 'Class Performance Report',
  classStudentWasteTitle: 'Class Waste Based on Student Collection Report',
  wasteAnalysisTitle: 'Waste Analysis Report',
  studentCollectionTitle: 'Student Collection Report',
  dateRange: 'Date Range', period: 'Period', class: 'Class', wasteType: 'Waste Type',
  all: 'All', studentId: 'Student ID', joined: 'Joined', kg: 'kg',
  totalWaste: 'Total Waste', totalEarnings: 'Total Earnings',
  activeStudents: 'Active Students', avgPerStudent: 'Avg per Student',
  totalEntries: 'Total Entries', avgPerEntry: 'Avg per Entry',
  activeClasses: 'Active Classes', totalStudents: 'Total Students',
  avgPerClass: 'Avg per Class', wasteTypesCount: 'Waste Types',
  topStudents: 'Top Students', classRankings: 'Class Rankings',
  wasteTypeSummary: 'Waste Type Summary', wasteEntries: 'Waste Entries',
  collectionDetails: 'Collection Details', insights: 'Insights',
  tableRank: '#', tableStudent: 'Student', tableClass: 'Class',
  tableWeight: 'Weight (kg)', tableEarnings: 'Earnings',
  tableDate: 'Date', tableWasteType: 'Waste Type', tablePrice: 'Price',
  tableAmount: 'Amount', tablePercentage: 'Percentage', tableAvgPrice: 'Avg Price',
  wasteIncreased: 'Waste collection increased by {{percent}}% compared to previous period.',
  classLeading: 'Class {{class}} is leading with {{percent}}% of total waste collected.',
  classesActive: '{{count}} classes were active during this period.',
  mostCollected: '{{type}} is the most collected waste ({{percent}}%).',
  secondMost: '{{type}} is the second most ({{percent}}%).',
  moreEntries: '... and {{count}} more entries',
  pageInfo: 'Page {{page}} of {{total}} | Generated: {{date}}',
  generatedOn: 'Generated on {{date}}',
  locale: 'en',
};

function tpl(text, vars) {
  return Object.entries(vars).reduce((str, [key, val]) => str.replace(`{{${key}}}`, val), text);
}

export const OverviewPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo, selectedClass, selectedWasteType } = filters || {};
  const kpis = data?.kpis || {};
  const topStudents = data?.topStudents || [];
  const trans = { ...defaultTrans, ...translations };
  const dateRangeStr = `${formatDate(dateFrom, trans.locale)} - ${formatDate(dateTo, trans.locale)}`;
  const selectedClassLabel = selectedClass && selectedClass !== 'all' ? selectedClass : trans.all;
  const selectedWasteLabel = selectedWasteType && selectedWasteType !== 'all' ? selectedWasteType : trans.all;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.overviewTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>
                {trans.dateRange}: {dateRangeStr} | {trans.class}: {selectedClassLabel} | {trans.wasteType}: {selectedWasteLabel}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={kpis.totalWaste?.value || 0} change={kpis.totalWaste?.change} />
          <KPICard label={trans.totalEarnings} value={kpis.totalEarnings?.value || 0} change={kpis.totalEarnings?.change} isCurrency />
          <KPICard label={trans.activeStudents} value={kpis.activeStudents?.value || 0} change={kpis.activeStudents?.change} />
          <KPICard label={trans.avgPerStudent} value={kpis.avgPerStudent?.value || 0} change={kpis.avgPerStudent?.change} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.topStudents}</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: trans.tableRank, width: 0.5 },
                { label: trans.tableStudent, width: 2 },
                { label: trans.tableClass, width: 1 },
                { label: trans.tableWeight, width: 1, align: 'right', bold: true },
                { label: trans.tableEarnings, width: 1.5, align: 'right' },
              ]}
            />
            {topStudents.slice(0, 10).map((student, index) => (
              <TableRow
                key={student.studentId}
                cols={[
                  { key: 'index', render: () => index + 1, width: 0.5 },
                  { key: 'studentName', width: 2 },
                  { key: 'studentClass', width: 1, render: (val) => <Text style={styles.badge}>{val}</Text> },
                  { key: 'totalWaste', width: 1, align: 'right', bold: true, render: (val) => formatNumber(val) },
                  { key: 'totalEarnings', width: 1.5, align: 'right', render: (val) => formatCurrency(val) },
                ]}
                data={student}
              />
            ))}
          </View>
        </View>

        <View style={styles.insightsBox}>
          <Text style={styles.insightsTitle}>{trans.insights}</Text>
          <View style={styles.insightsList}>
            {kpis.totalWaste?.change > 0 && (
              <Text style={styles.insightsItem}>
                • {tpl(trans.wasteIncreased, { percent: Math.abs(kpis.totalWaste.change).toFixed(1) })}
              </Text>
            )}
            {data?.topClass && (
              <Text style={styles.insightsItem}>
                • {tpl(trans.classLeading, { class: data.topClass, percent: '34.8' })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            tpl(trans.pageInfo, {
              page: pageNumber,
              total: totalPages,
              date: format(new Date(), 'dd MMM yyyy HH:mm'),
            })
          } />
          <Text style={styles.footerCredit}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>
      </Page>
    </Document>
  );
};

export const StudentPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const student = data?.student || {};
  const entries = data?.entries || [];
  const trans = { ...defaultTrans, ...translations };
  const grouped = groupEntriesByDate(entries, trans.locale);
  const grandTotalWeight = grouped.reduce((s, g) => s + g.totalWeight, 0);
  const grandTotalAmount = grouped.reduce((s, g) => s + g.totalAmount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.studentTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>{trans.dateRange}: {formatDate(dateFrom, trans.locale)} - {formatDate(dateTo, trans.locale)}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={[styles.row, styles.rowHeader, { marginBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{student.name}</Text>
            <Text style={styles.gray}>{trans.class}: {student.class} | {trans.studentId}: {student.studentId}</Text>
            <Text style={styles.gray}>{trans.joined}: {student.createdAt ? formatDate(student.createdAt.toDate(), trans.locale) : 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={student.totalWaste || 0} />
          <KPICard label={trans.totalEarnings} value={student.totalEarnings || 0} isCurrency />
          <KPICard label={trans.totalEntries} value={student.totalEntries || 0} />
          <KPICard label={trans.avgPerEntry} value={student.avgPerEntry || 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.collectionDetails}</Text>
          <View style={styles.table}>
            {grouped.map((group, gi) => (
              <View key={gi} wrap={false}>
                <View style={styles.dateGroupHeader}>
                  <Text style={styles.dateGroupTitle}>{group.dateLabel}</Text>
                  <Text style={styles.dateGroupBadge}>{group.items.length} {trans.dateEntries}</Text>
                  <Text style={styles.dateGroupWeight}>{formatNumber(group.totalWeight)} {trans.kg}</Text>
                  <Text style={styles.dateGroupEarnings}>{formatCurrency(group.totalAmount)}</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.col, { flex: 1.5 }]}>{trans.tableWasteType}</Text>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>{trans.tableWeight}</Text>
                  <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}>{trans.tablePrice}</Text>
                  <Text style={[styles.col, { flex: 1.2, textAlign: 'right' }]}>{trans.tableAmount}</Text>
                </View>
                {group.items.map((item, ii) => (
                  <View key={ii} style={styles.tableRow}>
                    <Text style={[styles.col, { flex: 1.5 }]}>{item.wasteTypeName || item.wasteType || 'Other'}</Text>
                    <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>{formatNumber(item.weight)}</Text>
                    <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}>{formatCurrency(item.rate || 0)}</Text>
                    <Text style={[styles.col, { flex: 1.2, textAlign: 'right' }]}>{formatCurrency(item.amount || 0)}</Text>
                  </View>
                ))}
                <View style={styles.subtotalRow}>
                  <Text style={[styles.col, { flex: 1.5, fontWeight: 'bold' }]}>{trans.subtotal}</Text>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatNumber(group.totalWeight)} {trans.kg}</Text>
                  <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}></Text>
                  <Text style={[styles.col, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(group.totalAmount)}</Text>
                </View>
              </View>
            ))}
            {grouped.length > 0 && (
              <View style={styles.grandTotalRow}>
                <Text style={[styles.col, { flex: 1.5, fontWeight: 'bold' }]}>{trans.grandTotal}</Text>
                <Text style={[styles.col, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatNumber(grandTotalWeight)} {trans.kg}</Text>
                <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}></Text>
                <Text style={[styles.col, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(grandTotalAmount)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            tpl(trans.pageInfo, {
              page: pageNumber,
              total: totalPages,
              date: format(new Date(), 'dd MMM yyyy HH:mm'),
            })
          } />
          <Text style={styles.footerCredit}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>
      </Page>
    </Document>
  );
};

export const ClassPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const isClassSelected = data?.isClassSelected || false;
  const ranking = isClassSelected
    ? (data?.charts?.studentRanking || [])
    : (data?.charts?.classDistribution || []);
  const kpis = data?.kpis || {};
  const trans = { ...defaultTrans, ...translations };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.classStudentWasteTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>{trans.dateRange}: {formatDate(dateFrom, trans.locale)} - {formatDate(dateTo, trans.locale)}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={kpis.totalWaste?.value || 0} />
          <KPICard label={trans.totalEarnings} value={kpis.totalEarnings?.value || 0} isCurrency />
          <KPICard label={isClassSelected ? trans.activeStudents : trans.activeClasses} value={isClassSelected ? kpis.activeStudents?.value || 0 : kpis.activeClasses?.value || 0} />
          <KPICard label={isClassSelected ? trans.avgPerStudent : trans.avgPerClass} value={isClassSelected ? kpis.avgPerStudent?.value || 0 : kpis.avgPerClass?.value || 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.classRankings}</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: isClassSelected ? trans.tableStudent : trans.tableClass, width: 1.5 },
                { label: trans.tableWeight, width: 1, align: 'right' },
                { label: isClassSelected ? trans.tableEarnings : trans.activeStudents, width: 1, align: 'right' },
              ]}
            />
            {ranking.map((item, index) => (
              <TableRow
                key={isClassSelected ? item.studentId : item.class}
                cols={[
                  { key: isClassSelected ? 'studentName' : 'class', width: 1.5, bold: true },
                  { key: 'totalWaste', width: 1, align: 'right', render: (val) => `${formatNumber(val)} ${trans.kg}` },
                  {
                    width: 1,
                    align: 'right',
                    render: (val, row) => isClassSelected
                      ? formatCurrency(row.totalEarnings || 0)
                      : `${row.studentCount || 0}`,
                  },
                ]}
                data={item}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            tpl(trans.pageInfo, {
              page: pageNumber,
              total: totalPages,
              date: format(new Date(), 'dd MMM yyyy HH:mm'),
            })
          } />
          <Text style={styles.footerCredit}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>
      </Page>
    </Document>
  );
};

export const WasteAnalysisPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const typeData = data?.summary || [];
  const kpis = data?.kpis || {};
  const trans = { ...defaultTrans, ...translations };
  const totalWasteValue = kpis.totalWaste?.value || 1;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.wasteAnalysisTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>{trans.dateRange}: {formatDate(dateFrom, trans.locale)} - {formatDate(dateTo, trans.locale)}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={kpis.totalWaste?.value || 0} />
          <KPICard label={trans.totalEarnings} value={kpis.totalEarnings?.value || 0} isCurrency />
          <KPICard label={trans.totalEntries} value={kpis.totalEntries?.value || 0} />
          <KPICard label={trans.wasteTypesCount} value={kpis.wasteTypes?.value || 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.wasteTypeSummary}</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: trans.tableWasteType, width: 1.5 },
                { label: trans.tableWeight, width: 1.5, align: 'right' },
                { label: trans.tablePercentage, width: 1, align: 'right' },
                { label: trans.tableEarnings, width: 1.5, align: 'right' },
                { label: trans.tableAvgPrice, width: 1, align: 'right' },
              ]}
            />
            {typeData.map((type, index) => (
              <TableRow
                key={index}
                cols={[
                  { key: 'name', width: 1.5, bold: true },
                  { key: 'weight', width: 1.5, align: 'right', render: (val) => formatNumber(val) },
                  {
                    width: 1,
                    align: 'right',
                    render: (val, row) => `${((row.weight / totalWasteValue) * 100).toFixed(1)}%`,
                  },
                  { key: 'earnings', width: 1.5, align: 'right', render: (val) => formatCurrency(val) },
                  { width: 1, align: 'right', render: (val, row) => formatCurrency(row.weight > 0 ? row.earnings / row.weight : 0) },
                ]}
                data={type}
              />
            ))}
          </View>
        </View>

        <View style={styles.insightsBox}>
          <Text style={styles.insightsTitle}>{trans.insights}</Text>
          <View style={styles.insightsList}>
            {typeData[0] && (
              <Text style={styles.insightsItem}>
                • {tpl(trans.mostCollected, { type: typeData[0].name, percent: ((typeData[0].weight / totalWasteValue) * 100).toFixed(1) })}
              </Text>
            )}
            {typeData[1] && (
              <Text style={styles.insightsItem}>
                • {tpl(trans.secondMost, { type: typeData[1].name, percent: ((typeData[1].weight / totalWasteValue) * 100).toFixed(1) })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            tpl(trans.pageInfo, {
              page: pageNumber,
              total: totalPages,
              date: format(new Date(), 'dd MMM yyyy HH:mm'),
            })
          } />
          <Text style={styles.footerCredit}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>
      </Page>
    </Document>
  );
};

export const PortalPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const student = data?.student || {};
  const entries = data?.entries || [];
  const trans = { ...defaultTrans, ...translations };
  const grouped = groupEntriesByDate(entries, trans.locale);
  const grandTotalWeight = grouped.reduce((s, g) => s + g.totalWeight, 0);
  const grandTotalAmount = grouped.reduce((s, g) => s + g.totalAmount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.studentCollectionTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>
                {trans.period}: {formatDate(dateFrom, trans.locale)} - {formatDate(dateTo, trans.locale)}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={[styles.row, styles.rowHeader, { marginBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{student.name || 'N/A'}</Text>
            <Text style={styles.gray}>{trans.class}: {student.class || 'N/A'} | {trans.studentId}: {student.studentId || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={student.totalWaste || grandTotalWeight} />
          <KPICard label={trans.totalEarnings} value={student.totalEarnings || grandTotalAmount} isCurrency />
          <KPICard label={trans.totalEntries} value={entries.length} />
          <KPICard label={trans.avgPerEntry} value={entries.length > 0 ? (student.totalWaste || grandTotalWeight) / entries.length : 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.collectionDetails}</Text>
          <View style={styles.table}>
            {grouped.map((group, gi) => (
              <View key={gi} wrap={false}>
                <View style={styles.dateGroupHeader}>
                  <Text style={styles.dateGroupTitle}>{group.dateLabel}</Text>
                  <Text style={styles.dateGroupBadge}>{group.items.length} {trans.dateEntries}</Text>
                  <Text style={styles.dateGroupWeight}>{formatNumber(group.totalWeight)} {trans.kg}</Text>
                  <Text style={styles.dateGroupEarnings}>{formatCurrency(group.totalAmount)}</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.col, { flex: 1.5 }]}>{trans.tableWasteType}</Text>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>{trans.tableWeight}</Text>
                  <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}>{trans.tablePrice}</Text>
                  <Text style={[styles.col, { flex: 1.2, textAlign: 'right' }]}>{trans.tableAmount}</Text>
                </View>
                {group.items.map((item, ii) => (
                  <View key={ii} style={styles.tableRow}>
                    <Text style={[styles.col, { flex: 1.5 }]}>{item.wasteTypeName || item.wasteType || 'Other'}</Text>
                    <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>{formatNumber(item.weight)}</Text>
                    <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}>{formatCurrency(item.rate || 0)}</Text>
                    <Text style={[styles.col, { flex: 1.2, textAlign: 'right' }]}>{formatCurrency(item.amount || 0)}</Text>
                  </View>
                ))}
                <View style={styles.subtotalRow}>
                  <Text style={[styles.col, { flex: 1.5, fontWeight: 'bold' }]}>{trans.subtotal}</Text>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatNumber(group.totalWeight)} {trans.kg}</Text>
                  <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}></Text>
                  <Text style={[styles.col, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(group.totalAmount)}</Text>
                </View>
              </View>
            ))}
            {grouped.length > 0 && (
              <View style={styles.grandTotalRow}>
                <Text style={[styles.col, { flex: 1.5, fontWeight: 'bold' }]}>{trans.grandTotal}</Text>
                <Text style={[styles.col, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatNumber(grandTotalWeight)} {trans.kg}</Text>
                <Text style={[styles.col, { flex: 0.8, textAlign: 'right' }]}></Text>
                <Text style={[styles.col, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(grandTotalAmount)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.footer, { marginTop: 20 }]}>
          <Text style={styles.footerText}>
            {tpl(trans.generatedOn, { date: format(new Date(), 'dd MMM yyyy HH:mm') })} | {trans.title} - {trans.system}
          </Text>
          <Text style={[styles.footerCredit]}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) =>
          tpl(trans.pageInfo, {
            page: pageNumber,
            total: totalPages,
            date: format(new Date(), 'dd MMM yyyy HH:mm'),
          })
        } fixed />
      </Page>
    </Document>
  );
};

export const ClassWastePDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo, selectedClass } = filters || {};
  const ranking = data?.ranking || [];
  const kpis = data?.kpis || {};
  const wasteTypeBreakdown = data?.wasteTypeBreakdown || [];
  const isClassSelected = data?.isClassSelected;
  const trans = { ...defaultTrans, ...translations };
  const dateRangeStr = `${formatDate(dateFrom, trans.locale)} - ${formatDate(dateTo, trans.locale)}`;
  const classLabel = selectedClass && selectedClass !== 'all' ? selectedClass : trans.all;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trans.classWasteTitle}</Text>
              <Text style={styles.subtitle}>{trans.title}</Text>
              <Text style={styles.subtitle}>{trans.subtitle}</Text>
              <Text style={styles.dateRange}>
                {trans.dateRange}: {dateRangeStr} | {trans.class}: {classLabel}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={logo1} style={styles.logoImage} />
              <Image src={logo2} style={styles.logoImage} />
              <Image src={logo3} style={styles.logoImage} />
              <Image src={logo4} style={styles.logoImage} />
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label={trans.totalWaste} value={kpis.totalWaste || 0} />
          <KPICard label={trans.totalEarnings} value={kpis.totalEarnings || 0} isCurrency />
          <KPICard label={trans.totalEntries} value={kpis.totalEntries || 0} />
          <KPICard label={trans.avgPerEntry} value={kpis.avgPerEntry || 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trans.classRankings}</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: trans.tableClass, width: 1.2 },
                { label: trans.tableWeight, width: 1, align: 'right' },
                { label: trans.tableEarnings, width: 1, align: 'right' },
              ]}
            />
            {ranking.map((cls, index) => {
              return (
                <View key={cls.className} style={styles.barRow}>
                  <Text style={[styles.col, { flex: 1.2, fontWeight: 'bold' }]}>{cls.className}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${cls.barPercent || 0}%` }]} />
                  </View>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right', fontSize: 9 }]}>
                    {formatNumber(cls.totalWaste)} {trans.kg}
                  </Text>
                  <Text style={[styles.col, { flex: 1, textAlign: 'right', fontSize: 9 }]}>
                    {formatCurrency(cls.totalEarnings)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {isClassSelected && wasteTypeBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{trans.wasteTypeSummary}</Text>
            <View style={styles.table}>
              <TableHeader
                cols={[
                  { label: trans.tableWasteType, width: 1.2 },
                  { label: trans.tablePercentage, width: 0.8, align: 'right' },
                  { label: trans.tableWeight, width: 0.8, align: 'right' },
                ]}
              />
              {wasteTypeBreakdown.map((type, idx) => {
                const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
                return (
                  <View key={type.name} style={styles.typeRow}>
                    <Text style={[styles.col, { flex: 1.2, fontSize: 9 }]}>{type.name}</Text>
                    <View style={styles.typeBarTrack}>
                      <View style={[styles.typeBarFill, { width: `${type.barPercent || 0}%`, backgroundColor: colors[idx % colors.length] }]} />
                    </View>
                    <Text style={[styles.col, { flex: 0.8, textAlign: 'right', fontSize: 9 }]}>
                      {type.percentage}%
                    </Text>
                    <Text style={[styles.col, { flex: 0.8, textAlign: 'right', fontSize: 9 }]}>
                      {formatNumber(type.weight)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {data?.topClass && (
          <View style={styles.insightsBox}>
            <Text style={styles.insightsTitle}>{trans.insights}</Text>
            <View style={styles.insightsList}>
              <Text style={styles.insightsItem}>
                • {tpl(trans.classLeading, { class: data.topClass.className, percent: data.topClassPercent })}
              </Text>
              <Text style={styles.insightsItem}>
                • {tpl(trans.classesActive, { count: kpis.activeClasses })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            tpl(trans.pageInfo, {
              page: pageNumber,
              total: totalPages,
              date: format(new Date(), 'dd MMM yyyy HH:mm'),
            })
          } />
          <Text style={styles.footerCredit}>Research by Apri Yulda, S.K.M., M.K.M.</Text>
        </View>
      </Page>
    </Document>
  );
};