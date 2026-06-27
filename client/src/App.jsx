import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import DashboardLayout from './shared/layouts/DashboardLayout';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Profile from './features/profile/pages/Profile';
import Settings from './features/profile/pages/Settings';
import WorkspacesList from './features/workspaces/pages/WorkspacesList';
import WorkspaceDetail from './features/workspaces/pages/WorkspaceDetail';
import ProjectDetail from './features/projects/pages/ProjectDetail';
import MyTasks from './features/tasks/pages/MyTasks';

import Dashboard from './features/dashboard/pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/workspaces" element={<WorkspacesList />} />
              <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/tasks" element={<MyTasks />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<div className="p-8 text-xl text-destructive">404 - Not Found</div>} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
