import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import SeedPage from '../pages/SeedPage';
import WasteTypesPage from '../pages/WasteTypesPage';
import StudentsPage from '../pages/StudentsPage';
import StudentDetailPage from '../pages/StudentDetailPage';
import DashboardPage from '../pages/DashboardPage';
import OverviewReport from '../pages/reports/OverviewReport';
import StudentReport from '../pages/reports/StudentReport';
import ClassReport from '../pages/reports/ClassReport';
import WasteAnalysisReport from '../pages/reports/WasteAnalysisReport';

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dev/seed" element={<SeedPage />} />
      
      <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/waste-entries" element={<div>Waste Entries</div>} />
        <Route path="/waste-types" element={<WasteTypesPage />} />
        
        <Route path="/reports" element={<Navigate to="/reports/overview" replace />} />
        <Route path="/reports/overview" element={<OverviewReport />} />
        <Route path="/reports/student" element={<StudentReport />} />
        <Route path="/reports/class" element={<ClassReport />} />
        <Route path="/reports/waste-analysis" element={<WasteAnalysisReport />} />
        
        <Route path="/settings" element={<div>Settings</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}