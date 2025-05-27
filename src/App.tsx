
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-specific dashboard routing
const DashboardRouter = () => {
  const { user } = useAuth();
  
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
  const { user } = useAuth();
  
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

const AppRoutes = () => {
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
