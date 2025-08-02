import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText,
  Calendar,
  Camera,
  Download
} from 'lucide-react';

const UserViolations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockUser = {
    id: '1',
    name: 'John Smith',
    role: 'user' as const
  };

  const mockViolations = [
    {
      id: 'V001',
      plateNumber: 'ABC-123',
      type: 'Speeding',
      amount: 150,
      status: 'unpaid',
      date: '2024-01-15',
      time: '14:30',
      location: 'Main St & 5th Ave',
      speed: '75 mph in 55 mph zone',
      officer: 'Officer Johnson',
      dueDate: '2024-02-15',
      description: 'Vehicle exceeded speed limit by 20 mph in a residential zone',
      hasPhoto: true,
      severity: 'high'
    },
    {
      id: 'V002',
      plateNumber: 'ABC-123',
      type: 'Red Light',
      amount: 200,
      status: 'paid',
      date: '2024-01-10',
      time: '09:15',
      location: 'Broadway & 42nd',
      speed: null,
      officer: 'Officer Smith',
      dueDate: '2024-02-10',
      description: 'Vehicle proceeded through red light at intersection',
      hasPhoto: true,
      severity: 'high',
      paidDate: '2024-01-20'
    },
    {
      id: 'V003',
      plateNumber: 'XYZ-789',
      type: 'Parking',
      amount: 75,
      status: 'disputed',
      date: '2024-01-08',
      time: '16:45',
      location: 'Park Avenue',
      speed: null,
      officer: 'Officer Davis',
      dueDate: '2024-02-08',
      description: 'Vehicle parked in no-parking zone during rush hour',
      hasPhoto: false,
      severity: 'low',
      disputeDate: '2024-01-12'
    },
    {
      id: 'V004',
      plateNumber: 'ABC-123',
      type: 'Stop Sign',
      amount: 125,
      status: 'overdue',
      date: '2024-01-05',
      time: '11:20',
      location: 'Oak St & Maple Ave',
      speed: null,
      officer: 'Officer Wilson',
      dueDate: '2024-02-05',
      description: 'Vehicle failed to come to complete stop at stop sign',
      hasPhoto: true,
      severity: 'medium'
    }
  ];

  const filteredViolations = mockViolations.filter(violation => {
    const matchesSearch = violation.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || violation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-success text-success-foreground">Paid</Badge>;
      case 'unpaid':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Unpaid</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="shadow-glow-destructive">Overdue</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="border-warning text-warning">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const totalUnpaid = filteredViolations
    .filter(v => v.status === 'unpaid' || v.status === 'overdue')
    .reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={mockUser} />
      
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
                  <p className="text-sm text-muted-foreground">Total Violations</p>
                  <p className="text-2xl font-bold">{filteredViolations.length}</p>
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
                  <p className="text-2xl font-bold text-warning">${totalUnpaid}</p>
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
                    {filteredViolations.filter(v => v.status === 'paid').length}
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
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'unpaid' ? 'secondary' : 'outline'}
                  onClick={() => setStatusFilter('unpaid')}
                  size="sm"
                >
                  Unpaid
                </Button>
                <Button
                  variant={statusFilter === 'overdue' ? 'destructive' : 'outline'}
                  onClick={() => setStatusFilter('overdue')}
                  size="sm"
                >
                  Overdue
                </Button>
                <Button
                  variant={statusFilter === 'paid' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('paid')}
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
            <Card key={violation.id} className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      violation.severity === 'high' ? 'bg-destructive/10' :
                      violation.severity === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${getSeverityColor(violation.severity)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{violation.type} - {violation.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">Vehicle: {violation.plateNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${violation.amount}</p>
                      {getStatusBadge(violation.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{violation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">{violation.date} at {violation.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{violation.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className={`text-sm ${
                        violation.status === 'overdue' ? 'text-destructive font-medium' : 'text-muted-foreground'
                      }`}>
                        {violation.dueDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Officer</p>
                      <p className="text-sm text-muted-foreground">{violation.officer}</p>
                    </div>
                  </div>
                </div>

                {violation.speed && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Speed Details</p>
                    <p className="text-sm text-destructive/80">{violation.speed}</p>
                  </div>
                )}

                {violation.status === 'paid' && violation.paidDate && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-success">Payment Confirmed</p>
                    <p className="text-sm text-success/80">Paid on {violation.paidDate}</p>
                  </div>
                )}

                {violation.status === 'disputed' && violation.disputeDate && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-warning">Dispute Under Review</p>
                    <p className="text-sm text-warning/80">Disputed on {violation.disputeDate}</p>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {violation.status === 'unpaid' || violation.status === 'overdue' ? (
                    <>
                      <Button className="shadow-glow-primary">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay Now - ${violation.amount}
                      </Button>
                      <Button variant="outline">
                        Dispute Violation
                      </Button>
                    </>
                  ) : null}
                  
                  {violation.hasPhoto && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      View Photo
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
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
              <h3 className="text-xl font-semibold mb-2">No violations found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters' 
                  : 'You have no traffic violations on record. Keep up the safe driving!'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserViolations;