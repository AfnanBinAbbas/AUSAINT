import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabase } from '@/lib/supabase-context';
import AuthButton from '@/components/auth/AuthButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Login() {
  const { user } = useSupabase();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to AUSAINT</CardTitle>
          <CardDescription>
            Sign in to access secure reporting and analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AuthButton />
        </CardContent>
      </Card>
    </div>
  );
}

export default Login; 