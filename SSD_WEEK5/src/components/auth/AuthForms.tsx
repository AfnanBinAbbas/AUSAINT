
import { useState } from "react";
import { AlertCircle, Lock, Mail, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { security } from "@/lib/supabase/security";

export function AuthForms() {
  const { signIn, signUp, isLoading, configError } = useAuth();
  
  // Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!security.isValidEmail(loginEmail)) {
      return;
    }
    
    if (!loginPassword || loginPassword.length < 6) {
      return;
    }
    
    await signIn(loginEmail, loginPassword);
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!signupName || signupName.trim().length < 2) {
      return;
    }
    
    if (!security.isValidEmail(signupEmail)) {
      return;
    }
    
    if (!signupPassword || signupPassword.length < 8) {
      return;
    }
    
    await signUp(signupEmail, signupPassword, signupName);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-3">
          <div className="h-6 w-6 bg-white rounded-md" />
        </div>
        <h1 className="text-2xl font-bold">AUSAINT OSINT Suite</h1>
        <p className="text-muted-foreground mt-2">
          Secure open-source intelligence platform
        </p>
      </div>
      
      {configError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your
            environment to enable authentication.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="border-primary/20">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl text-center">Secure Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the OSINT suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="p-1">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      placeholder="Enter your email"
                      type="email"
                      className="pl-10"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      placeholder="Enter your password"
                      type="password"
                      className="pl-10"
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || configError}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="p-1">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      autoComplete="name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      placeholder="Enter your email"
                      type="email"
                      className="pl-10"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      placeholder="Create a password"
                      type="password"
                      className="pl-10"
                      autoComplete="new-password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || configError}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            By using AUSAINT, you agree to our{" "}
            <Button variant="link" className="h-auto p-0 text-primary">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="h-auto p-0 text-primary">
              Privacy Policy
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
