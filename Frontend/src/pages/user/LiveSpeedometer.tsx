import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Gauge } from "lucide-react"; // ✅ fixed icon
import { io, Socket } from "socket.io-client";

// The backend URL - baked in at build time by Vite
const BACKEND_URL = import.meta.env.VITE_API_URL || "";

const LiveSpeedometer = ({
  initialOnline,
  initialLastHeartbeat,
  initialSpeed,
}: {
  initialOnline?: boolean;
  initialLastHeartbeat?: string | null;
  initialSpeed?: number | null;
}) => {
  const [speed, setSpeed] = useState<number>(() => {
    if (initialSpeed === null || initialSpeed === undefined) return 0;
    return initialSpeed;
  });
  const [lastSignalAt, setLastSignalAt] = useState<number | null>(() => {
    if (initialLastHeartbeat) return new Date(initialLastHeartbeat).getTime();
    return null;
  });
  const socketRef = useRef<Socket | null>(null);

  // When switching vehicle, update the online indicator immediately from DB.
  useEffect(() => {
    if (initialLastHeartbeat) {
      setLastSignalAt(new Date(initialLastHeartbeat).getTime());
    } else if (initialOnline) {
      setLastSignalAt(Date.now());
    } else {
      setLastSignalAt(null);
    }
  }, [initialLastHeartbeat, initialOnline]);

  // If switching vehicles, initialize speed from DB quickly.
  useEffect(() => {
    if (initialSpeed === null || initialSpeed === undefined) return;
    setSpeed(initialSpeed);
  }, [initialSpeed]);

  useEffect(() => {
    // Create socket inside useEffect so it always uses the correct runtime URL
    // (avoids module-level stale closure with empty VITE_API_URL from old builds)
    const socket = io(BACKEND_URL, {
      transports: ["polling", "websocket"], // polling first for Render compatibility
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("live-speed", (data) => {
      setSpeed(data.speed);
      setLastSignalAt(Date.now());
    });

    socket.on("iot-heartbeat", (payload: { timestamp?: string }) => {
      if (payload?.timestamp) {
        const t = Date.parse(payload.timestamp);
        if (!Number.isNaN(t)) {
          setLastSignalAt(t);
          return;
        }
      }
      setLastSignalAt(Date.now());
    });

    return () => {
      socket.off("live-speed");
      socket.off("iot-heartbeat");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Consider the device online if we got a signal recently.
  // 10-minute TTL: Render free tier can cause heartbeat gaps on wake-up.
  const ONLINE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const isOnline = lastSignalAt
    ? Date.now() - lastSignalAt < ONLINE_TTL_MS
    : !!initialOnline;

  return (
    <Card className="p-6 bg-gradient-card border-border/50 hover:border-green-500 transition-all duration-300 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h2 className="text-sm text-muted-foreground">Live Speed</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isOnline
              ? "bg-success/10 text-success border border-success/20"
              : "bg-warning/10 text-warning border border-warning/20"
          }`}
        >
          {isOnline ? "IoT Online" : "No Signal"}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Gauge className={`h-10 w-10 ${isOnline ? "text-green-600" : "text-warning"}`} />
        <span className={`text-2xl font-bold ${isOnline ? "text-green-700" : "text-warning"}`}>
          {speed} km/h
        </span>
      </div>
    </Card>
  );
};

export default LiveSpeedometer;
