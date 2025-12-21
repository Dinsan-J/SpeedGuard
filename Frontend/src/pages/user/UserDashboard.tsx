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
  iotDeviceId?: string;
  currentSpeed?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastUpdated?: string;
}

// Enhanced Violation interface with ML risk assessment
interface Violation {
  _id: string;
  vehicleId: string;
  location: { lat: number; lng: number };
  speed: number;
  speedLimit?: number;
  timestamp: string;
  fine?: number;
  baseFine?: number;
  zoneMultiplier?: number;
  riskMultiplier?: number;
  predictedFine?: number;
  status?: string;
  driverConfirmed?: boolean;
  drivingLicenseId?: string;
  
  // Geofencing data
  sensitiveZone?: {
    isInZone: boolean;
    zoneType?: string;
    zoneName?: string;
    distanceFromZone?: number;
    zoneRadius?: number;
  };
  
  // ML Risk Assessment
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  riskFactors?: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  
  // Merit Points
  meritPointsDeducted?: number;
  meritPointsApplied?: boolean;
  
  // Fine breakdown
  fineBreakdown?: {
    base: number;
    zoneAdjustment: number;
    riskAdjustment: number;
    total: number;
  };
}

const UserDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showQRVehicleId, setShowQRVehicleId] = useState<string | null>(null);
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
      if (data.success) {
        setVehicles(data.vehicles);
        // Auto-select first vehicle if none selected
        if (data.vehicles.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(data.vehicles[0]._id);
        }
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchViolations = async () => {
      setIsLoadingViolations(true);
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      
      try {
        const response = await fetch(`${API_URL}/api/violation`);
        const data = await response.json();
        
        if (data.success) {
          // Use the fine from geofencing service, fallback to calculation if needed
          const violationsWithFines = data.violations.map((v: Violation) => {
            const calculatedFine = v.fine || (v.baseFine || 2000) * (v.zoneMultiplier || 1);
            return { ...v, predictedFine: calculatedFine };
          });
          
          setViolations(violationsWithFines);
          setIsLoadingViolations(false);
        } else {
          setIsLoadingViolations(false);
        }
      } catch (error) {
        console.error('Failed to fetch violations:', error);
        setIsLoadingViolations(false);
      }
    };
    fetchViolations();
  }, []);

  // Show all violations with speed > 70
  const filteredViolations = violations.filter((v) => {
    return v.speed > 70;
  });

  const stats = {
    totalViolations: filteredViolations.length,
    pendingFines: filteredViolations.length,
    overdueFines: 0,
    totalFines: filteredViolations.reduce((sum, v) => sum + (v.predictedFine || 0), 0),
    unpaidFines: filteredViolations.reduce((sum, v) => sum + (v.predictedFine || 0), 0),
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
                {isLoadingViolations ? (
                  <div className="flex items-center space-x-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-info"></div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-info">
                    {stats.totalViolations}
                  </p>
                )}
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
                {isLoadingViolations ? (
                  <div className="flex items-center space-x-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-warning"></div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-warning">
                    {stats.pendingFines}
                  </p>
                )}
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
                {isLoadingViolations ? (
                  <div className="flex items-center space-x-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-primary">
                    {stats.overdueFines}
                  </p>
                )}
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
          <div>
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Vehicles</h2>
                <Link to="/user/vehicles">
                  <Button variant="outline" size="sm">
                    <Car className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle._id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        selectedVehicleId === vehicle._id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border/50 bg-accent/20 hover:border-primary/50"
                      }`}
                    >
                      <div 
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => setSelectedVehicleId(vehicle._id)}
                      >
                        <div className={`p-2 rounded-lg ${
                          selectedVehicleId === vehicle._id ? "bg-primary/20" : "bg-info/10"
                        }`}>
                          <Car className={`h-5 w-5 ${
                            selectedVehicleId === vehicle._id ? "text-primary" : "text-info"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold">{vehicle.plateNumber}</div>
                            {vehicle.iotDeviceId && (
                              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                IoT Connected
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          {vehicle.iotDeviceId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Device: {vehicle.iotDeviceId}
                            </div>
                          )}
                        </div>
                        {selectedVehicleId === vehicle._id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      {/* QR Code Section */}
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowQRVehicleId(showQRVehicleId === vehicle._id ? null : vehicle._id);
                          }}
                        >
                          <QrCode className="h-3 w-3 mr-2" />
                          {showQRVehicleId === vehicle._id ? "Hide QR Code" : "Show QR Code"}
                        </Button>

                        {showQRVehicleId === vehicle._id && (
                          <div className="mt-3 p-3 bg-white rounded-lg flex flex-col items-center animate-fade-in">
                            <QRCode
                              value={JSON.stringify({ vehicleId: vehicle.plateNumber })}
                              size={120}
                              level="M"
                            />
                            <p className="text-xs text-center text-muted-foreground mt-2">
                              {vehicle.plateNumber}
                            </p>
                            <p className="text-xs text-center text-muted-foreground">
                              Show to officers when requested
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No vehicles added yet
                    </p>
                    <Link to="/user/vehicles">
                      <Button size="sm" className="shadow-glow-primary">
                        <Car className="h-4 w-4 mr-2" />
                        Add Your First Vehicle
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
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
                {isLoadingViolations ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading violations...</p>
                  </div>
                ) : violations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-muted-foreground">No violations found for this vehicle</p>
                  </div>
                ) : (
                  violations
                  .filter((violation) => {
                    // Show all violations with speed > 70, regardless of vehicle selection
                    return violation.speed > 70;
                  })
                  .map((violation) => {
                    const limit = violation.speedLimit || 70;
                    const excess = violation.speed - limit;
                    // Use geofencing fine if available, otherwise calculate fallback
                    const fine = violation.fine || violation.predictedFine || (2000 * (violation.zoneMultiplier || 1));

                    return (
                      <div
                        key={violation._id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          violation.sensitiveZone?.isInZone 
                            ? "border-destructive/50 bg-destructive/5" 
                            : "border-warning/50 bg-warning/5"
                        }`}
                      >
                        {/* ML Risk Assessment Alert */}
                        {violation.riskLevel === 'high' && (
                          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                              <span className="font-medium text-destructive">
                                🤖 HIGH RISK VIOLATION
                              </span>
                              <Badge variant="destructive" className="text-xs ml-2">
                                {Math.round((violation.riskScore || 0) * 100)}% Risk
                              </Badge>
                            </div>
                            <div className="text-destructive/80 mt-1">
                              Merit Points: -{violation.meritPointsDeducted || 0} • Risk Multiplier: {violation.riskMultiplier || 1.0}x
                            </div>
                          </div>
                        )}

                        {/* Sensitive Zone Alert */}
                        {violation.sensitiveZone?.isInZone && (
                          <div className="mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                              <span className="font-medium text-warning">
                                🚨 SENSITIVE ZONE: {violation.sensitiveZone.zoneName}
                              </span>
                            </div>
                            <div className="text-warning/80 mt-1">
                              {violation.sensitiveZone.zoneType} • {Math.round(violation.sensitiveZone.distanceFromZone || 0)}m from center • {violation.zoneMultiplier}x zone multiplier
                            </div>
                          </div>
                        )}

                        {/* Merit Points Applied Status */}
                        {violation.meritPointsApplied && (
                          <div className="mb-3 p-2 bg-success/10 border border-success/20 rounded text-xs">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-success" />
                              <span className="font-medium text-success">
                                ✅ MERIT POINTS APPLIED AUTOMATICALLY
                              </span>
                            </div>
                            <div className="text-success/80 mt-1">
                              -{violation.meritPointsDeducted} merit points deducted • Fine: LKR {violation.finalFine}
                            </div>
                          </div>
                        )}

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
                                {violation.sensitiveZone?.isInZone && (
                                  <Badge variant="destructive" className="text-xs">
                                    {violation.sensitiveZone.zoneType}
                                  </Badge>
                                )}
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
                                  🚗 Speed:{" "}
                                  <strong className="text-primary">
                                    {violation.speed} km/h
                                  </strong>
                                </span>
                                <span className="bg-muted/50 px-2 py-1 rounded">
                                  🚦 Limit: <strong>{limit} km/h</strong>
                                  <span className="text-xs ml-1">
                                    ({violation.sensitiveZone?.isInZone ? 'Sensitive' : 'Normal'})
                                  </span>
                                </span>
                                <span className="bg-warning/10 px-2 py-1 rounded">
                                  📊 Excess:{" "}
                                  <strong className="text-warning">
                                    +{excess} km/h
                                  </strong>
                                </span>
                              </div>

                              {/* Enhanced Fine Breakdown */}
                              {(violation.baseFine || violation.zoneMultiplier || violation.riskMultiplier) && (
                                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                  <div>
                                    💰 Base: LKR {(violation.baseFine || 2000).toLocaleString()} 
                                    × {violation.zoneMultiplier || 1}x (zone)
                                    × {violation.riskMultiplier || 1.0}x (risk)
                                    = LKR {fine.toLocaleString()}
                                  </div>
                                  {violation.riskLevel && (
                                    <div className="flex items-center gap-1">
                                      <span>🤖 ML Risk:</span>
                                      <Badge 
                                        variant={violation.riskLevel === 'high' ? 'destructive' : 
                                                violation.riskLevel === 'medium' ? 'secondary' : 'outline'}
                                        className="text-xs"
                                      >
                                        {violation.riskLevel.toUpperCase()}
                                      </Badge>
                                      {violation.meritPointsDeducted && (
                                        <span className="text-destructive">
                                          -{violation.meritPointsDeducted} merit points
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Fine Amount and Pay Button - Responsive */}
                          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:text-right lg:ml-4 flex-shrink-0">
                            <div className="text-xl lg:text-2xl font-bold text-primary mb-0 lg:mb-1">
                              LKR {fine.toLocaleString()}
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
                  })
                )}
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
