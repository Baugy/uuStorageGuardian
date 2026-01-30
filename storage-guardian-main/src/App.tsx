import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authApi, authManager } from "@/lib/api/client";
import { LoginDialog } from "@/components/LoginDialog";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import Index from "./pages/Index";
import BoxList from "./pages/BoxList";
import BoxDetail from "./pages/BoxDetail";
import BoxHistory from "./pages/BoxHistory";
import DeviceList from "./pages/DeviceList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (authApi.isAuthenticated()) {
      setIsAuthenticated(true);
      return;
    }

    // Attempt automatic login with test credentials
    const performAutoLogin = async () => {
      setIsAutoLoggingIn(true);
      try {
        await authApi.autoLogin();
        setIsAuthenticated(true);
        toast.success("Automatically logged in with test account");
      } catch (error) {
        console.error('Auto-login failed:', error);
        toast.error("Auto-login failed. Please try manual login.");
        // Fall back to showing login dialog
        setLoginDialogOpen(true);
      } finally {
        setIsAutoLoggingIn(false);
      }
    };

    performAutoLogin();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const currentUserType = authManager.getCurrentUserType();
  const isOperator = currentUserType === 'operator';

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    // Clear all cached data
    queryClient.clear();
    toast.info("Logged out. Tokens are preserved in memory.");
  };

  const handleUserTypeChange = () => {
    // Update authentication state when user type changes
    setIsAuthenticated(authApi.isAuthenticated());
  };

  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? (
        <>
          <Header onLogout={handleLogout} onUserTypeChange={handleUserTypeChange} />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </>
      ) : (
        <>
          {isAutoLoggingIn ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Auto-logging in...</p>
              </div>
            </div>
          ) : (
            <>
              <Header onLogout={handleLogout} />
              <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
            </>
          )}
        </>
      )}

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/boxes" element={<BoxList />} />
              <Route path="/boxes/:id" element={<BoxDetail />} />
              <Route path="/boxes/:id/history" element={<BoxHistory />} />
              {isOperator && <Route path="/devices" element={<DeviceList />} />}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
