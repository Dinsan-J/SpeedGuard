import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon,
  Building,
  Users,
  Shield
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      subtext: 'Mon-Fri 8AM-6PM EST',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'support@speedguard.com',
      subtext: 'We respond within 24 hours',
      bgColor: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '1234 Safety Boulevard',
      subtext: 'Tech City, TC 12345',
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subtext: '8:00 AM - 6:00 PM EST',
      bgColor: 'bg-destructive/10',
      iconColor: 'text-destructive'
    }
  ];

  const departments = [
    {
      name: 'Sales & Partnerships',
      email: 'sales@speedguard.com',
      phone: '+1 (555) 123-4567',
      description: 'New implementations and partnerships',
      icon: Building
    },
    {
      name: 'Technical Support',
      email: 'support@speedguard.com',
      phone: '+1 (555) 123-4568',
      description: '24/7 system support and maintenance',
      icon: HeadphonesIcon
    },
    {
      name: 'Training & Education',
      email: 'training@speedguard.com',
      phone: '+1 (555) 123-4569',
      description: 'Officer training and system education',
      icon: Users
    },
    {
      name: 'Legal & Compliance',
      email: 'legal@speedguard.com',
      phone: '+1 (555) 123-4570',
      description: 'Legal questions and compliance issues',
      icon: Shield
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'training', label: 'Training Request' },
    { value: 'legal', label: 'Legal & Compliance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            Contact SpeedGuard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with our team for support, sales inquiries, or to learn more 
            about how SpeedGuard can transform your traffic management operations.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="border-accent/20 shadow-elegant hover:shadow-glow-primary transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`p-4 ${info.bgColor} rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                  <info.icon className={`h-8 w-8 ${info.iconColor}`} />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="font-medium mb-1">{info.details}</p>
                <p className="text-sm text-muted-foreground">{info.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-accent/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-accent/30 rounded-md bg-background"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-1"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full shadow-glow-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Departments */}
          <div>
            <Card className="border-accent/20 shadow-elegant">
              <CardHeader>
                <CardTitle>Department Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {departments.map((dept, index) => (
                  <div key={index} className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <dept.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">{dept.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{dept.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{dept.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="border-accent/20 shadow-elegant mb-16">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How quickly can SpeedGuard be deployed?</h4>
                  <p className="text-sm text-muted-foreground">
                    Typical deployment takes 2-4 weeks depending on the size of your operation. 
                    We provide full training and support throughout the process.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What training is provided?</h4>
                  <p className="text-sm text-muted-foreground">
                    We offer comprehensive training including online modules, hands-on workshops, 
                    and ongoing support to ensure your team is fully prepared.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Is customer support available 24/7?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, our technical support team is available 24/7 to ensure your 
                    operations never experience downtime.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What makes SpeedGuard different?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI-powered detection, real-time analytics, and user-friendly interface 
                    make us the leading choice for modern traffic management.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can SpeedGuard integrate with existing systems?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, our platform is designed to integrate seamlessly with most existing 
                    law enforcement and municipal systems.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What about data security and privacy?</h4>
                  <p className="text-sm text-muted-foreground">
                    We maintain the highest security standards with end-to-end encryption, 
                    secure cloud hosting, and full compliance with data protection regulations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-destructive/20 shadow-elegant bg-destructive/5">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <Phone className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Emergency Technical Support</h3>
            <p className="text-muted-foreground mb-4">
              For critical system issues requiring immediate attention
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Emergency: +1 (555) 911-HELP
              </Badge>
              <span className="text-sm text-muted-foreground">Available 24/7</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;