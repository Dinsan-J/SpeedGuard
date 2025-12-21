import { useState, useEffect } from "react";
// REMOVE: import { Navbar } from "@/components/Layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Camera,
  Download,
  Gauge,
  Target,
  Navigation,
  CheckCircle,
  Shield,
  TrendingUp,
  Info,
} from "lucide-react";

interface Violation {
  _id: string;
  vehicleId: string;
  deviceId?: string;
  location: {
    lat: number;
    lng: number;
  };
  speed: number;
  speedLimit?: number;
  timestamp: string;
  fine: number;
  baseFine?: number;
  status: string;
  zoneMultiplier?: number;
  riskMultiplier?: number;
  
  // Driver Information
  drivingLicenseId?: string;
  driverConfirmed?: boolean;
  confirmedBy?: string;
  confirmationDate?: string;
  
  // Geofencing
  sensitiveZone?: {
    isInZone: boolean;
    zoneType?: string;
    zoneName?: string;
    distanceFromZone?: number;
    zoneRadius?: number;
  };
  
  // ML Risk Assessment
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  riskFactors?: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  
  // Merit Points
  meritPointsDeducted?: number;
  meritPointsApplied?: boolean;
  
  // Fine Breakdown
  fineBreakdown?: {
    base: number;
    zoneAdjustment: number;
    riskAdjustment: number;
    total: number;
  };
  
  // Additional Context
  timeOfDay?: string;
  trafficDensity?: string;
  weatherConditions?: string;
  
  // Legacy fields for compatibility
  plateNumber?: string;
  type?: string;
  amount?: number;
  date?: string;
  time?: string;
  officer?: string;
  dueDate?: string;
  description?: string;
  hasPhoto?: boolean;
  severity?: string;
  paidDate?: string;
  disputeDate?: string;
}

