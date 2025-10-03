import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import HistoryChart from "./components/HistoryChart";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000/api";

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aqRes, histRes] = await Promise.all([
        axios.get(
          `${API_BASE}/${useMock ? "mock/air-quality" : "air-quality"}`
        ),
        axios.get(`${API_BASE}/${useMock ? "mock/history" : "history"}`),
      ]);
      setData(aqRes.data);
      setHistory(histRes.data);
    } catch (e) {
      setData(null);
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 90 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [useMock]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-blue-800 text-white p-4 shadow">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold">Air Quality Dashboard</h1>
          <div className="mt-2 md:mt-0">
            <label className="mr-2 font-medium">
              <input
                type="checkbox"
                checked={useMock}
                onChange={() => setUseMock((v) => !v)}
                className="mr-1"
              />
              Use Mock Data
            </label>
            <span className="ml-4 text-xs">Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "..."}</span>
          </div>
        </div>
      </header>
      <main className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading...</div>
        ) : (
          <>
            <Alerts data={data} />
            <Dashboard data={data} />
            <div className="my-8">
              <HistoryChart history={history} />
            </div>
          </>
        )}
      </main>
      <footer className="p-4 text-center text-xs bg-gray-200 text-gray-600">
        &copy; {new Date().getFullYear()} Air Quality App. NASA TEMPO, OpenAQ, OpenWeatherMap, Arduino.
      </footer>
    </div>
  );
}

export default App;