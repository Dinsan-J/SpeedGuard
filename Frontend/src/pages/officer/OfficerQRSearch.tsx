import { useEffect, useRef, useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import QrScanner from "qr-scanner";

interface Violation {
  location: { lat: number; lng: number };
  speed: number;
  timestamp: string;
  fine: number;
  status: string;
}

interface Vehicle {
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  violations: Violation[];
}

const OfficerQRSearch = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const startCamera = async () => {
    try {
      setError("");
      setIsScanning(true);

      if (!videoRef.current) throw new Error("Camera not ready");

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            const decoded = JSON.parse(result.data); // QR contains { plateNumber }
            if (!decoded.plateNumber) {
              throw new Error("Invalid QR code format");
            }

            // ✅ Fetch full vehicle + violations from backend
            const response = await fetch(
              `https://speedguard-gz70.onrender.com/api/vehicle/plate/${decoded.plateNumber}`
            );
            const data = await response.json();

            if (data.success) {
              setVehicleData(data.vehicle);
              setError("");
            } else {
              setError("Vehicle not found");
              setVehicleData(null);
            }
          } catch (err: any) {
            console.error(err);
            setError("Invalid QR code");
            setVehicleData(null);
          }
          stopCamera();
        },
        { preferredCamera: "environment" } // ✅ back camera
      );

      await qrScannerRef.current.start();
      setIsScanning(false);
    } catch (err: any) {
      setError(err.message || "Camera error");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen p-6 bg-background">
      <h1 className="text-3xl font-bold mb-6">Scan Vehicle QR</h1>

      {/* Camera Button */}
      {!vehicleData && (
        <button
          onClick={startCamera}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          {isScanning ? "Starting Camera..." : "Start Scan"}
        </button>
      )}

      {/* QR Scanner */}
      <div className="mb-6">
        <video ref={videoRef} className="w-full max-w-sm rounded-lg" />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Vehicle Info */}
      {vehicleData && (
        <div className="p-4 bg-accent/20 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{vehicleData.plateNumber}</h2>
            <div className="flex space-x-2 text-sm text-muted-foreground">
              <span>{vehicleData.year}</span>
              <span>{vehicleData.make}</span>
              <span>{vehicleData.model}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {vehicleData.color}
          </div>

          <h3 className="font-semibold mb-2">Violations History</h3>
          {vehicleData.violations.length > 0 ? (
            <div className="space-y-4">
              {vehicleData.violations.map((violation, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border/50 bg-white"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">
                      Speed: {violation.speed} km/h
                    </span>
                    <span className="text-sm">Fine: ${violation.fine}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Status: {violation.status}</span>
                    <span>
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(violation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {violation.location.lat}, {violation.location.lng}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No violations found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OfficerQRSearch;
