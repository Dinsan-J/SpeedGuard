import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Target, 
  Users, 
  Award,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

const About = () => {
  const features = [
    'Real-time traffic monitoring',
    'Automated violation detection',
    'Smart analytics and reporting',
    'Mobile-friendly interface',
    'Secure payment processing',
    'Evidence documentation',
    'Multi-officer coordination',
    '24/7 system availability'
  ];

  const stats = [
    { label: 'Cities Served', value: '150+', icon: MapPin },
    { label: 'Officers Using', value: '2,500+', icon: Users },
    { label: 'Violations Processed', value: '1M+', icon: Shield },
    { label: 'Years Experience', value: '10+', icon: Award }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Technology Officer',
      description: 'Leading innovation in traffic management systems'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Safety Operations',
      description: 'Ensuring road safety through smart enforcement'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      description: 'Designing user-friendly solutions for law enforcement'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 bg-gradient-hero rounded-full shadow-glow-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              About SpeedGuard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing traffic management through intelligent technology, 
            making roads safer for everyone while streamlining law enforcement operations.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-16 border-accent/20 shadow-elegant">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  To create safer roads and communities through innovative traffic management 
                  technology that empowers law enforcement while educating drivers about 
                  responsible road usage.
                </p>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-accent/20 shadow-elegant text-center">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Detection</h3>
                <p className="text-muted-foreground">
                  Advanced machine learning algorithms automatically detect and classify 
                  traffic violations with 99.5% accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-success/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  GPS-enabled monitoring provides real-time location data and traffic 
                  pattern analysis for optimal enforcement deployment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-warning/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Processing</h3>
                <p className="text-muted-foreground">
                  Lightning-fast violation processing and notification system ensures 
                  immediate action and improved response times.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="outline" className="mb-3">{member.role}</Badge>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <Card className="mb-16 border-accent/20 shadow-elegant">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Safety First
                  </h3>
                  <p className="text-muted-foreground">
                    Every feature is designed with public safety as the primary concern, 
                    ensuring our technology serves to protect lives and prevent accidents.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Community Focus
                  </h3>
                  <p className="text-muted-foreground">
                    We believe in building stronger, safer communities through fair and 
                    transparent traffic enforcement that benefits everyone.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Innovation
                  </h3>
                  <p className="text-muted-foreground">
                    Continuously advancing our technology to stay ahead of evolving 
                    traffic challenges and provide cutting-edge solutions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Excellence
                  </h3>
                  <p className="text-muted-foreground">
                    Committed to delivering the highest quality products and services 
                    that exceed expectations and set industry standards.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="border-accent/20 shadow-elegant bg-gradient-hero">
          <CardContent className="p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Traffic Management?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of law enforcement agencies already using SpeedGuard 
              to make their communities safer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Phone className="h-5 w-5 mr-2" />
                Schedule Demo
              </Button>
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Mail className="h-5 w-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;