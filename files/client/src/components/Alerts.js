import React from "react";

const thresholds = {
  pm25: 35, // µg/m³
  no2: 20,  // ppb
  o3: 80    // ppb
};

export default function Alerts({ data }) {
  if (!data) return null;
  const sources = [
    { name: "TEMPO", values: data.tempo },
    { name: "OpenAQ", values: data.openaq },
    { name: "Local Sensor", values: data.arduino }
  ];

  const alerts = [];
  for (const src of sources) {
    if (!src.values) continue;
    if (src.values.pm25 > thresholds.pm25)
      alerts.push(`${src.name}: PM2.5 high (${src.values.pm25} µg/m³)`);
    if (src.values.no2 > thresholds.no2)
      alerts.push(`${src.name}: NO₂ high (${src.values.no2} ppb)`);
    if (src.values.o3 && src.values.o3 > thresholds.o3)
      alerts.push(`${src.name}: O₃ high (${src.values.o3} ppb)`);
  }
  if (alerts.length === 0) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">⚠️ Air Quality Alert</h3>
      <ul className="list-disc ml-5">
        {alerts.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}