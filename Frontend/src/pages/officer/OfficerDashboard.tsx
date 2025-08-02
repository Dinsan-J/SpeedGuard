import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  AlertTriangle,
  DollarSign,
  Users,
  Clock,
  MapPin,
  Camera,
  TrendingUp,
  Search,
  QrCode,
  FileText,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface VehicleData {
  id: string;
  plate: string;
  speed: number;
  limit: number;
  location: string;
  timestamp: string;
  violation: boolean;
}

interface FineStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

const OfficerDashboard = () => {
  const [liveVehicles, setLiveVehicles] = useState<VehicleData[]>([]);
  const [stats, setStats] = useState({
    activeCameras: 124,
    todayViolations: 87,
    pendingFines: 156,
    revenue: 45600,
  });

  const [fineStats] = useState<FineStats>({
    today: 87,
    week: 542,
    month: 2340,
    total: 15670,
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

  // Simulate live vehicle data
  useEffect(() => {
    const generateVehicleData = (): VehicleData => ({
      id: Math.random().toString(36).substr(2, 9),
      plate: `${Math.random()
        .toString(36)
        .substr(2, 3)
        .toUpperCase()}-${Math.floor(Math.random() * 9999)}`,
      speed: Math.floor(Math.random() * 40) + 40,
      limit: Math.random() > 0.3 ? 60 : 50,
      location: [
        "Main St & 5th Ave",
        "Highway 101",
        "Downtown Plaza",
        "School Zone",
      ][Math.floor(Math.random() * 4)],
      timestamp: new Date().toLocaleTimeString(),
      violation: Math.random() > 0.7,
    });

    const initialData = Array.from({ length: 6 }, generateVehicleData);
    setLiveVehicles(initialData);

    const interval = setInterval(() => {
      setLiveVehicles((prev) => {
        const newData = [...prev];
        const randomIndex = Math.floor(Math.random() * newData.length);
        newData[randomIndex] = generateVehicleData();
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "QR Vehicle Search",
      description: "Scan vehicle QR code",
      link: "/officer/qr-search",
      color: "info",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Issue Fine",
      description: "Create new violation",
      link: "/officer/issue-fine",
      color: "warning",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Search Vehicle",
      description: "Find by plate number",
      link: "/officer/vehicles",
      color: "secondary",
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "Camera Status",
      description: "Monitor live feeds",
      link: "/officer/cameras",
      color: "primary",
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
            {/* Stunning Logout Button */}
            <Button
              variant="destructive"
              size="sm"
              className="ml-2 px-4 py-2 font-bold bg-gradient-to-r from-primary to-warning text-white shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={handleLogout}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cameras</p>
                <p className="text-3xl font-bold text-info">
                  {stats.activeCameras}
                </p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Camera className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                98% operational
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
              <div className="flex items-center text-sm text-secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from yesterday
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.pendingFines}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                65% processed
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-secondary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Month)</p>
                <p className="text-3xl font-bold text-secondary">
                  ${stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
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
                {liveVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      vehicle.violation
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-accent/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            vehicle.violation
                              ? "bg-primary/20"
                              : "bg-secondary/20"
                          }`}
                        >
                          <Car
                            className={`h-5 w-5 ${
                              vehicle.violation
                                ? "text-primary"
                                : "text-secondary"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">
                              {vehicle.plate}
                            </span>
                            {vehicle.violation && (
                              <Badge variant="destructive" className="text-xs">
                                VIOLATION
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {vehicle.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {vehicle.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            vehicle.violation
                              ? "text-primary"
                              : "text-secondary"
                          }`}
                        >
                          {vehicle.speed} km/h
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Limit: {vehicle.limit} km/h
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Fine Statistics */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-bold mb-4">Fine Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">Today</span>
                  <span className="text-lg font-bold text-warning">
                    {fineStats.today}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-lg font-bold text-info">
                    {fineStats.week}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-lg font-bold text-secondary">
                    {fineStats.month}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {fineStats.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Fine</span>
                  <span className="font-medium">$125</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Rate</span>
                  <span className="font-medium text-secondary">87%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Appeal Rate</span>
                  <span className="font-medium text-warning">8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue/Day</span>
                  <span className="font-medium text-primary">$2,340</span>
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
