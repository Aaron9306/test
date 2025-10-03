import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart, LineElement, CategoryScale, LinearScale, PointElement,
  Tooltip, Legend
} from "chart.js";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function HistoryChart({ history }) {
  if (!history || history.length === 0) return null;
  const labels = history.map((h) =>
    new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const pm25 = history.map((h) => h.pm25);
  const no2 = history.map((h) => h.no2);
  const temp = history.map((h) => h.temperature);

  const data = {
    labels,
    datasets: [
      {
        label: "PM2.5 (µg/m³)",
        data: pm25,
        fill: false,
        borderColor: "#ef4444",
        backgroundColor: "#fecaca",
        tension: 0.2,
      },
      {
        label: "NO₂ (ppb)",
        data: no2,
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#bae6fd",
        tension: 0.2,
      },
      {
        label: "Temperature (°C)",
        data: temp,
        fill: false,
        borderColor: "#facc15",
        backgroundColor: "#fde68a",
        tension: 0.2,
        yAxisID: "y2",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Air Quality" },
      },
      y2: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Temperature (°C)" },
      }
    }
  };
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Historical Trends (Past 24h)</h2>
      <Line data={data} options={options} />
    </div>
  );
}