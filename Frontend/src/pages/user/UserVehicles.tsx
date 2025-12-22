import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Car,
  QrCode,
  Settings,
  AlertTriangle,
  CheckCircle,
  Scan,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/QRScanner";
import VehicleRegistrationModal from "@/components/VehicleRegistrationModal";

const UserVehicles = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [scannedVehicleData, setScannedVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockUser = {
    id: "64f8c2e2a1b2c3d4e5f6a7b8", // <-- Replace with a real MongoDB ObjectId
    name: "John Smith",
    role: "user" as const,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Active
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="secondary"
            className="bg-warning text-warning-foreground"
          >
            Warning
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="shadow-glow-destructive">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
      case "expired":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const isExpiringWithin30Days = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  // Handle QR code scan
  const handleQRScan = async (qrData: string) => {
    try {
      const vehicleData = JSON.parse(qrData);
      
      // Check if this device is already registered
      const response = await fetch(
        `https://speedguard-gz70.onrender.com/api/vehicle/check-device/${vehicleData.deviceId}`,
        { credentials: "include" }
      );
      
      const data = await response.json();
      
      if (data.exists) {
        // Vehicle already exists, connect it to this user
        await connectExistingVehicle(vehicleData.deviceId);
      } else {
        // New vehicle, show registration modal
        setScannedVehicleData(vehicleData);
        setShowQRScanner(false);
        setShowRegistrationModal(true);
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not valid.",
        variant: "destructive",
      });
      setShowQRScanner(false);
    }
  };

  // Connect existing vehicle to user
  const connectExistingVehicle = async (deviceId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://speedguard-gz70.onrender.com/api/vehicle/connect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            userId: mockUser.id, 
            deviceId 
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Vehicle Connected",
          description: "Vehicle has been connected to your account.",
        });
        fetchVehicles(); // Refresh vehicle list
      } else {
        toast({
          title: "Connection Failed",
          description: data.message || "Failed to connect vehicle.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowQRScanner(false);
    }
  };

  // Register new vehicle
  const handleVehicleRegistration = async (vehicleData: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://speedguard-gz70.onrender.com/api/vehicle/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            userId: mockUser.id, 
            vehicleData: {
              ...vehicleData,
              iotDeviceId: scannedVehicleData?.deviceId
            }
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Vehicle Registered",
          description: "Your vehicle has been registered successfully.",
        });
        setShowRegistrationModal(false);
        setScannedVehicleData(null);
        fetchVehicles(); // Refresh vehicle list
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register vehicle.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(
        `https://speedguard-gz70.onrender.com/api/vehicle/delete/${vehicleId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: mockUser.id }), // use mockUser.id
        }
      );
      const data = await response.json();
      if (data.success) {
        // Optionally refresh vehicle list here
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        `https://speedguard-gz70.onrender.com/api/vehicle/user/${mockUser.id}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) setVehicles(data.vehicles);
      else
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
    } catch {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                My Vehicles
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your registered vehicles and view their status
              </p>
            </div>
            <Button
              className="shadow-glow-primary"
              onClick={() => setShowQRScanner(true)}
            >
              <Scan className="h-4 w-4 mr-2" />
              Connect Vehicle
            </Button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300 group cursor-pointer"
              onClick={() =>
                setSelectedVehicle(
                  selectedVehicle === vehicle.id ? null : vehicle.id
                )
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {getStatusIcon(vehicle.status)}
                    {vehicle.plateNumber}
                  </CardTitle>
                  {getStatusBadge(vehicle.status)}
                </div>
                <p className="text-muted-foreground">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Violations</p>
                    <p className="font-medium flex items-center gap-1">
                      {vehicle.violations > 0 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {vehicle.violations}
                    </p>
                  </div>
                </div>

                {/* IoT Device Info */}
                {vehicle.iotDeviceId && (
                  <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-success">IoT Device Connected</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Device ID: {vehicle.iotDeviceId}
                    </p>
                    {vehicle.currentSpeed !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Current Speed: {vehicle.currentSpeed} km/h
                      </p>
                    )}
                  </div>
                )}

                {/* Expiry Information */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                    <span className="text-sm">Registration</span>
                    <span
                      className={`text-sm font-medium ${
                        isExpired(vehicle.registrationExpiry)
                          ? "text-destructive"
                          : isExpiringWithin30Days(vehicle.registrationExpiry)
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {vehicle.registrationExpiry}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                    <span className="text-sm">Insurance</span>
                    <span
                      className={`text-sm font-medium ${
                        isExpired(vehicle.insuranceExpiry)
                          ? "text-destructive"
                          : isExpiringWithin30Days(vehicle.insuranceExpiry)
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {vehicle.insuranceExpiry}
                    </span>
                  </div>
                </div>

                {/* QR Code Section */}
                {selectedVehicle === vehicle.id && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium">Vehicle QR Code</span>
                    </div>
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-white rounded-lg">
                        <QRCodeSVG
                          value={vehicle.qrCode}
                          size={120}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Show this QR code to traffic officers when requested
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVehicle(
                        selectedVehicle === vehicle.id ? null : vehicle.id
                      );
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {selectedVehicle === vehicle.id ? "Hide QR" : "Show QR"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>

                {/* Warnings */}
                {(isExpired(vehicle.registrationExpiry) ||
                  isExpired(vehicle.insuranceExpiry)) && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Expired Documents
                      </span>
                    </div>
                    <p className="text-xs text-destructive/80 mt-1">
                      Please renew your expired documents to avoid fines
                    </p>
                  </div>
                )}

                {(isExpiringWithin30Days(vehicle.registrationExpiry) ||
                  isExpiringWithin30Days(vehicle.insuranceExpiry)) &&
                  !isExpired(vehicle.registrationExpiry) &&
                  !isExpired(vehicle.insuranceExpiry) && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Expiring Soon
                        </span>
                      </div>
                      <p className="text-xs text-warning/80 mt-1">
                        Some documents expire within 30 days
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {vehicles.length === 0 && (
            <Card className="border-accent/20 shadow-elegant">
              <CardContent className="p-12 text-center">
                <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No vehicles registered
                </h3>
                <p className="text-muted-foreground mb-4">
                  Connect your first vehicle by scanning its QR code
                </p>
                <Button 
                  className="shadow-glow-primary"
                  onClick={() => setShowQRScanner(true)}
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Connect Your First Vehicle
                </Button>
              </CardContent>
            </Card>
          )}

          {/* QR Scanner */}
          <QRScanner
            isOpen={showQRScanner}
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />

          {/* Vehicle Registration Modal */}
          <VehicleRegistrationModal
            isOpen={showRegistrationModal}
            vehicleData={scannedVehicleData}
            onClose={() => {
              setShowRegistrationModal(false);
              setScannedVehicleData(null);
            }}
            onRegister={handleVehicleRegistration}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default UserVehicles;
