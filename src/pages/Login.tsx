
import React, { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, setDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRoleSelect = (role: UserRole) => {
    setDemoUser(role);
    toast.success(`Logged in as ${role}`);
    navigate("/dashboard");
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
              <Button className="w-full bg-brand-red hover:bg-brand-red/90" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground mb-4">
              For demonstration purposes, choose a role:
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 border-writer-primary text-writer-primary hover:bg-writer-primary hover:text-white"
                onClick={() => handleRoleSelect("writer")}
              >
                Writer
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-editor-primary text-editor-primary hover:bg-editor-primary hover:text-white"
                onClick={() => handleRoleSelect("editor")}
              >
                Editor
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-publisher-primary text-publisher-primary hover:bg-publisher-primary hover:text-white"
                onClick={() => handleRoleSelect("publisher")}
              >
                Publisher
              </Button>
            </div>
            <div className="w-full text-center mt-6">
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
