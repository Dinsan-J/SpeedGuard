import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Car, 
  MapPin, 
  Calendar,
  DollarSign,
  Camera,
  Clock,
  FileText,
  CheckCircle,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OfficerIssueFine = () => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    violationType: '',
    location: '',
    speed: '',
    speedLimit: '',
    description: '',
    amount: '',
    evidence: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const violationTypes = [
    { value: 'speeding', label: 'Speeding', baseAmount: 150 },
    { value: 'red-light', label: 'Red Light Violation', baseAmount: 200 },
    { value: 'parking', label: 'Illegal Parking', baseAmount: 75 },
    { value: 'reckless', label: 'Reckless Driving', baseAmount: 300 },
    { value: 'phone', label: 'Mobile Phone Use', baseAmount: 100 },
    { value: 'seatbelt', label: 'Seatbelt Violation', baseAmount: 50 }
  ];

  const calculateFine = (type: string, speed?: string, limit?: string) => {
    const violation = violationTypes.find(v => v.value === type);
    if (!violation) return 0;

    let amount = violation.baseAmount;
    
    if (type === 'speeding' && speed && limit) {
      const excess = parseInt(speed) - parseInt(limit);
      if (excess > 30) amount += 200;
      else if (excess > 20) amount += 150;
      else if (excess > 10) amount += 100;
    }

    return amount;
  };

  const handleViolationTypeChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, violationType: value };
      const calculatedAmount = calculateFine(value, newData.speed, newData.speedLimit);
      return { ...newData, amount: calculatedAmount.toString() };
    });
  };

  const handleSpeedChange = (field: 'speed' | 'speedLimit', value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (newData.violationType === 'speeding') {
        const calculatedAmount = calculateFine('speeding', newData.speed, newData.speedLimit);
        newData.amount = calculatedAmount.toString();
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="p-8 bg-gradient-card border-border/50 text-center">
            <div className="mx-auto w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Fine Issued Successfully</h1>
            <p className="text-muted-foreground mb-6">
              Fine #{Math.random().toString().slice(2, 8)} has been issued for vehicle {formData.plateNumber}
            </p>
            
            <div className="bg-accent/20 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium">Fine Amount:</span>
                <span className="text-2xl font-bold text-primary">${formData.amount}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Link to="/officer/fines" className="flex-1">
                <Button className="w-full">View All Fines</Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsSubmitted(false)}
              >
                Issue Another Fine
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Issue Traffic Fine</h1>
            <p className="text-muted-foreground">Create a new traffic violation fine</p>
          </div>
          <Link to="/officer/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-card border-border/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Vehicle Information</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="plateNumber">License Plate Number *</Label>
                    <Input
                      id="plateNumber"
                      placeholder="e.g., ABC-1234"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Violation Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <h3 className="text-xl font-semibold">Violation Details</h3>
                  </div>

                  <div>
                    <Label htmlFor="violationType">Violation Type *</Label>
                    <Select onValueChange={handleViolationTypeChange} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select violation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {violationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} (Base: ${type.baseAmount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.violationType === 'speeding' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="speed">Recorded Speed (km/h) *</Label>
                        <Input
                          id="speed"
                          type="number"
                          placeholder="75"
                          value={formData.speed}
                          onChange={(e) => handleSpeedChange('speed', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="speedLimit">Speed Limit (km/h) *</Label>
                        <Input
                          id="speedLimit"
                          type="number"
                          placeholder="50"
                          value={formData.speedLimit}
                          onChange={(e) => handleSpeedChange('speedLimit', e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Main St & 5th Ave"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional details about the violation..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Fine Amount */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="h-5 w-5 text-secondary" />
                    <h3 className="text-xl font-semibold">Fine Amount</h3>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      className="mt-1"
                      readOnly={formData.violationType !== ''}
                    />
                    {formData.violationType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount calculated based on violation type and severity
                      </p>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Camera className="h-5 w-5 text-info" />
                    <h3 className="text-xl font-semibold">Evidence</h3>
                  </div>

                  <div>
                    <Label htmlFor="evidence">Evidence References</Label>
                    <Input
                      id="evidence"
                      placeholder="e.g., Camera-001, Photo-123"
                      value={formData.evidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Issue Fine
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fines Issued</span>
                  <Badge variant="secondary">47</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">$7,350</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Common</span>
                  <span className="text-sm">Speeding</span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Recent Fines</h3>
              <div className="space-y-3">
                {[
                  { plate: 'XYZ-789', type: 'Speeding', amount: '$175', time: '10 min ago' },
                  { plate: 'DEF-456', type: 'Red Light', amount: '$200', time: '25 min ago' },
                  { plate: 'GHI-123', type: 'Parking', amount: '$75', time: '1 hr ago' }
                ].map((fine, index) => (
                  <div key={index} className="p-3 bg-accent/20 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{fine.plate}</p>
                        <p className="text-xs text-muted-foreground">{fine.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{fine.amount}</p>
                        <p className="text-xs text-muted-foreground">{fine.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Guidelines */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Fine Guidelines</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Speeding: Base $150 + excess penalties</p>
                <p>• Red Light: $200 flat rate</p>
                <p>• Reckless Driving: $300 minimum</p>
                <p>• Parking: $75 standard rate</p>
                <p>• Mobile Phone: $100 flat rate</p>
                <p>• Seatbelt: $50 flat rate</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerIssueFine;