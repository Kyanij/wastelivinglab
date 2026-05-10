import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { formatNumber } from '../../utils/portalHelpers';

export default function WasteOverviewByStudent({ students, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedStudents = [...students]
    .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))
    .slice(0, 10);

  const totalWaste = sortedStudents.reduce((sum, s) => sum + (s.totalWaste || 0), 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          {t('dashboard.overviewByStudent') || 'Overview of Waste Collected by Students'}
        </h2>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('common.noData')}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    {t('students.tableHeaders.student')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    {t('students.tableHeaders.class')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    {t('students.tableHeaders.totalWaste')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    {t('students.tableHeaders.totalEarnings')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Contribution %</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  const contribution = totalWaste > 0 ? ((student.totalWaste || 0) / totalWaste) * 100 : 0;
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-600">
                              {student.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{student.class}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                        {formatNumber(student.totalWaste || 0)} kg
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-emerald-600">
                        Rp {formatNumber(student.totalEarnings || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${Math.min(contribution, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">{contribution.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Students: {students.length}</span>
            <span className="text-sm font-medium text-gray-900">Total Waste: {formatNumber(totalWaste)} kg</span>
          </div>
        </>
      )}
    </div>
  );
}