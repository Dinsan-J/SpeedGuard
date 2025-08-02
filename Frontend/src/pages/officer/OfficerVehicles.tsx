import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Car, MapPin, Clock, AlertTriangle } from 'lucide-react';

const OfficerVehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockUser = {
    id: '1',
    name: 'Officer Johnson',
    role: 'officer' as const
  };

  const mockVehicles = [
    {
      id: '1',
      plateNumber: 'ABC-123',
      model: 'Toyota Camry',
      year: '2020',
      owner: 'John Smith',
      status: 'active',
      lastSeen: '2 hours ago',
      location: 'Main St & 5th Ave',
      speed: '45 mph',
      violations: 2,
      color: 'Blue'
    },
    {
      id: '2',
      plateNumber: 'XYZ-789',
      model: 'Honda Civic',
      year: '2019',
      owner: 'Sarah Wilson',
      status: 'violation',
      lastSeen: '15 minutes ago',
      location: 'Highway 101',
      speed: '75 mph',
      violations: 5,
      color: 'Red'
    },
    {
      id: '3',
      plateNumber: 'DEF-456',
      model: 'BMW X5',
      year: '2021',
      owner: 'Michael Brown',
      status: 'clean',
      lastSeen: '1 hour ago',
      location: 'Park Avenue',
      speed: '35 mph',
      violations: 0,
      color: 'Black'
    },
    {
      id: '4',
      plateNumber: 'GHI-321',
      model: 'Mercedes C-Class',
      year: '2022',
      owner: 'Emily Davis',
      status: 'warning',
      lastSeen: '30 minutes ago',
      location: 'Broadway & 42nd',
      speed: '55 mph',
      violations: 1,
      color: 'White'
    }
  ];

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'violation':
        return <Badge variant="destructive" className="shadow-glow-destructive">Violation</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'clean':
        return <Badge variant="default" className="bg-success text-success-foreground">Clean</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={mockUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor and track vehicles in the system
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8 border-accent/20 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by plate number, owner, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-accent/30"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'violation' ? 'destructive' : 'outline'}
                  onClick={() => setFilterStatus('violation')}
                  size="sm"
                >
                  Violations
                </Button>
                <Button
                  variant={filterStatus === 'warning' ? 'secondary' : 'outline'}
                  onClick={() => setFilterStatus('warning')}
                  size="sm"
                >
                  Warnings
                </Button>
                <Button
                  variant={filterStatus === 'clean' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('clean')}
                  size="sm"
                >
                  Clean
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    {vehicle.plateNumber}
                  </CardTitle>
                  {getStatusBadge(vehicle.status)}
                </div>
                <p className="text-muted-foreground">{vehicle.model} ({vehicle.year})</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Owner</p>
                      <p className="text-sm text-muted-foreground">{vehicle.owner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Location</p>
                      <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Seen</p>
                      <p className="text-sm text-muted-foreground">{vehicle.lastSeen}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Speed</p>
                      <p className="font-semibold text-lg">{vehicle.speed}</p>
                    </div>
                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Violations</p>
                      <p className="font-semibold text-lg flex items-center justify-center gap-1">
                        {vehicle.violations > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {vehicle.violations}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="flex-1 shadow-glow-primary">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Track Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OfficerVehicles;