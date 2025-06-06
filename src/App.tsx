import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthLoading from "@/components/AuthLoading";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WriterDashboard from "./pages/WriterDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import PublisherDashboard from "./pages/AdminDashboard";
import UploadScript from "./pages/UploadScript";
import MyScripts from "./pages/MyScripts";
import Messages from "./pages/Messages";
import Assignments from "./pages/Assignments";
import LiveEdits from "./pages/LiveEdits";
import WriterMarketplace from "./pages/WriterMarketplace";
import EditorMarketplace from "./pages/EditorMarketplace";
import PublisherMarketplace from "./pages/PublisherMarketplace";
import Payments from "./pages/Payments";
import Manuscripts from "./pages/Manuscripts";
import ManuscriptDetail from "./pages/ManuscriptDetail";
import NotFound from "./pages/NotFound";
import DataVerificationTest from "./components/DataVerificationTest";
import SimpleManuscriptTest from "./components/SimpleManuscriptTest";
import ManuscriptDebug from "./components/ManuscriptDebug";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000
    }
  }
});

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading during authentication check
  if (loading) {
    return <AuthLoading />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return children;
};

// Role-specific dashboard routing
const DashboardRouter = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <AuthLoading />;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case "writer":
      return <WriterDashboard />;
    case "editor":
      return <EditorDashboard />;
    case "publisher":
      return <PublisherDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Role-specific marketplace routing
const MarketplaceRouter = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <AuthLoading />;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case "writer":
      return <WriterMarketplace />;
    case "editor":
      return <EditorMarketplace />;
    case "publisher":
      return <PublisherMarketplace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Main routes component with auth state handling
const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Automatic redirection based on auth state
  useEffect(() => {
    if (!loading) {
      // If authenticated and at login/signup page, redirect to dashboard
      if (isAuthenticated && ['/login', '/signup', '/'].includes(location.pathname)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);
  
  // Show loading state during initial auth check
  if (loading && !isAuthenticated) {
    // Only show loading for protected routes, not public pages
    if (!['/login', '/signup', '/'].includes(location.pathname)) {
      return <AuthLoading />;
    }
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <UploadScript />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-scripts" 
        element={
          <ProtectedRoute>
            <MyScripts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assignments" 
        element={
          <ProtectedRoute>
            <Assignments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/live-edits" 
        element={
          <ProtectedRoute>
            <LiveEdits />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/marketplace" 
        element={
          <ProtectedRoute>
            <MarketplaceRouter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manuscripts" 
        element={
          <ProtectedRoute>
            <Manuscripts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manuscripts/:id" 
        element={
          <ProtectedRoute>
            <ManuscriptDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test-data" 
        element={<DataVerificationTest />} 
      />
      <Route 
        path="/simple-test" 
        element={<SimpleManuscriptTest />} 
      />
      <Route 
        path="/debug-manuscripts" 
        element={<ManuscriptDebug />} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
