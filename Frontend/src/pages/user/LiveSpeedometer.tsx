import { useState, useEffect } from "react";
import { Speedometer } from "lucide-react";
import { Card } from "@/components/ui/card";

const LiveSpeedometer = () => {
  const [speed, setSpeed] = useState<number>(0);

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
    const interval = setInterval(fetchSpeed, 2000); // update every 2 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gradient-card border-border/50 hover:border-green-500 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Live Speed</p>
          <p className="text-3xl font-bold text-green-600">{speed} km/h</p>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <Speedometer className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Updated in real time</p>
      </div>
    </Card>
  );
};

export default LiveSpeedometer;
