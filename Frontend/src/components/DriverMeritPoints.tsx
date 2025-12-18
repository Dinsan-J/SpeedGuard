import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Award,
  BookOpen,
  Info
} from "lucide-react";

interface DriverData {
  username: string;
  email: string;
  vehicleType: string;
  meritPoints: number;
  drivingStatus: 'active' | 'warning' | 'review' | 'suspended';
  totalViolations: number;
  violationFreeWeeks: number;
  lastViolationDate?: string;
  driverProfile: {
    fullName?: string;
    licenseNumber?: string;
    phoneNumber?: string;
  };
}

interface DriverMeritPointsProps {
  userId?: string;
  className?: string;
}

const DriverMeritPoints = ({ userId, className = "" }: DriverMeritPointsProps) => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
        const response = await fetch(`${API_URL}/api/merit-points/status`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setDriverData(data.data);
        } else {
          setError(data.message || 'Failed to fetch merit point data');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'warning': return 'text-warning';
      case 'review': return 'text-destructive';
      case 'suspended': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'review': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = (points: number) => {
    if (points >= 80) return 'bg-success';
    if (points >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  if (loading) {
    return (
      <Card className={`border-accent/20 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading driver data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !driverData) {
    return (
      <Card className={`border-accent/20 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {error || 'No driver data available'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Driver merit points will be shown after police confirmation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-accent/20 shadow-elegant ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Driver Merit Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Driver Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              {driverData.driverProfile?.fullName || driverData.username}
            </p>
            <p className="text-sm text-muted-foreground">
              {driverData.vehicleType?.replace('_', ' ').toUpperCase()} • {driverData.email}
            </p>
            {driverData.driverProfile?.licenseNumber && (
              <p className="text-xs text-muted-foreground">
                License: {driverData.driverProfile.licenseNumber}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(driverData.drivingStatus)}
            <span className={`text-sm font-medium ${getStatusColor(driverData.drivingStatus)}`}>
              {driverData.drivingStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Merit Points Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Merit Points</span>
            <span className="text-2xl font-bold text-primary">
              {driverData.meritPoints}/100
            </span>
          </div>
          <Progress 
            value={driverData.meritPoints} 
            className="h-3"
            // className={`h-3 ${getProgressColor(driverData.meritPoints)}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Suspended (0)</span>
            <span>Review (1-29)</span>
            <span>Warning (30-49)</span>
            <span>Active (50-100)</span>
          </div>
        </div>

        {/* Violation Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Violation-Free</span>
            </div>
            <p className="text-lg font-bold text-success">{driverData.violationFreeWeeks}</p>
            <p className="text-xs text-muted-foreground">
              weeks (+{driverData.violationFreeWeeks * 2} points recovered)
            </p>
          </div>

          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Violations</span>
            </div>
            <p className="text-lg font-bold">{driverData.totalViolations}</p>
            <p className="text-xs text-muted-foreground">
              {driverData.lastViolationDate 
                ? `Last: ${new Date(driverData.lastViolationDate).toLocaleDateString()}`
                : 'No violations recorded'
              }
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {driverData.drivingStatus === 'suspended' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Driving Suspended
              </span>
            </div>
            <p className="text-xs text-destructive/80">
              Your driving privileges are suspended (0 merit points). Contact DMT for rehabilitation requirements.
            </p>
          </div>
        )}

        {driverData.drivingStatus === 'review' && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                License Under Review
              </span>
            </div>
            <p className="text-xs text-warning/80">
              Your license is flagged for review ({driverData.meritPoints} points). Drive carefully to avoid suspension.
            </p>
          </div>
        )}

        {driverData.drivingStatus === 'warning' && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                Warning Status
              </span>
            </div>
            <p className="text-xs text-warning/80">
              You have {driverData.meritPoints} merit points. Drive safely to recover points (+2 per violation-free week).
            </p>
          </div>
        )}

        {driverData.drivingStatus === 'active' && driverData.meritPoints >= 80 && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                Excellent Driver
              </span>
            </div>
            <p className="text-xs text-success/80">
              Great job! You maintain excellent driving standards with {driverData.meritPoints} merit points.
            </p>
          </div>
        )}

        {/* Merit Point Recovery Info */}
        {driverData.meritPoints < 100 && driverData.violationFreeWeeks > 0 && (
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-info" />
              <span className="text-sm font-medium text-info">
                Merit Point Recovery
              </span>
            </div>
            <p className="text-xs text-info/80">
              Keep driving safely! You recover +2 merit points every violation-free week (max 100 points).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverMeritPoints;