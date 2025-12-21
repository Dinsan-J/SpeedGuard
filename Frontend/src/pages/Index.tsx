import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Camera, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-white mr-4" />
            <h1 className="text-5xl font-bold text-white">SpeedGuard</h1>
          </div>
          <p className="text-xl text-white/90 mb-8">
            Smart IoT-Based Traffic Violation Monitoring System for Sri Lanka
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                Get Started
              </Button>
            </Link>
            
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Research Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">IoT Speed Detection</h3>
              <p className="text-muted-foreground">ESP32 + GPS based real-time speed monitoring</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Merit Point System</h3>
              <p className="text-muted-foreground">100-point system with vehicle-type based penalties</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-info mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">QR Code Scanner</h3>
              <p className="text-muted-foreground">Police officer vehicle identification system</p>
            </Card>
            
            <Card className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">ML Risk Assessment</h3>
              <p className="text-muted-foreground">AI-powered driver risk analysis and fine calculation</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
