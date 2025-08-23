import { useState } from "react";
import { Navbar } from "@/components/Layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Car,
  Plus,
  QrCode,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const UserVehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
    registrationExpiry: "",
    insuranceExpiry: "",
  });

  const mockUser = {
    id: "1",
    name: "John Smith",
    role: "user" as const,
  };

  const mockVehicles = [
    {
      id: "1",
      plateNumber: "ABC-123",
      make: "Toyota",
      model: "Camry",
      year: "2020",
      color: "Blue",
      status: "active",
      registrationExpiry: "2024-12-15",
      insuranceExpiry: "2024-08-30",
      violations: 2,
      lastViolation: "2024-01-15",
      qrCode: "QR-ABC123-TOYOTA-CAMRY",
    },
    {
      id: "2",
      plateNumber: "XYZ-789",
      make: "Honda",
      model: "Civic",
      year: "2019",
      color: "Red",
      status: "warning",
      registrationExpiry: "2024-03-20",
      insuranceExpiry: "2024-06-15",
      violations: 0,
      lastViolation: null,
      qrCode: "QR-XYZ789-HONDA-CIVIC",
    },
    {
      id: "3",
      plateNumber: "DEF-456",
      make: "BMW",
      model: "X5",
      year: "2021",
      color: "Black",
      status: "expired",
      registrationExpiry: "2023-12-01",
      insuranceExpiry: "2024-09-10",
      violations: 1,
      lastViolation: "2024-01-10",
      qrCode: "QR-DEF456-BMW-X5",
    },
  ];

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

  // Example function for adding a vehicle
  const handleAddVehicle = async (vehicleData) => {
    try {
      const response = await fetch(
        "https://speedguard-gz70.onrender.com/api/vehicle/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, vehicleData }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Update UI, e.g., fetch vehicles again
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

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(
        `https://speedguard-gz70.onrender.com/api/vehicle/delete/${vehicleId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Update UI, e.g., fetch vehicles again
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={mockUser} />

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
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockVehicles.map((vehicle) => (
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
        </div>

        {/* Empty State */}
        {mockVehicles.length === 0 && (
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No vehicles registered
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first vehicle to start managing it with SpeedGuard
              </p>
              <Button className="shadow-glow-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Vehicle Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAddVehicle(newVehicle);
                  setShowAddModal(false);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Plate Number"
                  value={newVehicle.plateNumber}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      plateNumber: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Make"
                  value={newVehicle.make}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, make: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newVehicle.model}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, model: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={newVehicle.year}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, year: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={newVehicle.color}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, color: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="date"
                  placeholder="Registration Expiry"
                  value={newVehicle.registrationExpiry}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      registrationExpiry: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <input
                  type="date"
                  placeholder="Insurance Expiry"
                  value={newVehicle.insuranceExpiry}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      insuranceExpiry: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <div className="flex gap-2 mt-4">
                  <Button type="submit" className="flex-1">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVehicles;
