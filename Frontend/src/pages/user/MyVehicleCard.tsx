import { useState } from "react";
import { Car, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code"; // npm install react-qr-code

const MyVehicleCard = ({ vehicle }) => {
  const [showQR, setShowQR] = useState(false);

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
            <span className="text-sm font-mono">{vehicle.qrCode}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setShowQR(!showQR)}
          >
            {showQR ? "Hide QR" : "Show QR"}
          </Button>
        </div>

        {/* QR Code display */}
        {showQR && (
          <div className="mt-4 flex justify-center">
            <QRCode value={vehicle.qrCode} size={128} />
          </div>
        )}
      </div>
    </div>
  );
};
