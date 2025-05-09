import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabase } from '@/lib/supabase-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute; 