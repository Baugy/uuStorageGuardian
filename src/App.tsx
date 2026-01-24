import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/client";
import { LoginDialog } from "@/components/LoginDialog";
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

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    // Clear all cached data
    queryClient.clear();
  };

  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background">
      {/* Auth Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Box Manager</h1>
              {isAuthenticated && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Authenticated (Test User)
                </div>
              )}
              {isAutoLoggingIn && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Auto-logging in...
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : !isAutoLoggingIn ? (
                <Button size="sm" onClick={() => setLoginDialogOpen(true)}>
                  Manual Login
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

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
              <Route path="/devices" element={<DeviceList />} />
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
