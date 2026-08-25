import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

import Login from './pages/Login';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import AccessDenied from './pages/AccessDenied';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Dashboard from './pages/Dashboard';
import PredictionTest from './pages/PredictionTest';
import PredictionExplanation from './pages/PredictionExplanation';
import WhatIfAnalysis from './pages/WhatIfAnalysis';
import Optimization from './pages/Optimization';
import Analytics from './pages/Analytics';
import ModelInsights from './pages/ModelInsights';
import Predictions from './pages/Predictions';
import PredictionDetails from './pages/PredictionDetails';
import PredictionAnalytics from './pages/PredictionAnalytics';
import ModelMonitoring from './pages/ModelMonitoring';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/prediction-test" element={<ProtectedRoute><PredictionTest /></ProtectedRoute>} />
            <Route path="/explain-prediction" element={<ProtectedRoute><PredictionExplanation /></ProtectedRoute>} />
            <Route path="/what-if" element={<ProtectedRoute><WhatIfAnalysis /></ProtectedRoute>} />
            <Route path="/optimization" element={<ProtectedRoute><Optimization /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/model-insights" element={<ProtectedRoute><ModelInsights /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/predictions/analytics" element={<ProtectedRoute><PredictionAnalytics /></ProtectedRoute>} />
            <Route path="/predictions/:id" element={<ProtectedRoute><PredictionDetails /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><ModelMonitoring /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ReportDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Only Route */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
