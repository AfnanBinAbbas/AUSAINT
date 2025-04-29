
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuditAction } from '@/lib/supabase/security';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  configError: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up the auth state listener
  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Log important auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          logAuditAction('session_' + event.toLowerCase(), 'auth', currentSession?.user?.id)
            .catch(error => console.error('Failed to log audit action:', error));
        } else if (event === 'SIGNED_OUT') {
          logAuditAction('session_signed_out', 'auth')
            .catch(error => console.error('Failed to log audit action:', error));
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Initial session check:', data.session);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.user) {
        console.log('Login successful for user:', data.user.id);
        // Log successful login to audit log
        await logAuditAction("login", "user", data.user.id);
        
        toast({
          title: "Login successful",
          description: "Welcome back to AUSAINT OSINT Suite",
        });
        
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign up:', email);
      
      // Sign up with email, password and meta data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Disable email confirmation requirement for smoother testing
          emailRedirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log('Signup response:', data);
      
      if (data?.user) {
        // Check if email confirmation is required
        if (data.session === null) {
          toast({
            title: "Account created",
            description: "Please check your email to confirm your account before logging in.",
          });
          return;
        }
        
        // If no email confirmation required, we have a session
        console.log('Account created for user:', data.user.id);
        
        // Log successful signup to audit log
        await logAuditAction("signup", "user", data.user.id);
        
        toast({
          title: "Account created",
          description: "Welcome to AUSAINT OSINT Suite",
        });
        
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Signup error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error?.message || "An unexpected error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    configError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for consuming the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
