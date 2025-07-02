import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const SpeedGraph = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
        datasets: [
          {
            label: "Speed (km/h)",
            data: [40, 50, 60, 45, 55, 40, 50],
            fill: false,
            borderColor: "gold", // Gold color for the line
            backgroundColor: "gold", // Gold color for the points
            tension: 0.3,
            pointBackgroundColor: "gold", // Gold color for the points
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 80,
            ticks: {
              stepSize: 20,
            },
            title: {
              display: true,
              text: "Speed (km/h)",
              color: "white", // White text for axis title
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)", // Lighter grid lines for dark theme
            },
          },
          x: {
            title: {
              display: true,
              text: "Time",
              color: "white", // White text for axis title
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)", // Lighter grid lines for dark theme
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-gray-800 p-6 rounded-xl shadow-xl -mt-70">
      <h2 className="text-xl font-bold mb-4 text-white">Speed Monitoring</h2>
      <div className="flex justify-end mb-4">
        <select className="border border-gray-300 p-2 rounded text-sm bg-gray-700 text-white">
          <option>Today</option>
        </select>
      </div>
      <div style={{ width: "100%", height: "250px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SpeedGraph;
