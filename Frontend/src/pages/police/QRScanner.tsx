import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  QrCode,
  Car,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Award,
  Camera,
  Search,
  Zap,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Info
} from "lucide-react";

interface VehicleData {
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  status: string;
  owner?: {
    username: string;
    email: string;
  };
  iotDeviceId?: string;
  currentSpeed?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastUpdated?: string;
}

interface PendingViolation {
  _id: string;
  speed: number;
  speedLimit: number;
  timestamp: string;
  location: { lat: number; lng: number };
  finalFine: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  meritPointsDeducted: number;
  sensitiveZone?: {
    isInZone: boolean;
    zoneType?: string;
    zoneName?: string;
  };
}

interface DriverInfo {
  licenseId: string;
  fullName: string;
  meritPoints: number;
  status: string;
  riskLevel: string;
  totalViolations: number;
  lastViolationDate?: string;
  mandatoryTrainingRequired: boolean;
}

interface ScanResult {
  vehicle: VehicleData;
  pendingViolations: PendingViolation[];
  recentDriver?: DriverInfo;
  recentViolations: Array<{
    timestamp: string;
    speed: number;
    finalFine: number;
    riskLevel: string;
    drivingLicenseId: string;
  }>;
}

const QRScanner = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [driverLicenseInput, setDriverLicenseInput] = useState("");

  const scanVehicle = async () => {
    if (!vehicleId.trim()) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/police/test/scan/${encodeURIComponent(vehicleId)}`);
      const data = await response.json();
      
      if (data.success) {
        setScanResult(data.data);
        // Pre-fill driver license if recent driver found
        if (data.data.recentDriver) {
          setDriverLicenseInput(data.data.recentDriver.licenseId);
        }
      } else {
        alert('Vehicle not found: ' + data.message);
        setScanResult(null);
      }
    } catch (error) {
      console.error('Failed to scan vehicle:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickConfirmViolation = async (violationId: string) => {
    if (!driverLicenseInput.trim()) {
      alert('Please enter driver license ID');
      return;
    }

    setConfirming(violationId);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/police/test/violations/${violationId}/quick-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drivingLicenseId: driverLicenseInput,
          quickConfirm: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove confirmed violation from pending list
        setScanResult(prev => prev ? {
          ...prev,
          pendingViolations: prev.pendingViolations.filter(v => v._id !== violationId)
        } : null);
        
        const successMessage = `✅ VIOLATION CONFIRMED!\n\n` +
          `👤 Driver: ${data.driver?.fullName || data.driver?.name || driverLicenseInput}\n` +
          `🎯 Merit points deducted: ${data.meritPointsDeducted || 'N/A'}\n` +
          `📊 New merit points: ${data.driver?.meritPoints || 'N/A'}\n` +
          `📈 Driver status: ${data.driver?.status?.toUpperCase() || 'N/A'}\n\n` +
          `🚨 Violation has been officially confirmed and penalties applied!`;
        
        alert(successMessage);
        
        // Clear the license input for next violation
        setDriverLicenseInput('');
      } else {
        alert(`❌ Failed to confirm violation:\n\n${data.message}\n\nPlease check the driver license ID and try again.`);
      }
    } catch (error) {
      console.error('Failed to confirm violation:', error);
      alert(`❌ Network error occurred:\n\n${error}\n\nPlease check your internet connection and try again.`);
    } finally {
      setConfirming(null);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">HIGH RISK</Badge>;
      case 'medium':
        return <Badge variant="secondary">MEDIUM RISK</Badge>;
      case 'low':
        return <Badge variant="outline">LOW RISK</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">ACTIVE</Badge>;
      case 'warning':
        return <Badge variant="secondary">WARNING</Badge>;
      case 'suspended':
        return <Badge variant="destructive">SUSPENDED</Badge>;
      case 'revoked':
        return <Badge variant="destructive">REVOKED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const getProgressColor = (points: number) => {
    if (points >= 80) return 'bg-success';
    if (points >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <QrCode className="h-10 w-10 text-primary" />
              QR Vehicle Scanner
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Scan vehicle QR codes to view violations and confirm drivers
            </p>
          </div>
        </div>

        {/* Scanner Input */}
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Vehicle Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Enter vehicle plate number or scan QR code..."
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && scanVehicle()}
                  className="pl-10 text-lg"
                />
              </div>
              <Button 
                onClick={scanVehicle} 
                disabled={loading || !vehicleId.trim()}
                size="lg"
                className="px-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan Vehicle
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Results */}
        {scanResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Information */}
            <Card className="border-accent/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{scanResult.vehicle.plateNumber}</h3>
                    <Badge variant="outline" className="bg-primary/10">
                      {scanResult.vehicle.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Make:</span> {scanResult.vehicle.make}</div>
                    <div><span className="text-muted-foreground">Model:</span> {scanResult.vehicle.model}</div>
                    <div><span className="text-muted-foreground">Year:</span> {scanResult.vehicle.year}</div>
                    <div><span className="text-muted-foreground">Color:</span> {scanResult.vehicle.color}</div>
                  </div>
                  
                  {scanResult.vehicle.iotDeviceId && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">IoT Connected</span>
                        <span className="text-muted-foreground">({scanResult.vehicle.iotDeviceId})</span>
                      </div>
                      {scanResult.vehicle.currentSpeed !== undefined && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Current Speed:</span>
                          <span className="ml-2 font-bold text-primary">{scanResult.vehicle.currentSpeed} km/h</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Owner Information */}
                {scanResult.vehicle.owner && (
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Vehicle Owner
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {scanResult.vehicle.owner.username}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {scanResult.vehicle.owner.email}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Driver Merit Points */}
                {scanResult.recentDriver && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue/20 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Recent Driver Merit Points
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{scanResult.recentDriver.fullName}</p>
                          <p className="text-sm text-muted-foreground">{scanResult.recentDriver.licenseId}</p>
                        </div>
                        {getStatusBadge(scanResult.recentDriver.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Merit Points</span>
                          <span className="text-xl font-bold text-primary">
                            {scanResult.recentDriver.meritPoints}/100
                          </span>
                        </div>
                        <Progress 
                          value={scanResult.recentDriver.meritPoints} 
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Risk Level:</span>
                          <span className="ml-1 font-medium">{scanResult.recentDriver.riskLevel.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Violations:</span>
                          <span className="ml-1 font-medium">{scanResult.recentDriver.totalViolations}</span>
                        </div>
                      </div>

                      {scanResult.recentDriver.mandatoryTrainingRequired && (
                        <div className="p-2 bg-warning/10 border border-warning/20 rounded text-xs">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            <span className="font-medium text-warning">Training Required</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Violations */}
            <Card className="border-accent/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pending Violations ({scanResult.pendingViolations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.pendingViolations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending violations</p>
                  </div>
                ) : (
                  <>
                    {/* Driver License Input with Search */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue/20 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Driver Identification
                      </h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="Enter or search driver license ID..."
                            value={driverLicenseInput}
                            onChange={(e) => setDriverLicenseInput(e.target.value)}
                            className="pr-20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute right-1 top-1 h-8"
                            onClick={() => {
                              // Simple validation
                              if (driverLicenseInput.length < 3) {
                                alert('Please enter at least 3 characters');
                                return;
                              }
                              alert(`Searching for driver: ${driverLicenseInput}`);
                            }}
                          >
                            <Search className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Quick License Suggestions */}
                        {scanResult.recentDriver && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDriverLicenseInput(scanResult.recentDriver!.licenseId)}
                              className="text-xs"
                            >
                              Use Recent: {scanResult.recentDriver.licenseId}
                            </Button>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          💡 Enter the driver's license ID to confirm violations and apply merit point penalties
                        </p>
                      </div>
                    </div>

                    {/* Violations List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scanResult.pendingViolations.map((violation) => (
                        <div
                          key={violation._id}
                          className="p-4 border border-warning/20 bg-warning/5 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              <span className="font-medium">Speed Violation</span>
                            </div>
                            {getRiskBadge(violation.riskLevel)}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>Speed: <span className="font-bold text-destructive">{violation.speed} km/h</span></div>
                            <div>Limit: <span className="font-medium">{violation.speedLimit} km/h</span></div>
                            <div>Fine: <span className="font-bold text-primary">LKR {violation.finalFine.toLocaleString()}</span></div>
                            <div>Merit: <span className="font-bold text-destructive">-{violation.meritPointsDeducted} pts</span></div>
                          </div>

                          {violation.sensitiveZone?.isInZone && (
                            <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3 text-destructive" />
                                <span className="font-medium text-destructive">
                                  🚨 {violation.sensitiveZone.zoneName} ({violation.sensitiveZone.zoneType})
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {new Date(violation.timestamp).toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (!driverLicenseInput.trim()) {
                                    alert('⚠️ Please enter driver license ID first');
                                    return;
                                  }
                                  
                                  const confirmMessage = `🚨 CONFIRM VIOLATION\n\n` +
                                    `Driver: ${driverLicenseInput}\n` +
                                    `Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)\n` +
                                    `Fine: LKR ${violation.finalFine.toLocaleString()}\n` +
                                    `Merit Points: -${violation.meritPointsDeducted} points\n` +
                                    `Risk Level: ${violation.riskLevel.toUpperCase()}\n\n` +
                                    `⚠️ This action cannot be undone!\n\n` +
                                    `Confirm violation and apply penalties?`;
                                  
                                  if (window.confirm(confirmMessage)) {
                                    quickConfirmViolation(violation._id);
                                  }
                                }}
                                disabled={!driverLicenseInput.trim() || confirming === violation._id}
                                size="sm"
                                className="bg-success hover:bg-success/90 flex-1"
                              >
                                {confirming === violation._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Confirming...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirm & Apply Penalty
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const details = `📋 VIOLATION DETAILS\n\n` +
                                    `Vehicle: ${scanResult.vehicle.plateNumber}\n` +
                                    `Time: ${new Date(violation.timestamp).toLocaleString()}\n` +
                                    `Location: ${violation.location.lat.toFixed(4)}, ${violation.location.lng.toFixed(4)}\n` +
                                    `Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)\n` +
                                    `Risk Score: ${Math.round((violation.riskScore || 0) * 100)}%\n` +
                                    `Base Fine: LKR 2,000\n` +
                                    `Final Fine: LKR ${violation.finalFine.toLocaleString()}\n` +
                                    `Merit Points: -${violation.meritPointsDeducted}\n` +
                                    (violation.sensitiveZone?.isInZone ? 
                                      `\n🚨 SENSITIVE ZONE:\n${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})` : 
                                      '\n✅ Normal road violation');
                                  
                                  alert(details);
                                }}
                                className="px-3"
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;