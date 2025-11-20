
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Library from './pages/Library';
import MyBooks from './pages/MyBooks';
import AdminDashboard from './pages/AdminDashboard';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Only for Admin and Librarian
const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  if (!isStaff) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      
      <Route element={<Layout />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-books" 
          element={
            <ProtectedRoute>
              <MyBooks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <StaffRoute>
              <AdminDashboard />
            </StaffRoute>
          } 
        />
        {/* Legacy redirect */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
