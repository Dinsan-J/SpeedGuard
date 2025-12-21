import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  AlertTriangle,
  DollarSign,
  Users,
  Clock,
  MapPin,
  Camera,
  TrendingUp,
  QrCode,
  FileText,
  Settings,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface VehicleData {
  _id: string;
  plateNumber: string;
  currentSpeed: number;
  speedLimit: number;
  currentLocation: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  iotDeviceId: string;
  status: string;
  owner: {
    username: string;
  };
}



const OfficerDashboard = () => {
  const [liveVehicles, setLiveVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDevices: 0,
    todayViolations: 0,
    pendingFines: 0,
    revenue: 0,
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove JWT or any auth info
    localStorage.removeItem("token");
    toast &&
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        variant: "success",
      });
    navigate("/login");
  };

  // Fetch real vehicle data from database
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicles with IoT devices
        const vehicleResponse = await fetch('/api/vehicle/active-iot-vehicles', {
          credentials: 'include'
        });
        
        if (vehicleResponse.ok) {
          const vehicles = await vehicleResponse.json();
          setLiveVehicles(vehicles);
        }
        
        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/police/dashboard-stats', {
          credentials: 'include'
        });
        
        if (statsResponse.ok) {
          const dashboardStats = await statsResponse.json();
          setStats(dashboardStats);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchVehicleData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Police Confirmation",
      description: "Confirm drivers & apply penalties",
      link: "/officer/police-confirmation",
      color: "primary",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Police Analytics",
      description: "ML risk analysis & driver stats",
      link: "/officer/police-analytics",
      color: "secondary",
    },
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "QR Vehicle Search",
      description: "Scan vehicle QR code",
      link: "/officer/qr-search",
      color: "info",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Officer Dashboard</h1>
            <p className="text-muted-foreground">
              Traffic monitoring and violation management
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Badge className="px-3 py-1 bg-secondary/10 text-secondary border-secondary/20">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2 animate-pulse"></div>
              System Online
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active IoT Devices</p>
                <p className="text-3xl font-bold text-info">
                  {stats.activeDevices}
                </p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Camera className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                Registered vehicles with ESP32
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-warning/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Today's Violations
                </p>
                <p className="text-3xl font-bold text-warning">
                  {stats.todayViolations}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Real violations detected
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Confirmations</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.pendingFines}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting police confirmation
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-secondary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fines (LKR)</p>
                <p className="text-3xl font-bold text-secondary">
                  {stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                From confirmed violations
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const colorClasses = {
              primary:
                "border-primary/50 hover:border-primary hover:bg-primary/5",
              secondary:
                "border-secondary/50 hover:border-secondary hover:bg-secondary/5",
              warning:
                "border-warning/50 hover:border-warning hover:bg-warning/5",
              info: "border-info/50 hover:border-info hover:bg-info/5",
            };

            return (
              <Link key={index} to={action.link}>
                <Card
                  className={`p-6 bg-gradient-card border transition-all duration-300 cursor-pointer group ${
                    colorClasses[action.color as keyof typeof colorClasses]
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg transition-colors duration-300 ${
                        action.color === "primary"
                          ? "bg-primary/10 text-primary group-hover:bg-primary/20"
                          : action.color === "secondary"
                          ? "bg-secondary/10 text-secondary group-hover:bg-secondary/20"
                          : action.color === "warning"
                          ? "bg-warning/10 text-warning group-hover:bg-warning/20"
                          : "bg-info/10 text-info group-hover:bg-info/20"
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Live Vehicle Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Live Vehicle Monitoring
                  </h2>
                  <p className="text-muted-foreground">
                    Real-time speed detection data
                  </p>
                </div>
                <Badge className="px-3 py-1 bg-secondary/10 text-secondary border-secondary/20">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-2 animate-pulse"></div>
                  Live
                </Badge>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading vehicle data...</p>
                  </div>
                ) : liveVehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Vehicles</h3>
                    <p className="text-muted-foreground mb-4">
                      No vehicles with IoT devices are currently active in the system.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>• Vehicles need to be registered with ESP32 devices</p>
                      <p>• IoT devices must be sending real-time data</p>
                      <p>• Check device connectivity and registration</p>
                    </div>
                  </div>
                ) : (
                  liveVehicles.map((vehicle) => {
                    const isViolation = vehicle.currentSpeed > vehicle.speedLimit;
                    const locationText = vehicle.currentLocation 
                      ? `${vehicle.currentLocation.lat.toFixed(4)}, ${vehicle.currentLocation.lng.toFixed(4)}`
                      : 'Location unavailable';
                    
                    return (
                      <div
                        key={vehicle._id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          isViolation
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-accent/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-lg ${
                                isViolation
                                  ? "bg-primary/20"
                                  : "bg-secondary/20"
                              }`}
                            >
                              <Car
                                className={`h-5 w-5 ${
                                  isViolation
                                    ? "text-primary"
                                    : "text-secondary"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-lg">
                                  {vehicle.plateNumber}
                                </span>
                                {isViolation && (
                                  <Badge variant="destructive" className="text-xs">
                                    VIOLATION
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {vehicle.iotDeviceId}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {locationText}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {vehicle.owner?.username || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                isViolation
                                  ? "text-primary"
                                  : "text-secondary"
                              }`}
                            >
                              {vehicle.currentSpeed || 0} km/h
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Limit: {vehicle.speedLimit} km/h
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Status: {vehicle.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Real-time Statistics */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-bold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">Active Devices</span>
                  <span className="text-lg font-bold text-info">
                    {stats.activeDevices}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">Today's Violations</span>
                  <span className="text-lg font-bold text-warning">
                    {stats.todayViolations}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">Pending Confirmations</span>
                  <span className="text-lg font-bold text-primary">
                    {stats.pendingFines}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <span className="text-sm font-medium">Total Fines (LKR)</span>
                  <span className="text-lg font-bold text-secondary">
                    {stats.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-bold mb-4">System Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IoT Integration</span>
                  <span className="font-medium text-success">ESP32 + GPS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Speed Detection</span>
                  <span className="font-medium text-info">Real-time</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Merit System</span>
                  <span className="font-medium text-warning">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ML Risk Analysis</span>
                  <span className="font-medium text-primary">Enabled</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
