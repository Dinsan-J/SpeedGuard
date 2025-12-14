import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  MapPin,
  Award,
  BookOpen,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  totalViolations: number;
  confirmedViolations: number;
  pendingConfirmations: number;
  highRiskViolations: number;
  totalDrivers: number;
  driversWithLowMerit: number;
  averageRiskScore: number;
  totalFinesCollected: number;
  averageFineAmount: number;
  topViolationTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  meritPointsDistribution: {
    active: number;
    warning: number;
    suspended: number;
    revoked: number;
  };
  monthlyTrends: Array<{
    month: string;
    violations: number;
    confirmations: number;
    fines: number;
  }>;
}

const PoliceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in production, this would fetch real data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        totalViolations: 1247,
        confirmedViolations: 1089,
        pendingConfirmations: 158,
        highRiskViolations: 342,
        totalDrivers: 8934,
        driversWithLowMerit: 234,
        averageRiskScore: 0.34,
        totalFinesCollected: 2456000,
        averageFineAmount: 2800,
        topViolationTypes: [
          { type: 'Speed Violation', count: 856, percentage: 68.7 },
          { type: 'Sensitive Zone', count: 234, percentage: 18.8 },
          { type: 'High Risk', count: 157, percentage: 12.5 }
        ],
        riskLevelDistribution: {
          low: 623,
          medium: 382,
          high: 242
        },
        meritPointsDistribution: {
          active: 7234,
          warning: 1456,
          suspended: 189,
          revoked: 55
        },
        monthlyTrends: [
          { month: 'Jan', violations: 1123, confirmations: 1089, fines: 2178000 },
          { month: 'Feb', violations: 1089, confirmations: 1034, fines: 2067000 },
          { month: 'Mar', violations: 1247, confirmations: 1156, fines: 2312000 },
          { month: 'Apr', violations: 1334, confirmations: 1289, fines: 2578000 },
          { month: 'May', violations: 1456, confirmations: 1398, fines: 2796000 },
          { month: 'Jun', violations: 1247, confirmations: 1089, fines: 2456000 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationRate = () => {
    if (!analyticsData) return 0;
    return Math.round((analyticsData.confirmedViolations / analyticsData.totalViolations) * 100);
  };

  const getHighRiskPercentage = () => {
    if (!analyticsData) return 0;
    return Math.round((analyticsData.highRiskViolations / analyticsData.totalViolations) * 100);
  };

  const getLowMeritPercentage = () => {
    if (!analyticsData) return 0;
    return Math.round((analyticsData.driversWithLowMerit / analyticsData.totalDrivers) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Failed to load analytics data</p>
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
              <BarChart3 className="h-10 w-10 text-primary" />
              Police Analytics
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Comprehensive system performance and driver behavior analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Violations</p>
                  <p className="text-2xl font-bold">{analyticsData.totalViolations.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last {timeRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmation Rate</p>
                  <p className="text-2xl font-bold">{getConfirmationRate()}%</p>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.confirmedViolations.toLocaleString()} confirmed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold">{getHighRiskPercentage()}%</p>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.highRiskViolations} violations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{analyticsData.pendingConfirmations}</p>
                  <p className="text-xs text-warning">
                    Awaiting confirmation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Risk Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm">Low Risk</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{analyticsData.riskLevelDistribution.low}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({Math.round((analyticsData.riskLevelDistribution.low / analyticsData.totalViolations) * 100)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(analyticsData.riskLevelDistribution.low / analyticsData.totalViolations) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="text-sm">Medium Risk</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{analyticsData.riskLevelDistribution.medium}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({Math.round((analyticsData.riskLevelDistribution.medium / analyticsData.totalViolations) * 100)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(analyticsData.riskLevelDistribution.medium / analyticsData.totalViolations) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span className="text-sm">High Risk</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{analyticsData.riskLevelDistribution.high}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({Math.round((analyticsData.riskLevelDistribution.high / analyticsData.totalViolations) * 100)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(analyticsData.riskLevelDistribution.high / analyticsData.totalViolations) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Driver Merit Points Status */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Driver Merit Points Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="text-lg font-bold">{analyticsData.meritPointsDistribution.active.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">80-100 points</p>
                </div>

                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                  <p className="text-lg font-bold">{analyticsData.meritPointsDistribution.warning.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">50-79 points</p>
                </div>

                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Suspended</span>
                  </div>
                  <p className="text-lg font-bold">{analyticsData.meritPointsDistribution.suspended}</p>
                  <p className="text-xs text-muted-foreground">20-49 points</p>
                </div>

                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Revoked</span>
                  </div>
                  <p className="text-lg font-bold">{analyticsData.meritPointsDistribution.revoked}</p>
                  <p className="text-xs text-muted-foreground">0-19 points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fines Collected</p>
                  <p className="text-2xl font-bold">LKR {analyticsData.totalFinesCollected.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last {timeRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Activity className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Fine</p>
                  <p className="text-2xl font-bold">LKR {analyticsData.averageFineAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Per violation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-info/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Risk Score</p>
                  <p className="text-2xl font-bold">{Math.round(analyticsData.averageRiskScore * 100)}%</p>
                  <p className="text-xs text-muted-foreground">
                    System-wide average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Violation Types */}
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Violation Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topViolationTypes.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{type.type}</p>
                      <p className="text-sm text-muted-foreground">{type.count} violations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{type.percentage}%</p>
                    <Progress value={type.percentage} className="w-24 h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliceAnalytics;