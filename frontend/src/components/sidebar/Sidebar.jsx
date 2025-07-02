import React, { useState } from "react";
import { FaTachometerAlt, FaShieldAlt } from "react-icons/fa";
import {
  FiHome,
  FiUser,
  FiChevronRight,
  FiMap,
  FiFileText,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

const Sidebar = ({ role }) => {
  const [activeLink, setActiveLink] = useState("dashboard");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const qrValue = "https://speedguard-qr.com/vehicle/1234"; // Replace with dynamic value later if needed

  const downloadQR = () => {
    const svg = document.getElementById("qrCodeBig");
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "SpeedGuard_QR_Code.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const navLinks = [
    {
      to: "/driver-Layout/dashboard",
      icon: <FiHome className="mr-3 text-xl" />,
      label: "Dashboard",
      id: "dashboard",
    },
    {
      to: "/driver-Layout/speed-history",
      icon: <FaTachometerAlt className="mr-3 text-xl" />,
      label: "Speed History",
      id: "speedHistory",
    },
    {
      to: "/driver-Layout/violations",
      icon: <FaShieldAlt className="mr-3 text-xl" />,
      label: "Violations",
      id: "violations",
    },
    {
      to: "/driver-Layout/fine-history",
      icon: <FiFileText className="mr-3 text-xl" />,
      label: "Fine History",
      id: "fineHistory",
    },
    {
      to: "/driver-Layout/profile",
      icon: <FiUser className="mr-3 text-xl" />,
      label: "Profile",
      id: "profile",
    },
  ];

  const officerNavLinks = [
    {
      to: "/officer-Layout/dashboard",
      icon: <FiHome className="mr-3 text-xl" />,
      label: "Dashboard",
      id: "dashboard",
    },
    {
      to: "/officer-Layout/vehicle-lookup",
      icon: <FaTachometerAlt className="mr-3 text-xl" />,
      label: "Vehicle Lookup",
      id: "vehicleLookup",
    },
    {
      to: "/officer-Layout/issue-fine",
      icon: <FaShieldAlt className="mr-3 text-xl" />,
      label: "Issue Fine",
      id: "issueFine",
    },
    {
      to: "/officer-Layout/fine-history",
      icon: <FiFileText className="mr-3 text-xl" />,
      label: "Fine History",
      id: "fineHistory",
    },
    {
      to: "/officer-Layout/profile",
      icon: <FiUser className="mr-3 text-xl" />,
      label: "Profile",
      id: "profile",
    },
  ];

  const navLinksToUse = role === "Officer" ? officerNavLinks : navLinks;

  const ballPositions = [
    { top: "5%", left: "10%" },
    { top: "15%", left: "50%" },
    { top: "25%", left: "80%" },
    { top: "35%", left: "15%" },
    { top: "45%", left: "65%" },
    { top: "55%", left: "30%" },
    { top: "65%", left: "85%" },
    { top: "75%", left: "20%" },
    { top: "85%", left: "40%" },
    { top: "10%", left: "70%" },
    { top: "30%", left: "25%" },
    { top: "40%", left: "80%" },
    { top: "50%", left: "55%" },
    { top: "60%", left: "10%" },
    { top: "70%", left: "45%" },
  ];

  const balls = Array.from({ length: 15 }, (_, i) => {
    const ballNum = (i % 4) + 1;
    const sizeClass = `ball${i + 1}`;
    const moveAnim = `moveBall${ballNum}`;
    const duration = 20 + (i % 5) * 5;
    const { top, left } = ballPositions[i];
    return (
      <div
        key={i}
        className={`glassy-ball ${sizeClass}`}
        style={{
          top,
          left,
          animation: `${moveAnim} ${duration}s linear infinite, fadeInOut 6s infinite alternate`,
          pointerEvents: "none",
        }}
      ></div>
    );
  });

  return (
    <>
      <div className="glassy-sidebar relative flex flex-col items-center text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {balls}

        <div className="flex flex-col items-start justify-end mb-10 mt-6 w-full pr-10">
          <div className="flex items-center">
            <h2 className="text-2xl font-extrabold font-serif italic tracking-tight ml-6">
              SpeedGuard.
            </h2>
            <div className="flex items-center space-x-2">
              <FaTachometerAlt className="text-3xl text-white ml-2" />
            </div>
          </div>
          {role && (
            <div className="text-blue-300 text-2xl font-extrabold font-serif italic tracking-tight mt-1 ml-6">
              {role}
            </div>
          )}
        </div>

        <nav className="w-full flex flex-col items-center -mt-1">
          <ul className="space-y-4 w-11/12">
            {navLinksToUse.map((link) => (
              <li key={link.id}>
                <Link
                  to={link.to}
                  onClick={() => setActiveLink(link.id)}
                  className={`flex items-center justify-between rounded-sm transition duration-200 text-white w-full px-5 py-3 font-bold
                  ${
                    activeLink === link.id
                      ? "bg-white/20 backdrop-blur-md shadow-md scale-110 text-white/90"
                      : "hover:bg-white/15 hover:backdrop-blur-sm hover:scale-110"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </span>
                  <FiChevronRight className="text-xl" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Officer: QR Scanner Button, User: QR Code */}
        {role === "Officer" ? (
          <div className="mt-13 mb-6 flex flex-col items-center w-full">
            <button
              className="flex flex-col items-center justify-center w-24 h-24 bg-white/10 hover:bg-white/20 text-blue-500 rounded-xl shadow-lg transition-all duration-300 cursor-pointer mb-2"
              onClick={() => setIsQrModalOpen(true)}
            >
              <QrCode className="w-10 h-10 mb-1" />
              <span className="font-bold text-base">QR Scanner</span>
            </button>
          </div>
        ) : (
          <div
            className="mt-13 mb-6 cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => setIsQrModalOpen(true)}
          >
            <QRCode
              value={qrValue}
              size={80}
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p className="text-sm mt-1 -ml-4 text-gray-300">
              Tap QR to enlarge
            </p>
          </div>
        )}
      </div>
      {/* QR Modal (Full Screen Center) - moved outside sidebar for full screen */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred background overlay */}
          <div
            className="absolute inset-0 backdrop-blur-lg bg-white/5"
            onClick={() => setIsQrModalOpen(false)}
          ></div>

          {/* QR Container or Scanner */}
          <div className="relative z-60 bg-white rounded-lg p-6 flex flex-col items-center shadow-xl min-w-[320px] min-h-[320px]">
            {role === "Officer" ? (
              <>
                <div className="w-48 h-48 border-4 border-blue-400 rounded-lg flex items-center justify-center mb-4 bg-gray-100">
                  <span className="text-gray-400">[ QR Camera View ]</span>
                </div>
                <button
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => setIsQrModalOpen(false)}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <QRCode id="qrCodeBig" value={qrValue} size={250} />
                <button
                  onClick={downloadQR}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Download QR to Print
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
