import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Search,
  User,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  TrendingDown,
  TrendingUp,
  Calendar,
  Car,
  FileText,
  Eye,
  Edit,
  RotateCcw
} from "lucide-react";

interface Driver {
  drivingLicenseId: string;
  fullName: string;
  meritPoints: number;
  status: 'active' | 'warning' | 'suspended' | 'revoked';
  riskLevel: 'low' | 'medium' | 'high';
  totalViolations: number;
  averageRiskScore: number;
  lastViolationDate?: string;
  mandatoryTrainingRequired: boolean;
  licenseExpiryDate: string;
  licenseClass: string;
}

interface ViolationHistory {
  _id: string;
  timestamp: string;
  speed: number;
  speedLimit: number;
  finalFine: number;
  riskScore: number;
  riskLevel: string;
  meritPointsDeducted: number;
  sensitiveZone?: {
    isInZone: boolean;
    zoneName?: string;
    zoneType?: string;
  };
}

const DriverManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [violationHistory, setViolationHistory] = useState<ViolationHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'suspended' | 'revoked'>('all');
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      // Simulate API call - in production, this would fetch real driver data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock driver data
      const mockDrivers: Driver[] = [
        {
          drivingLicenseId: "B1234567",
          fullName: "Kasun Perera",
          meritPoints: 74,
          status: "warning",
          riskLevel: "medium",
          totalViolations: 3,
          averageRiskScore: 0.47,
          lastViolationDate: "2024-12-13",
          mandatoryTrainingRequired: false,
          licenseExpiryDate: "2030-01-01",
          licenseClass: "B"
        },
        {
          drivingLicenseId: "B2345678",
          fullName: "Nimal Silva",
          meritPoints: 45,
          status: "suspended",
          riskLevel: "high",
          totalViolations: 8,
          averageRiskScore: 0.72,
          lastViolationDate: "2