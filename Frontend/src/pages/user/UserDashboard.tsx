import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  MapPin, 
  QrCode,
  CreditCard,
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  LogOut // Add LogOut icon
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  color: string;
  qrCode: string;
}

interface Violation {
  id: string;
  date: string;
  time: string;
  location: string;
  speed: number;
  limit: number;
  fine: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  imageUrl?: string;
}

const UserDashboard = () => {
  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      plate: 'ABC-1234',
      model: 'Toyota Camry',
      year: 2020,
      color: 'Silver',
      qrCode: 'QR_ABC1234_2024'
    }
  ]);

  const [violations] = useState<Violation[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      location: 'Main St & 5th Ave',
      speed: 75,
      limit: 60,
      fine: 150,
      status: 'pending',
      dueDate: '2024-02-15'
    },
    {
      id: '2',
      date: '2024-01-10',
      time: '09:15',
      location: 'Highway 101',
      speed: 85,
      limit: 70,
      fine: 200,
      status: 'overdue',
      dueDate: '2024-02-10'
    },
    {
      id: '3',
      date: '2024-01-05',
      time: '16:45',
      location: 'School Zone - Oak St',
      speed: 45,
      limit: 25,
      fine: 300,
      status: 'paid',
      dueDate: '2024-02-05'
    }
  ]);

  const stats = {
    totalViolations: violations.length,
    pendingFines: violations.filter(v => v.status === 'pending').length,
    overdueFines: violations.filter(v => v.status === 'overdue').length,
    totalFines: violations.reduce((sum, v) => sum + v.fine, 0),
    unpaidFines: violations.filter(v => v.status !== 'paid').reduce((sum, v) => sum + v.fine, 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'border-secondary/50 bg-secondary/5';
      case 'overdue':
        return 'border-primary/50 bg-primary/5';
      default:
        return 'border-warning/50 bg-warning/5';
    }
  };

  const navigate = useNavigate(); // Add this hook

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Track your vehicles and violations</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {stats.overdueFines > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {stats.overdueFines}
                </Badge>
              )}
            </Button>
            {/* Stunning Logout Button */}
            <Button
              variant="destructive"
              size="sm"
              className="ml-2 px-4 py-2 font-bold bg-gradient-to-r from-primary to-warning text-white shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border-border/50 hover:border-info/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Violations</p>
                <p className="text-3xl font-bold text-info">{stats.totalViolations}</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">All time record</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-warning/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-3xl font-bold text-warning">{stats.pendingFines}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Requires payment</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Fines</p>
                <p className="text-3xl font-bold text-primary">{stats.overdueFines}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <XCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-primary">Immediate action required</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:border-secondary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                <p className="text-3xl font-bold text-secondary">${stats.unpaidFines}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/user/payments">
                <Button size="sm" variant="outline" className="text-xs">
                  Pay Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* My Vehicles & Recent Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Vehicles */}
          <div>
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Vehicles</h2>
                <Link to="/user/vehicles">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 bg-accent/20 rounded-lg border border-border/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-info/10 rounded-lg">
                        <Car className="h-6 w-6 text-info" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{vehicle.plate}</div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.year} {vehicle.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle.color}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{vehicle.qrCode}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Show QR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Violations */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Recent Violations</h2>
                  <p className="text-sm text-muted-foreground">Latest traffic violations for your vehicles</p>
                </div>
                <Link to="/user/violations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor(violation.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-accent/30 rounded-lg">
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold">Speed Violation</span>
                            {getStatusIcon(violation.status)}
                            <Badge 
                              variant={
                                violation.status === 'paid' ? 'secondary' :
                                violation.status === 'overdue' ? 'destructive' : 'default'
                              }
                              className="text-xs"
                            >
                              {violation.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {violation.date} at {violation.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {violation.location}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <span>Speed: <strong className="text-primary">{violation.speed} km/h</strong></span>
                            <span>Limit: <strong>{violation.limit} km/h</strong></span>
                            <span>Excess: <strong className="text-warning">+{violation.speed - violation.limit} km/h</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          ${violation.fine}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Due: {violation.dueDate}
                        </div>
                        {violation.status !== 'paid' && (
                          <Button size="sm" variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Notifications */}
        {stats.overdueFines > 0 && (
          <Card className="p-6 bg-gradient-card border-primary/50">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-2">Urgent: Overdue Fines</h3>
                <p className="text-muted-foreground mb-4">
                  You have {stats.overdueFines} overdue fine{stats.overdueFines > 1 ? 's' : ''} that require immediate attention. 
                  Late fees may apply if not paid promptly.
                </p>
                <div className="flex space-x-3">
                  <Link to="/user/payments">
                    <Button variant="default" size="sm" className="shadow-glow-primary">
                      Pay All Fines
                    </Button>
                  </Link>
                  <Link to="/user/violations">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;