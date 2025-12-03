import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name);
        toast({
          title: "Welcome to Innovatr!",
          description: "Your free account has been created. Access trend reports now!",
        });
      } else {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
      
      // Close dialog and redirect to portal
      onOpenChange(false);
      setTimeout(() => {
        setLocation("/portal");
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle data-testid="text-login-title">
            {isSignup ? "Create Free Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription data-testid="text-login-description">
            {isSignup
              ? "Get instant access to premium trend reports and industry insights."
              : "Access your portal and continue your research journey."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name" data-testid="label-name">
                Full Name
              </Label>
              <Input
                id="name"
                data-testid="input-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" data-testid="label-email">
              Email Address
            </Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" data-testid="label-password">
              Password
            </Label>
            <Input
              id="password"
              data-testid="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {isSignup && (
            <div className="rounded-md bg-accent/10 p-3 text-sm" data-testid="banner-free-benefits">
              <p className="font-medium text-foreground">Free Account Includes:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Access to premium trend reports</li>
                <li>• Industry insights library</li>
                <li>• Email updates on new research</li>
              </ul>
            </div>
          )}

          <Button
            type="submit"
            data-testid="button-submit-login"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : isSignup ? "Create Free Account" : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              data-testid="button-toggle-signup"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover-elevate active-elevate-2"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
