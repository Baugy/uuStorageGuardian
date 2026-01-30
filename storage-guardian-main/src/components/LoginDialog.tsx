import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, LoginCredentials } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export const LoginDialog = ({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: ({ creds, userType }: { creds: LoginCredentials; userType?: 'user' | 'operator' }) =>
      authApi.login(creds, userType),
    onSuccess: () => {
      toast.success("Login successful!");
      onOpenChange(false);
      onLoginSuccess?.();
      setCredentials({ username: "", password: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter both username and password");
      return;
    }
    // Detect user type based on username
    const userType = credentials.username === 'operator' ? 'operator' : 'user';
    loginMutation.mutate({ creds: credentials, userType });
  };

  const handleDemoLogin = (userType: 'operator' | 'test') => {
    const demoCredentials = userType === 'operator'
      ? { username: 'operator', password: 'operator' }
      : { username: 'test', password: 'test' };

    setCredentials(demoCredentials);
    const authUserType = userType === 'operator' ? 'operator' : 'user';
    loginMutation.mutate({ creds: demoCredentials, userType: authUserType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login to Box Manager</DialogTitle>
          <DialogDescription>
            Enter your credentials to access the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('operator')}
              disabled={loginMutation.isPending}
              className="flex-1"
            >
              Demo: Operator
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('test')}
              disabled={loginMutation.isPending}
              className="flex-1"
            >
              Demo: Test User
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loginMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
