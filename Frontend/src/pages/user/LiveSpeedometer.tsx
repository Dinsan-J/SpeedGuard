import { useEffect, useState } from "react";
import { io } from "socket.io-client";

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
    <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white text-center">
      <h3 className="text-lg font-bold mb-2">Live Speed</h3>
      <div className="text-4xl font-bold">{speed} km/h</div>
    </div>
  );
};

export default LiveSpeedometer;
