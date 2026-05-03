import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

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
});

const formatDate = (date) => {
  if (!date || date === 'N/A') return 'N/A';
  try {
    if (typeof date?.toDate === 'function') {
      date = date.toDate();
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, 'dd MMM yyyy');
  } catch (e) {
    return 'N/A';
  }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'Rp 0.00';
  return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0.00';
  return value.toFixed(decimals);
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

const KPICard = ({ label, value, change, prefix = '', suffix = '', isCurrency = false }) => (
  <View style={styles.kpiCard}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>
      {prefix}
      {isCurrency ? formatCurrency(value) : formatNumber(value, 1)}
      {suffix}
    </Text>
    {change !== undefined && (
      <Text style={[styles.kpiChange, change >= 0 ? styles.positive : styles.negative]}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </Text>
    )}
  </View>
);

export const OverviewPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo, selectedClass, selectedWasteType } = filters || {};
  const kpis = data?.kpis || {};
  const topStudents = data?.topStudents || [];
  const dateRangeStr = `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
  const trans = translations || { title: 'Tabungan Sampah Digital', subtitle: 'Model School-Based Living Lab', system: 'Waste Collection System' };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Overview Report</Text>
          <Text style={styles.subtitle}>{trans.title}</Text>
          <Text style={styles.subtitle}>{trans.subtitle}</Text>
          <Text style={styles.dateRange}>
            Date Range: {dateRangeStr} | Class: {selectedClass === 'all' ? 'All' : selectedClass} | Waste Type: {selectedWasteType === 'all' ? 'All' : selectedWasteType}
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label="Total Waste" value={kpis.totalWaste?.value || 0} change={kpis.totalWaste?.change} suffix=" kg" />
          <KPICard label="Total Earnings" value={kpis.totalEarnings?.value || 0} change={kpis.totalEarnings?.change} isCurrency />
          <KPICard label="Active Students" value={kpis.activeStudents?.value || 0} change={kpis.activeStudents?.change} />
          <KPICard label="Avg per Student" value={kpis.avgPerStudent?.value || 0} change={kpis.avgPerStudent?.change} suffix=" kg" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Students</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: '#', width: 0.5 },
                { label: 'Student', width: 2 },
                { label: 'Class', width: 1 },
                { label: 'Weight (kg)', width: 1, align: 'right', bold: true },
                { label: 'Earnings', width: 1.5, align: 'right' },
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
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          <View style={styles.insightsList}>
            {kpis.totalWaste?.change > 0 && (
              <Text style={styles.insightsItem}>
                • Waste collection increased by {Math.abs(kpis.totalWaste.change).toFixed(1)}% compared to previous period.
              </Text>
            )}
            {data?.topClass && (
              <Text style={styles.insightsItem}>
                • Class {data.topClass} is leading with 34.8% of total waste collected.
              </Text>
            )}
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export const StudentPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const student = data?.student || {};
  const entries = data?.entries || [];
  const trans = translations || { title: 'Tabungan Sampah Digital', subtitle: 'Model School-Based Living Lab', system: 'Waste Collection System' };
  
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Student Performance Report</Text>
          <Text style={styles.subtitle}>{trans.title}</Text>
          <Text style={styles.subtitle}>{trans.subtitle}</Text>

          <Text style={styles.dateRange}>Date Range: {formatDate(dateFrom)} - {formatDate(dateTo)}</Text>
        </View>

        <View style={[styles.row, styles.rowHeader, { marginBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{student.name}</Text>
            <Text style={styles.gray}>Class: {student.class} | Student ID: {student.studentId}</Text>
            <Text style={styles.gray}>Joined: {student.createdAt ? formatDate(student.createdAt.toDate()) : 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label="Total Waste" value={student.totalWaste || 0} suffix=" kg" />
          <KPICard label="Total Earnings" value={student.totalEarnings || 0} isCurrency />
          <KPICard label="Total Entries" value={student.totalEntries || 0} />
          <KPICard label="Avg per Entry" value={student.avgPerEntry || 0} suffix=" kg" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Entries</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: 'Date', width: 1.5 },
                { label: 'Waste Type', width: 1.5 },
                { label: 'Weight (kg)', width: 1, align: 'right' },
                { label: 'Rate', width: 0.8, align: 'right' },
                { label: 'Amount', width: 1.2, align: 'right' },
              ]}
            />
            {entries.slice(0, 30).map((entry, index) => (
              <TableRow
                key={index}
                cols={[
                  { key: 'date', width: 1.5, render: (val) => formatDate(val) },
                  { key: 'wasteTypeName', width: 1.5 },
                  { key: 'weight', width: 1, align: 'right', render: (val) => formatNumber(val) },
                  { key: 'rate', width: 0.8, align: 'right', render: (val) => formatCurrency(val) },
                  { key: 'amount', width: 1.2, align: 'right', render: (val) => formatCurrency(val) },
                ]}
                data={{
                  date: entry.date,
                  wasteTypeName: entry.wasteTypeName,
                  weight: entry.weight,
                  rate: entry.rate,
                  amount: entry.amount,
                }}
              />
            ))}
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export const ClassPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const classData = data?.ranking || [];
  const kpis = data?.kpis || {};
  const trans = translations || { title: 'Tabungan Sampah Digital', subtitle: 'Model School-Based Living Lab', system: 'Waste Collection System' };
  
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Class Performance Report</Text>
          <Text style={styles.subtitle}>{trans.title}</Text>
          <Text style={styles.subtitle}>{trans.subtitle}</Text>
          <Text style={styles.dateRange}>Date Range: {formatDate(dateFrom)} - {formatDate(dateTo)}</Text>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label="Total Waste" value={kpis.totalWaste?.value || 0} suffix=" kg" />
          <KPICard label="Active Classes" value={kpis.activeClasses?.value || 0} />
          <KPICard label="Total Students" value={kpis.totalStudents?.value || 0} />
          <KPICard label="Avg per Class" value={kpis.avgPerClass?.value || 0} suffix=" kg" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Rankings</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: 'Rank', width: 0.8 },
                { label: 'Class', width: 1 },
                { label: 'Total Waste', width: 1.5, align: 'right' },
                { label: 'Avg/Student', width: 1.5, align: 'right' },
              ]}
            />
            {classData.map((cls, index) => (
              <TableRow
                key={cls.class}
                cols={[
                  {
                    width: 0.8,
                    render: () =>
                      index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`,
                  },
                  { key: 'class', width: 1, bold: true },
                  { key: 'totalWaste', width: 1.5, align: 'right', render: (val) => `${formatNumber(val)} kg` },
                  { key: 'avgPerStudent', width: 1.5, align: 'right', render: (val) => `${formatNumber(val)} kg` },
                ]}
                data={cls}
              />
            ))}
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export const WasteAnalysisPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const typeData = data?.summary || [];
  const kpis = data?.kpis || {};
  const trans = translations || { title: 'Tabungan Sampah Digital', subtitle: 'Model School-Based Living Lab', system: 'Waste Collection System' };
  
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Waste Analysis Report</Text>
          <Text style={styles.subtitle}>{trans.title}</Text>
          <Text style={styles.subtitle}>{trans.subtitle}</Text>

          <Text style={styles.dateRange}>Date Range: {formatDate(dateFrom)} - {formatDate(dateTo)}</Text>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label="Total Waste" value={kpis.totalWaste?.value || 0} suffix=" kg" />
          <KPICard label="Total Earnings" value={kpis.totalEarnings?.value || 0} isCurrency />
          <KPICard label="Total Entries" value={kpis.totalEntries?.value || 0} />
          <KPICard label="Waste Types" value={kpis.wasteTypes?.value || 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Type Summary</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: 'Waste Type', width: 1.5 },
                { label: 'Weight (kg)', width: 1.5, align: 'right' },
                { label: 'Percentage', width: 1, align: 'right' },
                { label: 'Earnings', width: 1.5, align: 'right' },
                { label: 'Avg Rate', width: 1, align: 'right' },
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
                    render: (val, row) => `${((row.weight / (kpis.totalWaste?.value || 1)) * 100).toFixed(1)}%`,
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
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          <View style={styles.insightsList}>
            {typeData[0] && (
              <Text style={styles.insightsItem}>
                • {typeData[0].name} is the most collected waste ({(typeData[0].weight / (kpis.totalWaste?.value || 1) * 100).toFixed(1)}%).
              </Text>
            )}
            {typeData[1] && (
              <Text style={styles.insightsItem}>
                • {typeData[1].name} is the second most ({(typeData[1].weight / (kpis.totalWaste?.value || 1) * 100).toFixed(1)}%).
              </Text>
            )}
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export const PortalPDF = ({ data, filters, translations }) => {
  const { dateFrom, dateTo } = filters || {};
  const student = data?.student || {};
  const entries = data?.entries || [];
  const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const trans = translations || { title: 'Tabungan Sampah Digital', subtitle: 'Model School-Based Living Lab', system: 'Waste Collection System' };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Student Collection Report</Text>
          <Text style={styles.subtitle}>{trans.title}</Text>
          <Text style={styles.subtitle}>{trans.subtitle}</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(dateFrom)} - {formatDate(dateTo)}
          </Text>
        </View>

        <View style={[styles.row, styles.rowHeader, { marginBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{student.name || 'N/A'}</Text>
            <Text style={styles.gray}>Class: {student.class || 'N/A'} | Student ID: {student.studentId || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard label="Total Waste" value={student.totalWaste || totalWeight} suffix=" kg" />
          <KPICard label="Total Earnings" value={student.totalEarnings || totalEarnings} isCurrency />
          <KPICard label="Total Entries" value={entries.length} />
          <KPICard label="Avg per Entry" value={entries.length > 0 ? (student.totalWaste || totalWeight) / entries.length : 0} suffix=" kg" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Details</Text>
          <View style={styles.table}>
            <TableHeader
              cols={[
                { label: 'Date', width: 1.5 },
                { label: 'Waste Type', width: 1.5 },
                { label: 'Weight (kg)', width: 1, align: 'right' },
                { label: 'Amount', width: 1.2, align: 'right' },
              ]}
            />
            {entries.slice(0, 30).map((entry, index) => (
              <TableRow
                key={index}
                cols={[
                  { key: 'date', width: 1.5, render: (val) => formatDate(val) },
                  { key: 'wasteTypeName', width: 1.5 },
                  { key: 'weight', width: 1, align: 'right', render: (val) => formatNumber(val) },
                  { key: 'amount', width: 1.2, align: 'right', render: (val) => formatCurrency(val) },
                ]}
                data={{
                  date: entry.date,
                  wasteTypeName: entry.wasteTypeName || entry.wasteType || 'Other',
                  weight: entry.weight,
                  amount: entry.amount,
                }}
              />
            ))}
          </View>
          {entries.length > 30 && (
            <Text style={[styles.gray, { marginTop: 10 }]}>... and {entries.length - 30} more entries</Text>
          )}
        </View>

        <View style={[styles.footer, { marginTop: 20 }]}>
          <Text style={styles.footerText}>
            Generated on {format(new Date(), 'dd MMM yyyy HH:mm')} | {trans.title} - {trans.system}
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} | Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};