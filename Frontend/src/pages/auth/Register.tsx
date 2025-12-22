import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
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
    phoneNumber: "",
    role: "driver" as "officer" | "driver",
    // Driver fields
    fullName: "",
    nicNumber: "",
    drivingLicenseNumber: "",
    licenseClass: "B",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    // Officer fields
    policeIdNumber: "",
    policeStation: "",
    division: "",
    rank: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://speedguard-gz70.onrender.com/api/auth/register", // <-- updated to Render backend
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include", // <-- required for cookies/auth
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
              <div className="p-1">
                <img
                  src="/logook2.png"
                  alt="SpeedGuard Logo"
                  className="h-10 w-10 object-contain"
                />
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
                      setFormData((prev) => ({ ...prev, role: "driver" }))
                    }
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === "driver"
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

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Driver-specific fields */}
              {formData.role === "driver" && (
                <>
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Driver Information</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nicNumber">NIC Number</Label>
                      <Input
                        id="nicNumber"
                        name="nicNumber"
                        type="text"
                        value={formData.nicNumber}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your NIC number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drivingLicenseNumber">Driving License Number</Label>
                      <Input
                        id="drivingLicenseNumber"
                        name="drivingLicenseNumber"
                        type="text"
                        value={formData.drivingLicenseNumber}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your license number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseClass">License Class</Label>
                      <select
                        id="licenseClass"
                        name="licenseClass"
                        value={formData.licenseClass}
                        onChange={handleChange}
                        className="w-full h-12 px-3 border border-border rounded-md bg-background"
                        required
                      >
                        <option value="A">A - Motorcycle</option>
                        <option value="A1">A1 - Light Motorcycle</option>
                        <option value="B">B - Light Vehicle</option>
                        <option value="B1">B1 - Three Wheeler</option>
                        <option value="C">C - Heavy Vehicle</option>
                        <option value="C1">C1 - Medium Vehicle</option>
                        <option value="CE">CE - Heavy Vehicle with Trailer</option>
                        <option value="D">D - Bus</option>
                        <option value="D1">D1 - Minibus</option>
                        <option value="DE">DE - Bus with Trailer</option>
                        <option value="G">G - Tractor</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseIssueDate">License Issue Date</Label>
                        <Input
                          id="licenseIssueDate"
                          name="licenseIssueDate"
                          type="date"
                          value={formData.licenseIssueDate}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
                        <Input
                          id="licenseExpiryDate"
                          name="licenseExpiryDate"
                          type="date"
                          value={formData.licenseExpiryDate}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Police ID Field (only for officers) */}
              {formData.role === "officer" && (
                <>
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Officer Information</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="policeIdNumber">Police ID</Label>
                      <div className="relative">
                        <BadgeCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="policeIdNumber"
                          name="policeIdNumber"
                          type="text"
                          value={formData.policeIdNumber}
                          onChange={handleChange}
                          className="pl-10 h-12"
                          placeholder="Enter your police ID"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="policeStation">Police Station</Label>
                      <Input
                        id="policeStation"
                        name="policeStation"
                        type="text"
                        value={formData.policeStation}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your police station"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="division">Division</Label>
                      <Input
                        id="division"
                        name="division"
                        type="text"
                        value={formData.division}
                        onChange={handleChange}
                        className="h-12"
                        placeholder="Enter your division"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rank">Rank (Optional)</Label>
                      <select
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        className="w-full h-12 px-3 border border-border rounded-md bg-background"
                      >
                        <option value="">Select Rank</option>
                        <option value="Police Constable">Police Constable</option>
                        <option value="Police Sergeant">Police Sergeant</option>
                        <option value="Police Inspector">Police Inspector</option>
                        <option value="Sub Inspector">Sub Inspector</option>
                        <option value="Assistant Superintendent">Assistant Superintendent</option>
                        <option value="Deputy Inspector General">Deputy Inspector General</option>
                        <option value="Inspector General">Inspector General</option>
                      </select>
                    </div>
                  </div>
                </>
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
