import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Filter
} from 'lucide-react';

const UserPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockUser = {
    id: '1',
    name: 'John Smith',
    role: 'user' as const
  };

  const mockPayments = [
    {
      id: 'PAY001',
      violationId: 'V002',
      amount: 200,
      status: 'completed',
      date: '2024-01-20',
      method: 'Credit Card',
      cardLast4: '4532',
      transactionId: 'TXN123456789',
      description: 'Red Light Violation - Broadway & 42nd',
      feeAmount: 3.50,
      totalAmount: 203.50
    },
    {
      id: 'PAY002',
      violationId: 'V005',
      amount: 125,
      status: 'completed',
      date: '2024-01-18',
      method: 'Bank Transfer',
      transactionId: 'TXN987654321',
      description: 'Parking Violation - Downtown Area',
      feeAmount: 2.00,
      totalAmount: 127.00
    },
    {
      id: 'PAY003',
      violationId: 'V001',
      amount: 150,
      status: 'pending',
      date: '2024-01-22',
      method: 'Credit Card',
      cardLast4: '4532',
      transactionId: 'TXN456789123',
      description: 'Speeding Violation - Main St & 5th Ave',
      feeAmount: 3.00,
      totalAmount: 153.00
    },
    {
      id: 'PAY004',
      violationId: 'V006',
      amount: 75,
      status: 'failed',
      date: '2024-01-19',
      method: 'Credit Card',
      cardLast4: '1234',
      transactionId: 'TXN789123456',
      description: 'Stop Sign Violation - Oak Street',
      feeAmount: 2.50,
      totalAmount: 77.50,
      failureReason: 'Insufficient funds'
    },
    {
      id: 'PAY005',
      violationId: 'V007',
      amount: 300,
      status: 'refunded',
      date: '2024-01-15',
      method: 'Credit Card',
      cardLast4: '4532',
      transactionId: 'TXN321654987',
      description: 'Speeding Violation - Highway 101',
      feeAmount: 4.50,
      totalAmount: 304.50,
      refundDate: '2024-01-25',
      refundReason: 'Dispute approved'
    }
  ];

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.violationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="shadow-glow-destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-primary text-primary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'refunded':
        return <Receipt className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const totalPaid = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const pendingAmount = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={mockUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Payment History
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your fine payments and transaction history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-success">${totalPaid.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-warning">${pendingAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{filteredPayments.length}</p>
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
                  placeholder="Search payments..."
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
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('completed')}
                  size="sm"
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'failed' ? 'destructive' : 'outline'}
                  onClick={() => setStatusFilter('failed')}
                  size="sm"
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-6">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <CardTitle className="text-lg">Payment {payment.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        For violation {payment.violationId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${payment.totalAmount.toFixed(2)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{payment.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Payment Date</p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.method}
                        {payment.cardLast4 && ` ending in ${payment.cardLast4}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{payment.transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                  <h4 className="font-medium mb-3">Payment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fine Amount</span>
                      <span className="text-sm font-medium">${payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Processing Fee</span>
                      <span className="text-sm font-medium">${payment.feeAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Paid</span>
                      <span className="font-bold">${payment.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status-specific information */}
                {payment.status === 'failed' && payment.failureReason && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Payment Failed</p>
                    <p className="text-sm text-destructive/80">{payment.failureReason}</p>
                  </div>
                )}

                {payment.status === 'refunded' && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-primary">Payment Refunded</p>
                    <p className="text-sm text-primary/80">
                      Refunded on {payment.refundDate} - {payment.refundReason}
                    </p>
                  </div>
                )}

                {payment.status === 'pending' && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-warning">Payment Processing</p>
                    <p className="text-sm text-warning/80">
                      Your payment is being processed and will be confirmed within 24 hours
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  {payment.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  )}
                  
                  {payment.status === 'failed' && (
                    <Button size="sm" className="shadow-glow-primary">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Retry Payment
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    View Violation Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="border-accent/20 shadow-elegant">
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters' 
                  : 'You have no payment history yet'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserPayments;