import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Download, Eye, Edit, FileText, DollarSign } from 'lucide-react';

const OfficerFines = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockUser = {
    id: '1',
    name: 'Officer Johnson',
    role: 'officer' as const
  };

  const mockFines = [
    {
      id: 'F001',
      plateNumber: 'ABC-123',
      violationType: 'Speeding',
      amount: 150,
      status: 'unpaid',
      date: '2024-01-15',
      location: 'Main St & 5th Ave',
      officerName: 'Officer Johnson',
      dueDate: '2024-02-15',
      speed: '75 mph in 55 mph zone'
    },
    {
      id: 'F002',
      plateNumber: 'XYZ-789',
      violationType: 'Red Light',
      amount: 200,
      status: 'paid',
      date: '2024-01-14',
      location: 'Broadway & 42nd',
      officerName: 'Officer Smith',
      dueDate: '2024-02-14',
      speed: null
    },
    {
      id: 'F003',
      plateNumber: 'DEF-456',
      violationType: 'Parking',
      amount: 75,
      status: 'overdue',
      date: '2024-01-10',
      location: 'Park Avenue',
      officerName: 'Officer Johnson',
      dueDate: '2024-02-10',
      speed: null
    },
    {
      id: 'F004',
      plateNumber: 'GHI-321',
      violationType: 'Speeding',
      amount: 125,
      status: 'pending',
      date: '2024-01-16',
      location: 'Highway 101',
      officerName: 'Officer Davis',
      dueDate: '2024-02-16',
      speed: '70 mph in 60 mph zone'
    }
  ];

  const filteredFines = mockFines.filter(fine => {
    const matchesSearch = fine.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fine.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fine.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
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
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalAmount = filteredFines.reduce((sum, fine) => sum + fine.amount, 0);
  const paidAmount = filteredFines.filter(f => f.status === 'paid').reduce((sum, fine) => sum + fine.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={mockUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Fine Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Issue, track, and manage traffic violation fines
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fines</p>
                  <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
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
                <div>
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="text-2xl font-bold text-success">${paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-destructive">${unpaidAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8 border-accent/20 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search fines..."
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
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" className="shadow-glow-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Fine
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fines Table */}
        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Traffic Fines ({filteredFines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fine ID</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Violation</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFines.map((fine) => (
                    <TableRow key={fine.id} className="hover:bg-accent/5">
                      <TableCell className="font-medium">{fine.id}</TableCell>
                      <TableCell className="font-semibold">{fine.plateNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{fine.violationType}</p>
                          {fine.speed && (
                            <p className="text-xs text-muted-foreground">{fine.speed}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${fine.amount}</TableCell>
                      <TableCell>{fine.date}</TableCell>
                      <TableCell className={fine.status === 'overdue' ? 'text-destructive font-medium' : ''}>
                        {fine.dueDate}
                      </TableCell>
                      <TableCell>{getStatusBadge(fine.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredFines.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No fines found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficerFines;