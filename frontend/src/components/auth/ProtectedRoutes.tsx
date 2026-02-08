import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

import { useAuth } from '../../context/Auth.context.tsx';

const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoutes;
