import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Gauge } from "lucide-react"; // ✅ instead of Speedometer

const LiveSpeedometer = () => {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const fetchSpeed = async () => {
      try {
        const res = await fetch(
          "https://speedguard-gz70.onrender.com/api/violation/latest"
        );
        const data = await res.json();
        if (data?.success && data.violation?.speed !== undefined) {
          setSpeed(data.violation.speed);
        }
      } catch (error) {
        console.error("Error fetching speed:", error);
      }
    };

    fetchSpeed();
    const interval = setInterval(fetchSpeed, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gradient-card border-border/50 hover:border-green-500 transition-all duration-300">
      <h2 className="text-sm text-muted-foreground mb-2">Live Speed</h2>
      <div className="flex items-center justify-center gap-3">
        <Gauge className="h-10 w-10 text-green-600" /> {/* ✅ fixed */}
        <span className="text-2xl font-bold text-green-700">{speed} km/h</span>
      </div>
    </Card>
  );
};

export default LiveSpeedometer;
