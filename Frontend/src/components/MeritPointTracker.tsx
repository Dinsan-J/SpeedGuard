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
  TrendingUp,
  Award,
  Clock,
  Info,
  RefreshCw,
  Car,
  Calendar
} from "lucide-react";

interface MeritPointData {
  currentPoints: number;
  maxPoints: number;
  drivingStatus: 'active' | 'warning' | 'review' | 'suspended';
  totalViolations: number;
  violationFreeWeeks: number;
  potentialRecovery: number;
  statusMessage: string;
  recommendations: string[];
  lastViolationDate?: string;
  vehicleType: string;
  speedLimit: number;
}

interface MeritPointTrackerProps {
  className?: string;
}

const MeritPointTracker = ({ className = "" }: MeritPointTrackerProps) => {
  const [meritData, setMeritData] = useState<MeritPointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeritData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://speedguard-gz70.onrender.com";
      const response = await fetch(`${API_URL}/api/merit-points/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setMeritData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch merit point data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeritData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMeritData();
  };

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

  const getProgressColor = (points: number) => {
    if (points >= 50) return 'bg-success';
    if (points >= 30) return 'bg-warning';
    return 'bg-destructive';
  };

  const getVehicleTypeDisplay = (vehicleType: string) => {
    const types = {
      motorcycle: 'Motorcycle',
      light_vehicle: 'Light Vehicle',
      three_wheeler: 'Three-Wheeler',
      heavy_vehicle: 'Heavy Vehicle'
    };
    return types[vehicleType as keyof typeof types] || vehicleType;
  };

  if (loading) {
    return (
      <Card className={`border-accent/20 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading merit points...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !meritData) {
    return (
      <Card className={`border-accent/20 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">
              {error || 'Unable to load merit point data'}
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-accent/20 shadow-elegant ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Merit Point System
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(meritData.drivingStatus)}
              <span className={`font-semibold ${getStatusColor(meritData.drivingStatus)}`}>
                {meritData.drivingStatus.toUpperCase()} STATUS
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {meritData.statusMessage}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {meritData.currentPoints}
            </div>
            <div className="text-sm text-muted-foreground">/ {meritData.maxPoints}</div>
          </div>
        </div>

        {/* Merit Points Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Merit Points</span>
            <span className="text-sm text-muted-foreground">
              {meritData.currentPoints}/{meritData.maxPoints}
            </span>
          </div>
          <Progress 
            value={meritData.currentPoints} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Suspended (0)</span>
            <span>Review (1-29)</span>
            <span>Warning (30-49)</span>
            <span>Active (50-100)</span>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Vehicle Type</span>
            </div>
            <p className="font-semibold">{getVehicleTypeDisplay(meritData.vehicleType)}</p>
            <p className="text-xs text-muted-foreground">
              Speed Limit: {meritData.speedLimit} km/h
            </p>
          </div>

          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Violation-Free</span>
            </div>
            <p className="text-lg font-bold text-success">{meritData.violationFreeWeeks}</p>
            <p className="text-xs text-muted-foreground">
              weeks (+{meritData.violationFreeWeeks * 2} points)
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-info/10 rounded-lg">
            <div className="text-xl font-bold text-info">{meritData.totalViolations}</div>
            <div className="text-sm text-muted-foreground">Total Violations</div>
            {meritData.lastViolationDate && (
              <div className="text-xs text-muted-foreground mt-1">
                Last: {new Date(meritData.lastViolationDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-xl font-bold text-success">{meritData.potentialRecovery}</div>
            <div className="text-sm text-muted-foreground">Points Available</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next recovery soon
            </div>
          </div>
        </div>

        {/* Recovery Information */}
        <div className="p-4 bg-gradient-to-r from-success/10 to-info/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="font-medium text-success">Merit Point Recovery</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Drive violation-free for 1 week = +2 merit points</p>
            <p>• Maximum recovery: 100 points</p>
            <p>• Automatic weekly processing every Sunday</p>
          </div>
        </div>

        {/* Recommendations */}
        {meritData.recommendations && meritData.recommendations.length > 0 && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">Recommendations</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {meritData.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Status-specific Messages */}
        {meritData.drivingStatus === 'suspended' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Driving Suspended</span>
            </div>
            <p className="text-sm text-destructive/80">
              Your driving privileges are suspended (0 merit points). Contact DMT for rehabilitation requirements.
            </p>
          </div>
        )}

        {meritData.drivingStatus === 'review' && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">License Under Review</span>
            </div>
            <p className="text-sm text-warning/80">
              Your license is flagged for review. Drive carefully to avoid suspension.
            </p>
          </div>
        )}

        {meritData.drivingStatus === 'active' && meritData.currentPoints >= 80 && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-success" />
              <span className="font-medium text-success">Excellent Driver</span>
            </div>
            <p className="text-sm text-success/80">
              Great job! You maintain excellent driving standards with {meritData.currentPoints} merit points.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeritPointTracker;