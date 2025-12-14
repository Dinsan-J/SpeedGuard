import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  TrendingUp,
  BookOpen
} from "lucide-react";

interface PendingViolation {
  _id: string;
  vehicleId: string;
  deviceId: string;
  location: { lat: number; lng: number };
  speed: number;
  speedLimit: number;
  timestamp: string;
  baseFine: number;
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

interface DriverSearchResult {
  licenseId: string;
  name: string;
  meritPoints: number;
  status: string;
  riskLevel: string;
  totalViolations: number;
}

const PoliceDashboard = () => {
  const [pendingViolations, setPendingViolations] = useState<PendingViolation[]>([]);
  const [selectedViolation, setSelectedViolation] = useState<PendingViolation | null>(null);
  const [driverSearch, setDriverSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DriverSearchResult[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchPendingViolations();
  }, []);

  const fetchPendingViolations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/police/violations/pending`);
      const data = await response.json();
      
      if (data.success) {
        setPendingViolations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchDrivers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/police/drivers/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Failed to search drivers:', error);
    }
  };

  const confirmDriver = async () => {
    if (!selectedViolation || !selectedDriver) return;

    setConfirming(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/police/violations/${selectedViolation._id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drivingLicenseId: selectedDriver.licenseId,
          additionalInfo: {
            driverName: selectedDriver.name
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove confirmed violation from pending list
        setPendingViolations(prev => prev.filter(v => v._id !== selectedViolation._id));
        setSelectedViolation(null);
        setSelectedDriver(null);
        setDriverSearch("");
        setSearchResults([]);
        alert('Driver confirmed successfully!');
      } else {
        alert('Failed to confirm driver: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to confirm driver:', error);
      alert('Network error occurred');
    } finally {
      setConfirming(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg">Loading police dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              Police Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Confirm drivers and manage traffic violations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {pendingViolations.length} Pending Confirmations
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Violations */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {pendingViolations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending violations</p>
                </div>
              ) : (
                pendingViolations.map((violation) => (
                  <div
                    key={violation._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedViolation?._id === violation._id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedViolation(violation)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{violation.vehicleId}</span>
                      </div>
                      {getRiskBadge(violation.riskLevel)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Speed: {violation.speed} km/h</div>
                      <div>Limit: {violation.speedLimit} km/h</div>
                      <div>Fine: LKR {violation.finalFine.toLocaleString()}</div>
                      <div>Merit: -{violation.meritPointsDeducted} pts</div>
                    </div>
                    
                    {violation.sensitiveZone?.isInZone && (
                      <div className="mt-2 text-xs text-destructive">
                        🚨 {violation.sensitiveZone.zoneName} ({violation.sensitiveZone.zoneType})
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(violation.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Driver Confirmation */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Driver Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedViolation ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Select a violation to confirm the driver
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Violation Details */}
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h3 className="font-semibold mb-3">Selected Violation</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Vehicle: {selectedViolation.vehicleId}</div>
                      <div>Speed: {selectedViolation.speed} km/h</div>
                      <div>Fine: LKR {selectedViolation.finalFine.toLocaleString()}</div>
                      <div>Merit Points: -{selectedViolation.meritPointsDeducted}</div>
                    </div>
                    <div className="mt-2">
                      {getRiskBadge(selectedViolation.riskLevel)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        Risk Score: {Math.round(selectedViolation.riskScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Driver Search */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search driver by license ID or name..."
                        value={driverSearch}
                        onChange={(e) => {
                          setDriverSearch(e.target.value);
                          searchDrivers(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((driver) => (
                          <div
                            key={driver.licenseId}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedDriver?.licenseId === driver.licenseId
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedDriver(driver)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{driver.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {driver.licenseId}
                                </p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(driver.status)}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {driver.meritPoints}/100 points
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Risk: {driver.riskLevel.toUpperCase()}</span>
                              <span>Violations: {driver.totalViolations}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Driver Details */}
                    {selectedDriver && (
                      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                        <h4 className="font-semibold text-success mb-2">Selected Driver</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Name: {selectedDriver.name}</div>
                          <div>License: {selectedDriver.licenseId}</div>
                          <div>Merit Points: {selectedDriver.meritPoints}/100</div>
                          <div>Status: {selectedDriver.status.toUpperCase()}</div>
                        </div>
                      </div>
                    )}

                    {/* Confirm Button */}
                    <Button
                      onClick={confirmDriver}
                      disabled={!selectedDriver || confirming}
                      className="w-full"
                      size="lg"
                    >
                      {confirming ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Driver & Apply Penalty
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;