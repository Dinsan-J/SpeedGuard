import { useState, useRef } from "react";
import { Car, QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface Vehicle {
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  violations?: any[];
  qrCode?: string;
}

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // QR code only contains plateNumber as vehicleId
  const qrValue = JSON.stringify({ vehicleId: vehicle.plateNumber });

  // Download QR as image
  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new window.Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = `${vehicle.plateNumber}_qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src =
      "data:image/svg+xml;base64," +
      window.btoa(unescape(encodeURIComponent(svgString)));
  };

  return (
    <div className="p-4 bg-accent/20 rounded-lg border border-border/50">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-info/10 rounded-lg">
          <Car className="h-6 w-6 text-info" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">{vehicle.plateNumber}</div>
          <div className="text-sm text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div className="text-xs text-muted-foreground">{vehicle.color}</div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-accent/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{vehicle.plateNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? "Hide QR" : "Show QR"}
            </Button>
            {showQR && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleDownloadQR}
                title="Download QR"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {showQR && (
          <div
            ref={qrRef}
            className="mt-4 flex justify-center p-4 bg-white rounded-lg border border-border/50"
          >
            <QRCode value={qrValue} size={150} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
