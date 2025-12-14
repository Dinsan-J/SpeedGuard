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
  drivingLicenseId: string;
  fullName: string;
  meritPoints: number;
  status: 'active' | 'warning' | 'suspended' | 'revoked';
  riskLevel: 'low' | 'medium' | 'high';
  totalViolations: number;
  averageRiskScore: number;
  mandatoryTrainingRequired: boolean;
  lastViolationDate?: string;
}

interface DriverMeritPointsProps {
  drivingLicenseId?: string;
  className?: string;
}

const DriverMeritPoints = ({ drivingLicenseId, className = "" }: DriverMeritPointsProps) => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!drivingLicenseId) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
        const response = await fetch(`${API_URL}/api/police/drivers/${drivingLicenseId}`);
        const data = await response.json();
        
        if (data.success) {
          setDriverData(data.data.driver);
        } else {
          setError(data.message || 'Failed to fetch driver data');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [drivingLicenseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'warning': return 'text-warning';
      case 'suspended': return 'text-destructive';
      case 'revoked': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'revoked': return <XCircle className="h-4 w-4 text-destructive" />;
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
            <p className="font-semibold">{driverData.fullName}</p>
            <p className="text-sm text-muted-foreground">
              License: {driverData.drivingLicenseId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(driverData.status)}
            <span className={`text-sm font-medium ${getStatusColor(driverData.status)}`}>
              {driverData.status.toUpperCase()}
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
            <span>Revoked (0-19)</span>
            <span>Suspended (20-49)</span>
            <span>Warning (50-79)</span>
            <span>Active (80-100)</span>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Risk Level</span>
            </div>
            <Badge 
              variant={driverData.riskLevel === 'high' ? 'destructive' : 
                      driverData.riskLevel === 'medium' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {driverData.riskLevel.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(driverData.averageRiskScore * 100)}% avg score
            </p>
          </div>

          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Violations</span>
            </div>
            <p className="text-lg font-bold">{driverData.totalViolations}</p>
            <p className="text-xs text-muted-foreground">
              {driverData.lastViolationDate 
                ? `Last: ${new Date(driverData.lastViolationDate).toLocaleDateString()}`
                : 'No recent violations'
              }
            </p>
          </div>
        </div>

        {/* Training Requirements */}
        {driverData.mandatoryTrainingRequired && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                Mandatory Training Required
              </span>
            </div>
            <p className="text-xs text-warning/80 mb-3">
              Your merit points are below the threshold. Complete safety training to improve your status.
            </p>
            <Button size="sm" variant="outline" className="w-full">
              <BookOpen className="h-3 w-3 mr-2" />
              Enroll in Training Program
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {driverData.status === 'suspended' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                License Suspended
              </span>
            </div>
            <p className="text-xs text-destructive/80">
              Your driving license is suspended due to low merit points. Complete mandatory training to restore your license.
            </p>
          </div>
        )}

        {driverData.status === 'revoked' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                License Revoked
              </span>
            </div>
            <p className="text-xs text-destructive/80">
              Your driving license has been revoked. Contact the licensing authority for reinstatement procedures.
            </p>
          </div>
        )}

        {driverData.status === 'active' && driverData.meritPoints >= 90 && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                Excellent Driver
              </span>
            </div>
            <p className="text-xs text-success/80">
              Congratulations! You maintain excellent driving standards with high merit points.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverMeritPoints;