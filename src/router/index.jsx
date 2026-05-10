import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import SeedPage from '../pages/SeedPage';
import WasteTypesPage from '../pages/WasteTypesPage';
import StudentsPage from '../pages/StudentsPage';
import StudentDetailPage from '../pages/StudentDetailPage';
import ClassesPage from '../pages/ClassesPage';
import ClassDetailPage from '../pages/ClassDetailPage';
import DashboardPage from '../pages/DashboardPage';
import OverviewReport from '../pages/reports/OverviewReport';
import StudentReport from '../pages/reports/StudentReport';
import ClassReport from '../pages/reports/ClassReport';
import WasteAnalysisReport from '../pages/reports/WasteAnalysisReport';
import PublicPortal from '../pages/PublicPortal';

function AppRoutes() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dev/seed" element={<SeedPage />} />
      
      <Route path="/" element={<PublicPortal />} />
      
      {/* Dashboard */}
      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('nav.dashboard')}
            subtitle={t('dashboard.overviewByStudent')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Students */}
      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('nav.students')}
            subtitle={t('students.subtitle')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
      </Route>

      {/* Classes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('nav.classes')}
            subtitle={t('classes.subtitle')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/:id" element={<ClassDetailPage />} />
      </Route>

      {/* Waste Types */}
      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('nav.wasteTypes')}
            subtitle={t('wasteTypes.subtitle')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/waste-types" element={<WasteTypesPage key="waste-types" />} />
      </Route>
      
      {/* Reports - Individual layouts for each report type */}
      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('reports.overview')}
            subtitle={t('reports.overviewDesc')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/reports/overview" element={<OverviewReport />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('reports.student')}
            subtitle={t('reports.studentDesc')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/reports/student" element={<StudentReport />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('reports.class')}
            subtitle={t('reports.classDesc')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/reports/class" element={<ClassReport />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <AppLayout 
            title={t('reports.wasteAnalysis')}
            subtitle={t('reports.wasteAnalysisDesc')}
          >
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/reports/waste-analysis" element={<WasteAnalysisReport />} />
      </Route>

      {/* Reports Index - Redirect */}
      <Route element={
        <ProtectedRoute>
          <AppLayout title={t('nav.reports')}>
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      }>
        <Route path="/reports" element={<Navigate to="/reports/overview" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
