import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success("Login successful!");
      // Temporary workaround: force redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      // Display appropriate error messages based on error type
      if (error.message === "Invalid login credentials") {
        toast.error("Invalid email or password. Please check your credentials and try again.", {
          duration: 6000,
        });
      } else if (error.message.includes("Email not verified")) {
        toast.error("Please verify your email before signing in. Check your inbox for the verification link.", {
          duration: 8000,
        });
      } else if (error.message.includes("rate limit")) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.message.includes("User not found") || error.message.includes("Invalid user")) {
        toast.error("No account found with this email address. Please sign up first.", {
          duration: 6000,
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in. Check your inbox for the verification link.", {
          duration: 8000,
        });
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success("Password reset email sent! Please check your inbox for instructions.", {
        duration: 8000,
      });
    } catch (error: any) {
      if (error.message?.includes("User not found") || error.message?.includes("Invalid email")) {
        toast.error("No account found with this email address.", {
          duration: 6000,
        });
      } else {
        toast.error("Failed to send password reset email. Please try again.");
      }
      console.error(error);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-playfair text-brand-red">Mystery Publishers</h1>
          <p className="mt-2 text-muted-foreground">The complete platform for manuscript editing and publishing</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm text-brand-red hover:underline"
                  onClick={handleForgotPassword}
                  disabled={isResetLoading}
                >
                  {isResetLoading ? "Sending..." : "Forgot password?"}
                </Button>
              </div>
              <Button className="w-full bg-brand-red hover:bg-brand-red/90" type="submit" disabled={isLoading || authLoading}>
                {(isLoading || authLoading) ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="w-full text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-sm text-brand-red hover:underline">
                Sign up here
              </Link>
            </div>
            <div className="w-full text-center mt-4">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                Return to home page
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
