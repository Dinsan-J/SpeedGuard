import { useState } from "react";
import { Car, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface Vehicle {
  _id: string;
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

  // QR code only contains vehicle _id
  const qrValue = JSON.stringify({ vehicleId: vehicle._id });

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
            <span className="text-sm font-mono">{vehicle._id}</span>
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
        {showQR && (
          <div className="mt-4 flex justify-center p-4 bg-white rounded-lg border border-border/50">
            <QRCode value={qrValue} size={150} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
