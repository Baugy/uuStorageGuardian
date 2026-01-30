import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, HelpCircle, User, LogOut, UserCog, RefreshCw, Box, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi, authManager } from "@/lib/api/client";
import { toast } from "sonner";
import { useState } from "react";

interface HeaderProps {
  onLogout: () => void;
  onUserTypeChange?: () => void;
}

export const Header = ({ onLogout, onUserTypeChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);
  const currentUserType = authManager.getCurrentUserType();
  const isOperator = currentUserType === 'operator';
  const userName = currentUserType === 'operator' ? 'Lukas Baumgartner' : 'Test User';
  const userEmail = currentUserType === 'operator' ? 'adminos@example.com' : 'user@example.com';

  const handleSwitchToOperator = async () => {
    setIsSwitching(true);
    try {
      await authApi.switchToOperator();
      toast.success("Switched to Operator account");
      onUserTypeChange?.();
      // Refresh the page to update routes and permissions
      window.location.reload();
    } catch (error) {
      toast.error("Failed to switch to operator account");
      console.error('Switch to operator failed:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSwitchToUser = async () => {
    setIsSwitching(true);
    try {
      await authApi.switchToUser();
      toast.success("Switched to User account");
      onUserTypeChange?.();
      // Navigate to home if on devices page (operator-only)
      if (window.location.pathname === '/devices') {
        navigate('/');
      }
      // Refresh the page to update routes and permissions
      window.location.reload();
    } catch (error) {
      toast.error("Failed to switch to user account");
      console.error('Switch to user failed:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <Link to="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">StorageGuardian</span>
                </Link>
                <span className="text-xs text-muted-foreground">Monitoring System</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <Box className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/boxes' ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/boxes">
                <Box className="h-4 w-4 mr-2" />
                Boxes
              </Link>
            </Button>
            {isOperator && (
              <Button
                variant={location.pathname === '/devices' ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/devices">
                  <Cpu className="h-4 w-4 mr-2" />
                  Devices
                </Link>
              </Button>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Mail Icon */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Mail className="h-5 w-5" />
            </Button>

            {/* Help Icon */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{userName}</div>
                    <Badge variant={currentUserType === 'operator' ? 'default' : 'secondary'} className="text-xs">
                      {currentUserType === 'operator' ? 'Operator' : 'User'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{userEmail}</div>
                </div>
                <DropdownMenuSeparator />
                {currentUserType !== 'operator' && (
                  <DropdownMenuItem 
                    onClick={handleSwitchToOperator}
                    disabled={isSwitching}
                    className="cursor-pointer"
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    <span>Switch to Operator</span>
                    {isSwitching && <RefreshCw className="h-3 w-3 ml-auto animate-spin" />}
                  </DropdownMenuItem>
                )}
                {currentUserType === 'operator' && (
                  <DropdownMenuItem 
                    onClick={handleSwitchToUser}
                    disabled={isSwitching}
                    className="cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Switch to User</span>
                    {isSwitching && <RefreshCw className="h-3 w-3 ml-auto animate-spin" />}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

