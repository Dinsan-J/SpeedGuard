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
          } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Scanner Card */}
        <Card className="p-6 bg-white/80 backdrop-blur border shadow-xl rounded-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Vehicle QR Scanner
            </h2>
            <p className="text-muted-foreground text-sm">
              Scan QR code to fetch vehicle details instantly
            </p>
          </div>
          <div className="text-center">
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full rounded-xl py-5 text-lg font-semibold shadow-md hover:scale-[1.02] transition-transform"
            >
              {isScanning ? (
                <>
                  <ScanLine className="h-5 w-5 mr-2 animate-pulse" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
            {cameraError && (
              <p className="text-sm text-red-600 mt-3">{cameraError}</p>
            )}
          </div>
        </Card>

        {/* Vehicle Info */}
        {vehicleData && (
          <Card className="p-6 bg-white shadow-lg rounded-2xl border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Vehicle Information</h3>
              <Badge
                className={`px-3 py-1 rounded-full text-sm font-medium shadow ${
                  vehicleData.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {vehicleData.status || "Active"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      License Plate
                    </p>
                    <p className="text-xl font-bold">
                      {vehicleData.plateNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <User className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Owner
                    </p>
                    <p className="text-lg font-semibold">
                      {vehicleData.owner || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Vehicle Model
                  </p>
                  <p className="text-lg font-semibold">
                    {vehicleData.make} {vehicleData.model}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Year
                    </p>
                    <p className="text-lg font-semibold">{vehicleData.year}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Violations */}
            <h3 className="text-xl font-bold mb-4">Violation History</h3>
            <div className="space-y-4">
              {vehicleData.violations &&
              vehicleData.violations.filter((v: any) => v.speed > 70).length >
                0 ? (
                vehicleData.violations
                  .filter((v: any) => v.speed > 70)
                  .map((v: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border bg-red-50/40 hover:bg-red-50 transition shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-red-700">
                          Speed Violation
                        </span>
                        <Badge
                          variant={
                            v.status === "Paid" ? "secondary" : "destructive"
                          }
                        >
                          {v.status}
                        </Badge>
                        <button
                          onClick={() => {
                            setMapLocation(v.location);
                            setMapOpen(true);
                          }}
                          className="ml-2 p-1.5 rounded-lg hover:bg-red-100 transition"
                          title="View Location"
                          type="button"
                        >
                          <MapPin className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>Speed: {v.speed} km/h</p>
                        <p>
                          Location: {v.location.lat}, {v.location.lng}
                        </p>
                        <p>Date: {new Date(v.timestamp).toLocaleString()}</p>
                        {v.fine && <p>Fine: ${v.fine}</p>}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No violations found
                </p>
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
          <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b">
              <DialogTitle className="flex items-center space-x-2 font-semibold">
                <Camera className="h-5 w-5" />
                <span>QR Code Scanner</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopCamera}
                  className="ml-auto rounded-full hover:bg-red-100"
                >
                  <X className="h-5 w-5 text-red-600" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-72 bg-black object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-white text-center animate-pulse">
                      <ScanLine className="h-10 w-10 mx-auto mb-2" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="w-full rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Map Modal */}
        {mapOpen && mapLocation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            onClick={() => setMapOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-4 relative w-[92vw] max-w-2xl h-[65vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-xl bg-gray-100 rounded-full px-2 hover:bg-red-100"
                onClick={() => setMapOpen(false)}
              >
                ×
              </button>
              <div className="flex-1 rounded-xl overflow-hidden">
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
