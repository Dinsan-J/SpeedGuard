import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    policeId: "",
    role: "user" as "officer" | "user",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://speedguard-nine.vercel.app/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: `Welcome to SpeedGuard, ${formData.username}!`,
        });
        window.location.href = "/login";
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-info/5 to-secondary/5"></div>
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-info/10 rounded-full blur-3xl"></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 mb-6 group"
            >
              <div className="p-3 bg-gradient-hero rounded-xl shadow-glow-primary group-hover:shadow-glow-primary/80 transition-all duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                SpeedGuard
              </span>
            </Link>

            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Join SpeedGuard to manage your vehicles and violations
            </p>
          </div>

          {/* Registration Form */}
          <Card className="p-8 bg-gradient-card border-border/50 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Register as</Label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "user" }))
                    }
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === "user"
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border bg-accent/20 hover:border-secondary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">Vehicle Owner</div>
                      <div className="text-xs text-muted-foreground">
                        Manage vehicles
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "officer" }))
                    }
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === "officer"
                        ? "border-info bg-info/10 text-info"
                        : "border-border bg-accent/20 hover:border-info/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">Traffic Officer</div>
                      <div className="text-xs text-muted-foreground">
                        Issue fines
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-12"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Police ID Field (only for officers) */}
              {formData.role === "officer" && (
                <div className="space-y-2">
                  <Label htmlFor="policeId">Police ID</Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="policeId"
                      name="policeId"
                      type="text"
                      value={formData.policeId}
                      onChange={handleChange}
                      className="pl-10 h-12"
                      placeholder="Enter your police ID"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 shadow-glow-primary hover:shadow-glow-primary/80 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
