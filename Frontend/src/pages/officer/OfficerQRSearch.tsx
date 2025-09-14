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
} from "lucide-react";
import QrScanner from "qr-scanner";

const OfficerQRSearch = () => {
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const startCamera = async () => {
    try {
      setCameraError("");
      setIsScanning(true);

      if (!videoRef.current) throw new Error("Camera not ready");

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const decoded = JSON.parse(result.data);
            setVehicleData(decoded);
          } catch (err) {
            setCameraError("Invalid QR code");
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-8 bg-gradient-card border-border/50">
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
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Vehicle Information</h3>
              <Badge
                className={`px-3 py-1 ${
                  vehicleData.status === "active"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {vehicleData.status || "Active"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                      {vehicleData.owner?.name || "Unknown"}
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
              {vehicleData.violations && vehicleData.violations.length > 0 ? (
                vehicleData.violations.map((v: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-accent/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${
                          v.status === "Paid"
                            ? "bg-secondary/20"
                            : "bg-warning/20"
                        }`}
                      >
                        {v.status === "Paid" ? (
                          <CheckCircle className="h-5 w-5 text-secondary" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            {v.type || "Violation"}
                          </span>
                          <Badge
                            variant={
                              v.status === "Paid" ? "secondary" : "destructive"
                            }
                          >
                            {v.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {v.speed && <p>Speed: {v.speed} km/h</p>}
                          {v.location && (
                            <p>
                              Location: {v.location.lat}, {v.location.lng}
                            </p>
                          )}
                          {v.timestamp && (
                            <p>
                              Date: {new Date(v.timestamp).toLocaleString()}
                            </p>
                          )}
                          {v.fine && <p>Fine: ${v.fine}</p>}
                        </div>
                      </div>
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
      </div>
    </div>
  );
};

export default OfficerQRSearch;
