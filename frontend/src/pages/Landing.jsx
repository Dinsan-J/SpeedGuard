import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showBulbs, setShowBulbs] = useState(false);

  const handleSelect = (role) => {
    navigate("/register", { state: { role } });
  };

  // Show bulbs after 2s (after content animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBulbs(true);
    }, 2000); // Adjust time if your content animation is longer

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      {/* Content */}
      <div className="text-center flex flex-col items-center justify-center">
        <div className="flex items-center justify-center space-x-6">
          {/* SpeedGuard Title */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-2xl animate-fadeInDown">
              SpeedGuard
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mt-4 mb-10 animate-fadeIn">
              Smart IoT-Based Traffic Violation Monitoring System for Sri Lanka
            </p>
          </div>

          {/* Bulbs next to SpeedGuard */}
          <div
            className={`flex flex-col items-center space-y-4 transition-opacity duration-200 ${
              showBulbs ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-5 h-5 bg-red-500 rounded-full animate-traffic-red"></div>
            <div className="w-5 h-5 bg-yellow-500 rounded-full animate-traffic-yellow"></div>
            <div className="w-5 h-5 bg-green-500 rounded-full animate-traffic-green"></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fadeIn justify-center mt-8">
          <button
            onClick={() => handleSelect("officer")}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-full text-lg font-bold shadow-2xl hover:scale-110 transition-transform duration-300"
          >
            I am an Officer
          </button>
          <button
            onClick={() => handleSelect("user")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-full text-lg font-bold shadow-2xl hover:scale-110 transition-transform duration-300"
          >
            I am a Driver
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
