import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatsCounter } from '@/components/ui/stats-counter';
import { Badge } from '@/components/ui/badge';
import { DynamicHero } from '@/components/ui/dynamic-hero';
import { 
  Shield, 
  Camera, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target,
  Award,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: <Camera className="h-8 w-8 text-info" />,
      title: "Smart Speed Detection",
      description: "Advanced AI-powered cameras monitor traffic speed with 99.9% accuracy"
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Real-time Monitoring",
      description: "24/7 surveillance ensuring road safety and immediate violation detection"
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-warning" />,
      title: "Instant Alerts",
      description: "Immediate notifications for violations with automated fine processing"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Precision Tracking",
      description: "GPS-enabled location tracking for accurate violation recording"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-secondary" />,
      title: "Reduced Accidents",
      stat: "45%",
      description: "Decrease in traffic accidents"
    },
    {
      icon: <Clock className="h-6 w-6 text-info" />,
      title: "Faster Processing",
      stat: "80%",
      description: "Reduction in fine processing time"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-warning" />,
      title: "Compliance Rate",
      stat: "92%",
      description: "Improvement in speed compliance"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Hero Section */}
      <DynamicHero />

      {/* Stats Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCounter
              end={25000}
              label="Vehicles Monitored Daily"
              suffix="+"
              icon={<Users className="h-6 w-6 text-info" />}
            />
            <StatsCounter
              end={1200}
              label="Speed Cameras Active"
              suffix="+"
              icon={<Camera className="h-6 w-6 text-secondary" />}
            />
            <StatsCounter
              end={850}
              label="Violations Detected Today"
              suffix="+"
              icon={<AlertTriangle className="h-6 w-6 text-warning" />}
            />
            <StatsCounter
              end={99}
              label="Detection Accuracy"
              suffix="%"
              icon={<Award className="h-6 w-6 text-primary" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-secondary/10 text-secondary border-secondary/20">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Advanced Traffic Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cutting-edge technology meets intelligent design to create the most 
              comprehensive traffic violation detection system available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
                <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit group-hover:bg-accent/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-warning/10 text-warning border-warning/20">
              Impact
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Proven Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our intelligent traffic management system delivers measurable improvements 
              in road safety and operational efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 text-center bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
                <div className="mb-6 p-4 bg-accent/10 rounded-full w-fit mx-auto group-hover:bg-accent/20 transition-colors duration-300">
                  {benefit.icon}
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{benefit.stat}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Traffic Management?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of officers and citizens using SpeedGuard for safer roads.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold">SpeedGuard</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 SpeedGuard. All rights reserved. Making roads safer through intelligent technology.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;