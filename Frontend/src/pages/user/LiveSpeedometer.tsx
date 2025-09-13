import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Gauge } from "lucide-react"; // ✅ fixed icon
import { io } from "socket.io-client";

// Connect to Socket.IO server
const socket = io("https://speedguard-gz70.onrender.com");

const LiveSpeedometer = () => {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    socket.on("live-speed", (data) => {
      setSpeed(data.speed);
    });

    return () => {
      socket.off("live-speed");
    };
  }, []);

  return (
    <Card className="p-6 bg-gradient-card border-border/50 hover:border-green-500 transition-all duration-300 text-center">
      <h2 className="text-sm text-muted-foreground mb-2">Live Speed</h2>
      <div className="flex items-center justify-center gap-3">
        <Gauge className="h-10 w-10 text-green-600" />
        <span className="text-2xl font-bold text-green-700">{speed} km/h</span>
      </div>
    </Card>
  );
};

export default LiveSpeedometer;
