import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, X, AlertCircle, CheckCircle } from 'lucide-react';

interface VehicleData {
  deviceId: string;
  vehicleNumber: string;
  vehicleType: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
}

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  vehicleData: VehicleData | null;
  onClose: () => void;
  onRegister: (vehicleData: VehicleData & { registrationExpiry: string; insuranceExpiry: string }) => void;
  isLoading?: boolean;
}

const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({
  isOpen,
  vehicleData,
  onClose,
  onRegister,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    vehicleNumber: vehicleData?.vehicleNumber || '',
    vehicleType: vehicleData?.vehicleType || '',
    make: vehicleData?.make || '',
    model: vehicleData?.model || '',
    year: vehicleData?.year?.toString() || '',
    color: vehicleData?.color || '',
    registrationExpiry: '',
    insuranceExpiry: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleData) return;

    onRegister({
      ...vehicleData,
      ...formData,
      year: parseInt(formData.year) || vehicleData.year || new Date().getFullYear()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'motorcycle': return 'Motorcycle (70 km/h limit)';
      case 'light_vehicle': return 'Light Vehicle - Car, Van, Jeep (70 km/h limit)';
      case 'three_wheeler': return 'Three-Wheeler (50 km/h limit)';
      case 'heavy_vehicle': return 'Heavy Vehicle - Bus, Lorry (50 km/h limit)';
      default: return type;
    }
  };

  if (!isOpen || !vehicleData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Register New Vehicle
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Device Info */}
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">IoT Device Detected</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Device ID: {vehicleData.deviceId}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Number */}
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g., ABC-1234"
                required
                className="font-mono"
              />
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-border rounded-md bg-background"
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="motorcycle">Motorcycle (70 km/h limit)</option>
                <option value="light_vehicle">Light Vehicle - Car, Van, Jeep (70 km/h limit)</option>
                <option value="three_wheeler">Three-Wheeler (50 km/h limit)</option>
                <option value="heavy_vehicle">Heavy Vehicle - Bus, Lorry (50 km/h limit)</option>
              </select>
            </div>

            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g., Toyota"
                required
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Corolla"
                required
              />
            </div>

            {/* Year and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="White"
                  required
                />
              </div>
            </div>

            {/* Registration Expiry */}
            <div className="space-y-2">
              <Label htmlFor="registrationExpiry">Registration Expiry</Label>
              <Input
                id="registrationExpiry"
                name="registrationExpiry"
                type="date"
                value={formData.registrationExpiry}
                onChange={handleChange}
                required
              />
            </div>

            {/* Insurance Expiry */}
            <div className="space-y-2">
              <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
              <Input
                id="insuranceExpiry"
                name="insuranceExpiry"
                type="date"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Registering...
                  </div>
                ) : (
                  'Register Vehicle'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleRegistrationModal;