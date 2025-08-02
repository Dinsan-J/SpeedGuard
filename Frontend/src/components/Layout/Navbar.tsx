import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    role: 'officer' | 'user';
  } | null;
  onLogout?: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const officerLinks = [
    { to: '/officer/dashboard', label: 'Dashboard' },
    { to: '/officer/vehicles', label: 'Vehicles' },
    { to: '/officer/fines', label: 'Fines' },
    { to: '/officer/analytics', label: 'Analytics' },
  ];

  const userLinks = [
    { to: '/user/dashboard', label: 'Dashboard' },
    { to: '/user/vehicles', label: 'My Vehicles' },
    { to: '/user/violations', label: 'Violations' },
    { to: '/user/payments', label: 'Payments' },
  ];

  const getNavLinks = () => {
    if (!user) return publicLinks;
    return user.role === 'officer' ? officerLinks : userLinks;
  };

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-hero rounded-lg shadow-glow-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                SpeedGuard
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Traffic Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavLinks().map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary text-primary-foreground shadow-glow-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-accent rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge 
                      variant={user.role === 'officer' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="shadow-glow-primary">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getNavLinks().map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};