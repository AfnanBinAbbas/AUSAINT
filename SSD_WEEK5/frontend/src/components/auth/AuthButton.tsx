import React from 'react';
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase-context";

export function AuthButton() {
  const { supabase, user } = useSupabase();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Button
      onClick={user ? handleSignOut : handleSignIn}
      variant="outline"
    >
      {user ? 'Sign Out' : 'Sign In with GitHub'}
    </Button>
  );
}

export default AuthButton; 