const UserViolations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [violations, setViolations] = useState<Violation[]>([]);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
        const response = await fetch(`${API_URL}/api/violation`);
        const data = await response.json();
        if (data.success) {
          // Map the new violation structure to include legacy fields for compatibility
          const mappedViolations = data.violations.map((v: Violation) => ({
            ...v,
            plateNumber: v.vehicleId,
            type: "Speed Violation",
            amount: v.fine || 2000,
            date: new Date(v.timestamp).toLocaleDateString(),
            time: new Date(v.timestamp).toLocaleTimeString(),
            severity: v.sensitiveZone?.isInZone ? "high" : "medium",
            description: `Speed violation: ${v.speed} km/h in ${v.speedLimit || 70} km/h zone${
              v.sensitiveZone?.isInZone 
                ? ` (${v.sensitiveZone.zoneType}: ${v.sensitiveZone.zoneName})`
                : ""
            }`
          }));
          setViolations(mappedViolations);
        }
      } catch (error) {
        console.error("Failed to fetch violations:", error);
      }
    };
    fetchViolations();
  }, []);

  const filteredViolations = violations.filter((violation) => {
    const matchesSearch =
      (violation.plateNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (violation.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (violation.location || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || violation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Paid
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="secondary"
            className="bg-warning text-warning-foreground"
          >
            Unpaid
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="shadow-glow-destructive">
            Overdue
          </Badge>
        );
      case "disputed":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            Disputed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const totalUnpaid = filteredViolations
    .filter((v) => (v.status === "unpaid" || v.status === "overdue" || v.status === "pending"))
    .reduce((sum, v) => sum + (v.fine || v.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* REMOVE: <Navbar user={{ id: "1", name: "John Smith", role: "user" }} /> */}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            My Violations
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage your traffic violation history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Violations
                  </p>
                  <p className="text-2xl font-bold">
                    {filteredViolations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold text-warning">
                    LKR {totalUnpaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Fines</p>
                  <p className="text-2xl font-bold">
                    {
                      filteredViolations.filter((v) => v.status === "paid")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-accent/20 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search violations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-accent/30"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "unpaid" ? "secondary" : "outline"}
                  onClick={() => setStatusFilter("unpaid")}
                  size="sm"
                >
                  Unpaid
                </Button>
                <Button
                  variant={
                    statusFilter === "overdue" ? "destructive" : "outline"
                  }
                  onClick={() => setStatusFilter("overdue")}
                  size="sm"
                >
                  Overdue
                </Button>
                <Button
                  variant={statusFilter === "paid" ? "default" : "outline"}
                  onClick={() => setStatusFilter("paid")}
                  size="sm"
                >
                  Paid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations List */}
        <div className="space-y-6">
          {filteredViolations.map((violation) => (
            <Card
              key={violation._id}
              className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        violation.sensitiveZone?.isInZone
                          ? "bg-destructive/10"
                          : "bg-warning/10"
                      }`}
                    >
                      {violation.sensitiveZone?.isInZone ? (
                        <Shield className="h-5 w-5 text-destructive" />
                      ) : (
                        <Gauge className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Speed Violation - {violation._id.slice(-6)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Vehicle: {violation.vehicleId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold">LKR {violation.fine?.toLocaleString()}</p>
                      {getStatusBadge(violation.status || "pending")}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Location and Zone Information */}
                {violation.sensitiveZone?.isInZone && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        🚨 IN SENSITIVE ZONE
                      </p>
                    </div>
                    <p className="text-sm text-destructive/80 mb-2">
                      <strong>{violation.sensitiveZone.zoneName}</strong> ({violation.sensitiveZone.zoneType})
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Distance from center:</span>
                        <span className="ml-1 font-medium">{Math.round(violation.sensitiveZone.distanceFromZone || 0)}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Zone radius:</span>
                        <span className="ml-1 font-medium">{violation.sensitiveZone.zoneRadius}m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Speed Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">🚗 Speed</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{violation.speed} km/h</p>
                  </div>

                  <div className="p-3 bg-muted/50 border border-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">🚦 Speed Limit</p>
                    </div>
                    <p className="text-lg font-bold">
                      {violation.speedLimit || 70} km/h
                      <span className="text-xs ml-1 text-muted-foreground">
                        ({violation.sensitiveZone?.isInZone ? 'Sensitive Zone' : 'Normal Road'})
                      </span>
                    </p>
                  </div>

                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-warning" />
                      <p className="text-sm font-medium">📊 Speed Violation</p>
                    </div>
                    <p className="text-lg font-bold text-warning">
                      +{violation.speed - (violation.speedLimit || 70)} km/h
                    </p>
                  </div>
                </div>

                {/* ML Risk Assessment */}
                {violation.riskScore && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-purple-100 rounded">
                        <span className="text-sm">🤖</span>
                      </div>
                      <p className="text-sm font-medium text-purple-800">AI Risk Assessment</p>
                      <Badge 
                        variant={violation.riskLevel === 'high' ? 'destructive' : 
                                violation.riskLevel === 'medium' ? 'secondary' : 'outline'}
                        className="ml-auto"
                      >
                        {violation.riskLevel?.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <span className="ml-2 font-bold text-purple-700">
                          {Math.round((violation.riskScore || 0) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Multiplier:</span>
                        <span className="ml-2 font-medium">{violation.riskMultiplier || 1.0}x</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Merit Points:</span>
                        <span className="ml-2 font-bold text-destructive">
                          -{violation.meritPointsDeducted || 0} points
                        </span>
                      </div>
                    </div>
                    {violation.riskFactors && violation.riskFactors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple/20">
                        <p className="text-xs text-muted-foreground mb-2">Key Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {violation.riskFactors.slice(0, 3).map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor.factor}: {(factor.weight * 100).toFixed(0)}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Fine Breakdown */}
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium">💰 Fine Calculation</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Base Fine:</span>
                      <span className="ml-2 font-medium">LKR {(violation.baseFine || 2000).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zone Multiplier:</span>
                      <span className="ml-2 font-medium">{violation.zoneMultiplier || 1}x</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Multiplier:</span>
                      <span className="ml-2 font-medium">{violation.riskMultiplier || 1.0}x</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Final Fine:</span>
                      <span className="ml-2 font-bold text-primary">LKR {violation.fine?.toLocaleString()}</span>
                    </div>
                  </div>
                  {violation.fineBreakdown && (
                    <div className="mt-3 pt-3 border-t border-accent/20 text-xs text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Calculation: LKR {violation.fineBreakdown.base.toLocaleString()} → 
                        LKR {(violation.fineBreakdown.base + violation.fineBreakdown.zoneAdjustment).toLocaleString()} → 
                        LKR {violation.fineBreakdown.total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Merit Points Status */}
                <div className={`p-4 border rounded-lg ${
                  violation.meritPointsApplied 
                    ? 'bg-success/10 border-success/20' 
                    : 'bg-warning/10 border-warning/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {violation.meritPointsApplied ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning" />
                    )}
                    <p className={`text-sm font-medium ${
                      violation.meritPointsApplied ? 'text-success' : 'text-warning'
                    }`}>
                      🎯 Merit Points Status
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`ml-2 font-medium ${
                        violation.meritPointsApplied ? 'text-success' : 'text-warning'
                      }`}>
                        {violation.meritPointsApplied ? 'AUTOMATICALLY APPLIED' : 'PROCESSING'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points Deducted:</span>
                      <span className={`ml-2 font-medium ${
                        violation.meritPointsApplied ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {violation.meritPointsApplied ? `-${violation.meritPointsDeducted}` : 'Pending'}
                      </span>
                    </div>
                  </div>
                  {violation.drivingLicenseId && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Driver License: {violation.drivingLicenseId}
                    </div>
                  )}
                  {violation.confirmationDate && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Confirmed on: {new Date(violation.confirmationDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Location and Time Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">📅 Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(violation.timestamp).toLocaleDateString()} at{" "}
                        {new Date(violation.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">📍 Location</p>
                      <p className="text-sm text-muted-foreground">
                        {violation.location.lat.toFixed(4)}, {violation.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status-specific information */}
                {violation.status === "paid" && violation.paidDate && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-success">
                      Payment Confirmed
                    </p>
                    <p className="text-sm text-success/80">
                      Paid on {violation.paidDate}
                    </p>
                  </div>
                )}

                {violation.status === "disputed" && violation.disputeDate && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-warning">
                      Dispute Under Review
                    </p>
                    <p className="text-sm text-warning/80">
                      Disputed on {violation.disputeDate}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {(violation.status === "pending" || violation.status === "unpaid" || violation.status === "overdue") && (
                    <>
                      <Button className="shadow-glow-primary">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay Now - LKR {violation.fine?.toLocaleString()}
                      </Button>
                      <Button variant="outline">Dispute Violation</Button>
                    </>
                  )}

                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>

                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>

                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Full Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredViolations.length === 0 && (
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No violations found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "You have no traffic violations on record. Keep up the safe driving!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserViolations;
