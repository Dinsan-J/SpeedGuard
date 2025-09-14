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
  Car,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Camera,
  ScanLine,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import QrScanner from "qr-scanner";

const OfficerQRSearch = () => {
  const [qrInput, setQrInput] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Start the camera and QR scanner
  const startCamera = async () => {
    try {
      setCameraError("");
      setIsScanning(true);

      if (!videoRef.current) throw new Error("Video element not ready");

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          console.log("QR Code detected:", result.data);
          setQrInput(result.data);

          // Fetch vehicle info from backend
          try {
            const res = await fetch(
              `https://speedguard-gz70.onrender.com/vehicles/${result.data}`
            );
            const data = await res.json();
            if (data.success) {
              setSearchResults(data.vehicle);
            } else {
              setCameraError("Vehicle not found");
              setSearchResults(null);
            }
          } catch (err) {
            console.error("Error fetching vehicle:", err);
            setCameraError("Error fetching vehicle");
            setSearchResults(null);
          }

          stopCamera();
        },
        {
          onDecodeError: () => {}, // ignore decode errors
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        }
      );

      await qrScannerRef.current.start();
      setCameraReady(true);
      setIsScanning(false);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(
        `Unable to access camera: ${
          error instanceof Error
            ? error.message
            : "Please allow camera permissions"
        }`
      );
      setIsScanning(false);
      setCameraReady(false);
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
    setCameraReady(false);
  };

  const handleScan = () => {
    setIsCameraOpen(true);
    setTimeout(startCamera, 300); // small delay for dialog render
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">QR Vehicle Search</h1>
            <p className="text-muted-foreground">
              Scan QR code to get vehicle information
            </p>
          </div>
          <Link to="/officer/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Scan Button */}
        <Card className="p-8 bg-gradient-card border-border/50 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Vehicle QR Scanner</h2>
          <p className="text-muted-foreground mb-4">
            Scan or enter QR code to get vehicle information
          </p>

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
        </Card>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Vehicle Information</h3>
                <Badge
                  className={`px-3 py-1 ${
                    searchResults.status === "Active"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {searchResults.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        License Plate
                      </p>
                      <p className="text-xl font-bold">{searchResults.plate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <User className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-semibold">{searchResults.owner}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vehicle Model
                    </p>
                    <p className="font-semibold">{searchResults.model}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-info/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Registration Date
                      </p>
                      <p className="font-semibold">
                        {searchResults.registrationDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Violation History */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-2xl font-bold mb-6">Violation History</h3>
              <div className="space-y-4">
                {searchResults.violations.map((violation: any) => (
                  <div
                    key={violation.id}
                    className="p-4 rounded-lg border border-border bg-accent/20 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            violation.status === "Paid"
                              ? "bg-secondary/20"
                              : "bg-warning/20"
                          }`}
                        >
                          {violation.status === "Paid" ? (
                            <CheckCircle className="h-5 w-5 text-secondary" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {violation.type}
                            </span>
                            <Badge
                              variant={
                                violation.status === "Paid"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {violation.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {violation.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {violation.date}
                            </div>
                          </div>
                          {violation.speed && (
                            <p className="text-sm text-warning mt-1">
                              Speed: {violation.speed} (Limit: {violation.limit}
                              )
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {violation.fine}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Camera Scanner Modal */}
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
                {(isScanning || !cameraReady) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-white text-center">
                      <ScanLine className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p>
                        {isScanning
                          ? "Starting camera..."
                          : "Position QR code in view"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Position the QR code within the camera view
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
