import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  AlertTriangle,
  DollarSign,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  LogOut, // Add LogOut icon
  Download, // Add Download icon
} from "lucide-react";
import { Link } from "react-router-dom";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LiveSpeedometer from "./LiveSpeedometer";
import QRCode from "react-qr-code";
import VehicleCard from "@/pages/user/VehicleCard"; // Import VehicleCard component

interface Vehicle {
  _id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  status: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  violations: number;
  lastViolation?: string;
  qrCode?: string;
}

// Update Violation interface for MongoDB
interface Violation {
  _id: string;
  vehicleId: string;
  location: { lat: number; lng: number };
  speed: number;
  timestamp: string;
  predictedFine?: number;
}

const UserDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Remove dummy violations, use MongoDB data
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const userId = "64f8c2e2a1b2c3d4e5f6a7b8"; // Use your real user id

  useEffect(() => {
    const fetchVehicles = async () => {
      const response = await fetch(
        `https://speedguard-gz70.onrender.com/api/vehicle/user/${userId}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) setVehicles(data.vehicles);
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchViolations = async () => {
      setIsLoadingViolations(true);
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/violation`);
      const data = await response.json();
      
      if (data.success) {
        // First set violations without predictions for immediate display
        const violationsWithBasicFines = data.violations.map((v: Violation) => ({
          ...v,
          predictedFine: 15000 // Default Sri Lankan Rupees
        }));
        setViolations(violationsWithBasicFines);
        setIsLoadingViolations(false);
        
        // Then fetch ML predictions in background and update
        const violationsWithPredictions = await Promise.all(
          data.violations.map(async (violation: Violation) => {
            try {
              const predResponse = await fetch(`${API_URL}/api/predict-violation-fine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  speed: violation.speed,
                  speedLimit: 70,
                  locationType: 'Urban',
                  timeOfDay: 'Day',
                  pastViolations: 0
                })
              });
              
              if (predResponse.ok) {
                const predData = await predResponse.json();
                // Convert USD to LKR (approximate rate: 1 USD = 300 LKR)
                const fineInLKR = Math.round(predData.predicted_fine * 300);
                return { ...violation, predictedFine: fineInLKR };
              } else {
                console.error('ML API returned error:', predResponse.status);
              }
            } catch (error) {
              console.error('Failed to predict fine for violation:', violation._id, error);
            }
            // Fallback: calculate basic fine based on speed excess in LKR
            const speedExcess = violation.speed - 70;
            const fallbackFine = 15000 + Math.floor(speedExcess / 10) * 5000;
            return { ...violation, predictedFine: fallbackFine };
          })
        );
        
        setViolations(violationsWithPredictions);
      } else {
        setIsLoadingViolations(false);
      }
    };
    fetchViolations();
  }, []);

  const stats = {
    totalViolations: violations.filter((v) => v.speed > 70).length, // ✅ only speed > 70
    pendingFines: violations.filter((v) => v.speed > 70).length,
    overdueFines: 0,
    totalFines: violations
      .filter((v) => v.speed > 70)
      .reduce((sum, v) => sum + (v.predictedFine || 15000), 0),
    unpaidFines: violations
      .filter((v) => v.speed > 70)
      .reduce((sum, v) => sum + (v.predictedFine || 15000), 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case "overdue":
        return <XCircle className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "border-secondary/50 bg-secondary/5";
      case "overdue":
        return "border-primary/50 bg-primary/5";
      default:
        return "border-warning/50 bg-warning/5";
    }
  };

  const navigate = useNavigate(); // Add this hook

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your vehicles and violations
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {stats.overdueFines > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {stats.overdueFines}
                </Badge>
              )}
            </Button>
            {/* REMOVE THIS BUTTON: */}
            {/* <Button
              variant="destructive"
              size="sm"
              className="ml-2 px-4 py-2 font-bold bg-gradient-to-r from-primary to-warning text-white shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border-border/50 hover:border-info/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Violations
                </p>
                <p className="text-3xl font-bold text-info">
                  {isLoadingViolations ? "..." : stats.totalViolations}
                </p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">All time record</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-warning/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-3xl font-bold text-warning">
                  {stats.pendingFines}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Requires payment</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Fines</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.overdueFines}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <XCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-primary">Immediate action required</p>
            </div>
          </Card>

          <LiveSpeedometer />
        </div>

        {/* My Vehicles & Recent Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Vehicles */}
          {/* My Vehicle */}
          {/* My Vehicle */}
          <div>
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Vehicle</h2>
                <Link to="/user/vehicles">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {vehicles.length > 0 ? (
                <VehicleCard vehicle={vehicles[0]} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No vehicle assigned.
                </p>
              )}
            </Card>
          </div>
          {/* Recent Violations */}
          {/* Recent Violations */}

          <div className="lg:col-span-2">
            <Card className="p-3 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Recent Violations</h2>
                  <p className="text-sm text-muted-foreground">
                    Latest traffic violations for your vehicles
                  </p>
                </div>
                <Link to="/user/violations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {violations
                  .filter((violation) => violation.speed > 70) // ✅ only show speed > 70
                  .map((violation) => {
                    const limit = 70;
                    const excess = violation.speed - limit;
                    const fine = violation.predictedFine || 150;

                    return (
                      <div
                        key={violation._id}
                        className="p-4 rounded-lg border transition-all duration-300 border-warning/50 bg-warning/5"
                      >
                        {/* Mobile and Desktop Layout */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                          {/* Main Content */}
                          <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                            {/* Map Pin Icon */}
                            <div className="p-2 bg-accent/30 rounded-lg flex-shrink-0">
                              <button
                                onClick={() => {
                                  setMapLocation(violation.location);
                                  setMapOpen(true);
                                }}
                                className="focus:outline-none"
                                title="View Location"
                              >
                                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                              </button>
                            </div>

                            {/* Violation Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-sm lg:text-base">
                                  Speed Violation
                                </span>
                              </div>

                              {/* Date and Location - Responsive Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground mb-3">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {new Date(
                                      violation.timestamp
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                      violation.timestamp
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {violation.location.lat.toFixed(4)},{" "}
                                    {violation.location.lng.toFixed(4)}
                                  </span>
                                </div>
                              </div>

                              {/* Speed Details - Responsive Layout */}
                              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                                <span className="bg-primary/10 px-2 py-1 rounded">
                                  Speed:{" "}
                                  <strong className="text-primary">
                                    {violation.speed} km/h
                                  </strong>
                                </span>
                                <span className="bg-muted/50 px-2 py-1 rounded">
                                  Limit: <strong>{limit} km/h</strong>
                                </span>
                                <span className="bg-warning/10 px-2 py-1 rounded">
                                  Excess:{" "}
                                  <strong className="text-warning">
                                    +{excess.toFixed(2)} km/h
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Fine Amount and Pay Button - Responsive */}
                          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:text-right lg:ml-4 flex-shrink-0">
                            <div className="text-xl lg:text-2xl font-bold text-primary mb-0 lg:mb-1">
                              Rs. {fine.toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Pay Now</span>
                              <span className="sm:hidden">Pay</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        </div>

        {/* Map Modal */}
        {mapOpen && mapLocation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setMapOpen(false)} // <-- Add this
          >
            <div
              className="bg-white rounded-lg shadow-lg p-4 relative w-[90vw] max-w-xl h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()} // <-- Prevent closing when clicking inside modal
            >
              <button
                className="absolute top-2 right-2 text-xl"
                onClick={() => setMapOpen(false)}
              >
                ×
              </button>
              <div className="flex-1">
                <MapContainer
                  center={[mapLocation.lat, mapLocation.lng]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[mapLocation.lat, mapLocation.lng]}>
                    <Popup>Violation Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {stats.overdueFines > 0 && (
          <Card className="p-6 bg-gradient-card border-primary/50">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Urgent: Overdue Fines
                </h3>
                <p className="text-muted-foreground mb-4">
                  You have {stats.overdueFines} overdue fine
                  {stats.overdueFines > 1 ? "s" : ""} that require immediate
                  attention. Late fees may apply if not paid promptly.
                </p>
                <div className="flex space-x-3">
                  <Link to="/user/payments">
                    <Button
                      variant="default"
                      size="sm"
                      className="shadow-glow-primary"
                    >
                      Pay All Fines
                    </Button>
                  </Link>
                  <Link to="/user/violations">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
