import React from "react";

export default function Dashboard({ data }) {
  if (!data) return null;
  const { tempo, openaq, arduino, weather } = data;

  // Helper to display a block for a data source
  const AQBlock = ({ title, values, color }) => (
    <div className="bg-white rounded shadow p-4 flex-1 min-w-[200px] mx-1">
      <h3 className={`font-bold mb-2 text-lg ${color}`}>{title}</h3>
      {values ? (
        <ul>
          {"pm25" in values && <li>PM2.5: <b>{values.pm25}</b> µg/m³</li>}
          {"no2" in values && <li>NO₂: <b>{values.no2}</b> ppb</li>}
          {"o3" in values && <li>O₃: <b>{values.o3}</b> ppb</li>}
          {"temperature" in values && <li>Temp: <b>{values.temperature}</b> °C</li>}
          {"humidity" in values && <li>Humidity: <b>{values.humidity}</b> %</li>}
          {"wind" in values && <li>Wind: <b>{values.wind}</b> m/s</li>}
          <li className="text-xs mt-1 text-gray-400">
            {values.timestamp ? new Date(values.timestamp).toLocaleString() : ""}
          </li>
        </ul>
      ) : (
        <div className="text-gray-400">No data</div>
      )}
    </div>
  );

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Latest Readings</h2>
      <div className="flex flex-wrap gap-2">
        <AQBlock title="TEMPO Satellite" values={tempo} color="text-blue-700" />
        <AQBlock title="Ground Station (OpenAQ)" values={openaq} color="text-green-700" />
        <AQBlock title="Local Sensor (Arduino)" values={arduino} color="text-red-600" />
        <AQBlock title="Weather" values={weather} color="text-yellow-700" />
      </div>
    </section>
  );
}