import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  ArrowRight, 
  Shield, 
  Camera, 
  Brain,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

import heroTraffic from '@/assets/hero-traffic.jpg';
import heroSmartCity from '@/assets/hero-smart-city.jpg';
import heroControlCenter from '@/assets/hero-control-center.jpg';
import heroSpeedDetection from '@/assets/hero-speed-detection.jpg';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  badge: {
    icon: React.ReactNode;
    text: string;
  };
  image: string;
}

const heroContents: HeroContent[] = [
  {
    title: "SpeedGuard",
    subtitle: "Smart Traffic Control",
    description: "Revolutionary AI-powered traffic violation detection system ensuring safer roads through intelligent speed monitoring and automated fine management.",
    badge: {
      icon: <Zap className="h-4 w-4 mr-2" />,
      text: "Next-Generation Traffic Management"
    },
    image: heroSmartCity
  },
  {
    title: "AI-Powered",
    subtitle: "Violation Detection",
    description: "Advanced machine learning algorithms analyze traffic patterns in real-time, detecting violations with unprecedented accuracy and speed.",
    badge: {
      icon: <Brain className="h-4 w-4 mr-2" />,
      text: "Artificial Intelligence Technology"
    },
    image: heroControlCenter
  },
  {
    title: "Precision",
    subtitle: "Speed Monitoring",
    description: "State-of-the-art camera systems capture vehicle speeds with laser precision, ensuring accurate enforcement and fair violation processing.",
    badge: {
      icon: <Target className="h-4 w-4 mr-2" />,
      text: "Precision Speed Detection"
    },
    image: heroSpeedDetection
  },
  {
    title: "Real-Time",
    subtitle: "Traffic Analytics",
    description: "Comprehensive dashboard provides instant insights into traffic patterns, violation trends, and system performance metrics.",
    badge: {
      icon: <TrendingUp className="h-4 w-4 mr-2" />,
      text: "Live Traffic Intelligence"
    },
    image: heroTraffic
  }
];

export const DynamicHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroContents.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentContent = heroContents[currentIndex];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background Images with Crossfade */}
      {heroContents.map((content, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${content.image})` }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>
        </div>
      ))}
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse opacity-30"></div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <div className={`transition-all duration-500 transform ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-300 animate-fade-in">
              {currentContent.badge.icon}
              {currentContent.badge.text}
            </Badge>
          </div>
          
          {/* Animated Heading */}
          <div className={`transition-all duration-500 transform ${isAnimating ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent animate-scale-in">
                {currentContent.title}
              </span>
              <br />
              <span className="text-foreground hover-scale">
                {currentContent.subtitle}
              </span>
            </h1>
          </div>
          
          {/* Animated Description */}
          <div className={`transition-all duration-500 transform delay-100 ${isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              {currentContent.description}
            </p>
          </div>
          
          {/* Animated Buttons */}
          <div className={`transition-all duration-500 transform delay-200 ${isAnimating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg shadow-glow-primary hover:shadow-glow-primary/80 transition-all duration-300 hover-scale group animate-scale-in"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              
              <Link to="/about">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 text-lg hover:bg-accent/50 hover-scale animate-fade-in"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Content Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroContents.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex 
                  ? 'bg-primary shadow-glow-primary' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <div className="p-3 bg-primary/10 rounded-full backdrop-blur-sm">
          <Shield className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <div className="absolute top-32 right-16 animate-pulse">
        <div className="p-3 bg-secondary/10 rounded-full backdrop-blur-sm">
          <Camera className="h-6 w-6 text-secondary" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
        <div className="p-3 bg-info/10 rounded-full backdrop-blur-sm">
          <Clock className="h-6 w-6 text-info" />
        </div>
      </div>
    </section>
  );
};