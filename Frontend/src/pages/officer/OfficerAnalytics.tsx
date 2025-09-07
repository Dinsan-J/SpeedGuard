import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCounter } from '@/components/ui/stats-counter';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Car, 
  DollarSign, 
  Clock,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

const OfficerAnalytics = () => {
  // Mock data for charts
  const dailyViolations = [
    { day: 'Mon', violations: 12, revenue: 1800 },
    { day: 'Tue', violations: 19, revenue: 2850 },
    { day: 'Wed', violations: 8, revenue: 1200 },
    { day: 'Thu', violations: 15, revenue: 2250 },
    { day: 'Fri', violations: 22, revenue: 3300 },
    { day: 'Sat', violations: 18, revenue: 2700 },
    { day: 'Sun', violations: 7, revenue: 1050 }
  ];

  const monthlyTrends = [
    { month: 'Jan', violations: 245, revenue: 36750 },
    { month: 'Feb', violations: 198, revenue: 29700 },
    { month: 'Mar', violations: 287, revenue: 43050 },
    { month: 'Apr', violations: 324, revenue: 48600 },
    { month: 'May', violations: 298, revenue: 44700 },
    { month: 'Jun', violations: 356, revenue: 53400 }
  ];

  const violationTypes = [
    { name: 'Speeding', value: 45, color: '#ef4444' },
    { name: 'Red Light', value: 25, color: '#f97316' },
    { name: 'Parking', value: 20, color: '#eab308' },
    { name: 'Stop Sign', value: 10, color: '#22c55e' }
  ];

  const hotspots = [
    { location: 'Main St & 5th Ave', violations: 45, trend: 'up' },
    { location: 'Highway 101', violations: 38, trend: 'down' },
    { location: 'Broadway & 42nd', violations: 32, trend: 'up' },
    { location: 'Park Avenue', violations: 28, trend: 'stable' },
    { location: 'Downtown Core', violations: 24, trend: 'up' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-success" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Traffic Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive insights and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Violations</p>
                  <div className="text-2xl font-bold">1,247</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                  <div className="text-2xl font-bold">$187,050</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.5% this month
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Car className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Vehicles Monitored</p>
                  <div className="text-2xl font-bold">3,582</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +156 this week
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Active Officers</p>
                  <div className="text-2xl font-bold">24</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    8 on duty now
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Violations Chart */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Daily Violations This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyViolations}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="violations" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Violation Types Pie Chart */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Violation Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={violationTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {violationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {violationTypes.map((type) => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm">{type.name}: {type.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="mb-8 border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              6-Month Violation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="violations" fill="hsl(var(--primary))" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hotspots and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Violation Hotspots */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Violation Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotspots.map((hotspot, index) => (
                <div key={hotspot.location} className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{hotspot.location}</p>
                      <p className="text-sm text-muted-foreground">{hotspot.violations} violations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(hotspot.trend)}
                    <Progress value={(hotspot.violations / 50) * 100} className="w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Target</span>
                    <span>287 / 300</span>
                  </div>
                  <Progress value={95.7} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">95.7% of monthly goal achieved</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Revenue Target</span>
                    <span>$43,050 / $45,000</span>
                  </div>
                  <Progress value={95.7} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">$1,950 remaining to reach target</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Time</span>
                    <span>Avg 8.5 min</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-success mt-1">15% faster than last month</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficerAnalytics;