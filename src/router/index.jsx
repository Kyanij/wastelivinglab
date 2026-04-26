import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      
      <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/students" element={<div>Students</div>} />
        <Route path="/students/:id" element={<div>Student Detail</div>} />
        <Route path="/waste-entries" element={<div>Waste Entries</div>} />
        <Route path="/waste-types" element={<div>Waste Types</div>} />
        <Route path="/reports" element={<div>Reports</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}