import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Camera,
  ScanLine,
  X,
  Car,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MapPin,
} from "lucide-react";
import QrScanner from "qr-scanner";

const OfficerQRSearch = () => {
  const [qrInput, setQrInput] = useState("");
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const startCamera = async () => {
    try {
      setCameraError("");
      setIsScanning(true);

      if (!videoRef.current) throw new Error("Camera not ready");

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            const decoded = JSON.parse(result.data);
            if (!decoded.vehicleId) throw new Error("Invalid QR code");

            setQrInput(decoded.vehicleId);

            // Fetch vehicle info from backend using plateNumber
            const response = await fetch(
              `https://speedguard-gz70.onrender.com/api/vehicle/plate/${decoded.vehicleId}`
            );
            const data = await response.json();
            if (data.success) {
              setVehicleData(data.vehicle);
            } else {
              setCameraError("Vehicle not found");
              setVehicleData(null);
            }
          } catch (err) {
            setCameraError("Invalid QR code or backend error");
            setVehicleData(null);
          }
          stopCamera();
        },
        { preferredCamera: "environment" }
      );

      await qrScannerRef.current.start();
      setIsScanning(false);
    } catch (err: any) {
      setCameraError(err.message || "Camera error");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsCameraOpen(false);
    setIsScanning(false);
  };

  const handleScan = () => {
    setIsCameraOpen(true);
    setTimeout(startCamera, 300);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-5 bg-gradient-card border-border/50">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <QrCode className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Vehicle QR Scanner</h2>
            <p className="text-muted-foreground">
              Scan QR code to get vehicle info
            </p>
          </div>
          <div className="text-center">
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full"
              variant="secondary"
            >
              {isScanning ? (
                <>
                  <ScanLine className="h-4 w-4 mr-2 animate-pulse" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan QR Code
                </>
              )}
            </Button>
            {cameraError && (
              <p className="text-sm text-destructive mt-2">{cameraError}</p>
            )}
          </div>
        </Card>

        {/* Vehicle Info */}
        {vehicleData && (
          <Card className="p-4 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold">Vehicle Information</h3>
              <Badge
                className={`px-3 py-1 ${
                  vehicleData.status === "Active"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {vehicleData.status || "Active"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      License Plate
                    </p>
                    <p className="text-xl font-bold">
                      {vehicleData.plateNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <User className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-semibold">
                      {vehicleData.owner || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Model</p>
                  <p className="font-semibold">
                    {vehicleData.make} {vehicleData.model}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-semibold">{vehicleData.year}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Violations */}
            <h3 className="text-2xl font-bold mb-4">Violation History</h3>
            <div className="space-y-4">
              {vehicleData.violations &&
              vehicleData.violations.filter((v: any) => v.speed > 70).length >
                0 ? (
                vehicleData.violations
                  .filter((v: any) => v.speed > 70)
                  .map((v: any, index: number) => {
                    const limit = 70;
                    const excess = v.speed - limit;
                    const fine = v.fine || 150;
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg border transition-all duration-300 border-warning/50 bg-warning/5 flex flex-col justify-between"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-accent/30 rounded-lg">
                            <button
                              onClick={() => {
                                setMapLocation(v.location);
                                setMapOpen(true);
                              }}
                              className="focus:outline-none"
                              title="View Location"
                              type="button"
                            >
                              <MapPin className="h-5 w-5 text-primary" />
                            </button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold">
                                Speed Violation
                              </span>
                              <Badge
                                variant={
                                  v.status === "Paid"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {v.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(
                                  v.timestamp
                                ).toLocaleDateString()} at{" "}
                                {new Date(v.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {v.location.lat}, {v.location.lng}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                              <span>
                                Speed:{" "}
                                <strong className="text-primary">
                                  {v.speed} km/h
                                </strong>
                              </span>
                              <span>
                                Limit: <strong>{limit} km/h</strong>
                              </span>
                              <span>
                                Excess:{" "}
                                <strong className="text-warning">
                                  +{excess.toFixed(2)} km/h
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right mt-4">
                          <div className="text-2xl font-bold text-primary mb-1">
                            ${fine}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <CreditCard className="h-3 w-3 mr-1" /> Pay Now
                          </Button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-full text-center text-muted-foreground">
                  No violations found.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Camera Modal */}
        <Dialog
          open={isCameraOpen}
          onOpenChange={(open) => {
            if (!open) stopCamera();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>QR Code Scanner</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopCamera}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-white text-center">
                      <ScanLine className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={stopCamera} variant="outline" className="w-full">
                Cancel Scanning
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Map Modal */}
        {mapOpen && mapLocation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setMapOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-4 relative w-[90vw] max-w-xl h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
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
      </div>
    </div>
  );
};

export default OfficerQRSearch;
