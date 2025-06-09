import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("writer");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create account using Supabase with selected role
      await signup(name, email, password, role);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      // Handle specific Supabase error messages
      if (error.message === "VERIFICATION_REQUIRED") {
        toast.success("Account created! Please check your email and click the verification link to complete your registration.", {
          duration: 8000,
        });
        // Don't redirect - user needs to verify email first
      } else if (error.message?.includes("User already registered") || error.message?.includes("already been registered")) {
        toast.error("An account with this email already exists. Please try signing in instead.", {
          duration: 6000,
        });
      } else if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else if (error.message?.includes("stronger password")) {
        toast.error("Please use a stronger password with a mix of letters, numbers, and symbols.");
      } else if (error.message?.includes("Invalid email")) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error("Failed to create account. Please try again.");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-writer-primary/10 to-writer-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-playfair">Create Account</CardTitle>
            <CardDescription>
              Sign up for Mystery Publishers to start your writing journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="writer">Writer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="publisher">Publisher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit"
                className="w-full bg-writer-primary hover:bg-writer-accent"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="mr-2" size={18} />
                    <span>Create Account</span>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </div>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-sm text-writer-primary hover:underline">
                <span className="flex items-center justify-center gap-1 mt-1">
                  Sign in <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
