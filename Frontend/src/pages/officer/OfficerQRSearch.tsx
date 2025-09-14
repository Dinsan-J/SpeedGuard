import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, MapPin, Calendar } from "lucide-react";
import {
  BrowserMultiFormatReader,
  Result,
  VideoInputDevice,
} from "@zxing/browser";

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
  const [scanResult, setScanResult] = useState<string>("");
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader()).current;

  useEffect(() => {
    return () => {
      codeReader.reset(); // cleanup on unmount
    };
  }, [codeReader]);

  const startScan = async () => {
    setScanning(true);
    setError("");
    try {
      const devices: VideoInputDevice[] =
        await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
      if (!selectedDeviceId) {
        setError("No camera device found");
        setScanning(false);
        return;
      }

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result: Result | undefined, err: any) => {
          if (result) {
            try {
              const parsed: Vehicle = JSON.parse(result.getText());
              setVehicleData(parsed);
              setScanResult(result.getText());
              setError("");
              setScanning(false);
              codeReader.reset();
            } catch (err) {
              setError("Invalid QR code data");
              setVehicleData(null);
            }
          }
          // ignore "not found" errors; only log other errors
          if (err && err.name !== "NotFoundException") {
            console.error(err);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setError("Error initializing QR scanner");
      setScanning(false);
    }
  };

  const stopScan = () => {
    codeReader.reset();
    setScanning(false);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <h1 className="text-3xl font-bold mb-6">Scan Vehicle QR</h1>

      {/* QR Scanner */}
      <div className="mb-6">
        {!scanning ? (
          <Button onClick={startScan}>Start Scan</Button>
        ) : (
          <Button variant="destructive" onClick={stopScan}>
            Stop Scan
          </Button>
        )}
        <video
          ref={videoRef}
          className="mt-4 w-full max-w-md border rounded-lg"
        />
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
