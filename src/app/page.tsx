"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Thermometer, Droplets, Wind, AlertTriangle, CheckCircle, Activity, AlertOctagon, Flame } from "lucide-react";

// --- ⚙️ CONFIGURATION: THRESHOLDS ---
const THRESHOLDS = {
  TEMP: { WARNING: 32, CRITICAL: 35 },  // °C
  HUMID: { HIGH: 80, LOW: 20 },         // %
  GAS: { WARNING: 600, CRITICAL: 1000 } // PPM
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensors');
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading Smart City connection...</div>;
  if (!data || !data.latest) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">No Data Stream</div>;

  const { latest, history } = data;

  // --- 🧠 STATUS LOGIC ---
  let status = "NORMAL";
  let statusColor = "bg-green-600";
  let statusIcon = <CheckCircle className="h-5 w-5 text-white" />;

  if (latest.gas > THRESHOLDS.GAS.CRITICAL) {
    status = "CRITICAL: SMOKE DETECTED";
    statusColor = "bg-red-600 animate-pulse border-red-400";
    statusIcon = <Flame className="h-5 w-5 text-white" />;
  } else if (latest.temp > THRESHOLDS.TEMP.CRITICAL) {
    status = "CRITICAL: EXTREME HEAT";
    statusColor = "bg-red-600 animate-pulse";
    statusIcon = <AlertOctagon className="h-5 w-5 text-white" />;
  } else if (latest.gas > THRESHOLDS.GAS.WARNING) {
    status = "WARNING: POOR AIR QUALITY";
    statusColor = "bg-orange-500";
    statusIcon = <AlertTriangle className="h-5 w-5 text-white" />;
  } else if (latest.humid > THRESHOLDS.HUMID.HIGH) {
    status = "WARNING: HIGH HUMIDITY";
    statusColor = "bg-blue-600";
    statusIcon = <Droplets className="h-5 w-5 text-white" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Smart City Monitor
          </h1>
          <p className="text-slate-400 mt-1">Real-time Environmental Analysis</p>
        </div>

        <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg transition-colors border ${statusColor} border-opacity-50`}>
          {statusIcon}
          <span className="font-bold text-white tracking-wide">{status}</span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Temperature */}
        <Card className={`bg-slate-900 border-slate-800 shadow-lg ${latest.temp > THRESHOLDS.TEMP.WARNING ? "border-orange-500" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Temperature</CardTitle>
            <Thermometer className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{latest.temp.toFixed(1)}°C</div>
            <div className="text-xs text-slate-500">Threshold: {THRESHOLDS.TEMP.WARNING}°C</div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className={`bg-slate-900 border-slate-800 shadow-lg ${latest.humid > THRESHOLDS.HUMID.HIGH ? "border-blue-500" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Humidity</CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{latest.humid.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Optimal: 40% - 70%</div>
          </CardContent>
        </Card>

        {/* Gas */}
        <Card className={`bg-slate-900 border-slate-800 shadow-lg ${latest.gas > THRESHOLDS.GAS.WARNING ? "border-red-500 bg-red-950/10" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Air Quality</CardTitle>
            <Wind className={`h-5 w-5 ${latest.gas > THRESHOLDS.GAS.WARNING ? "text-red-500" : "text-green-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{latest.gas} <span className="text-lg font-normal text-slate-500">PPM</span></div>
            <div className="text-xs text-slate-500">Clean Air: &lt; 400 PPM</div>
          </CardContent>
        </Card>
      </div>

      {/* --- MASTER CHART (COMBINED) --- */}
      <Card className="bg-slate-900 border-slate-800 mb-8 p-4">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" /> Combined Live Trends
          </CardTitle>
          <p className="text-sm text-slate-400">Correlate Temperature, Humidity, and Gas levels on a unified timeline.</p>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(str) => str.split('T')[1].substring(0, 8)}
              />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff' }} />
              <Legend verticalAlign="top" height={36} />

              {/* LEFT AXIS: Temp & Humidity */}
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8' }} domain={[0, 100]} />

              {/* RIGHT AXIS: Gas */}
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#ef4444' }} />

              {/* LINES */}
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={false} name="Temp (°C)" />
              <Line yAxisId="left" type="monotone" dataKey="humid" stroke="#3b82f6" strokeWidth={3} dot={false} name="Humidity (%)" />
              <Line yAxisId="right" type="monotone" dataKey="gas" stroke="#ef4444" strokeWidth={3} dot={false} name="Gas (PPM)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* --- DETAILED CHARTS (GRID) --- */}
      <h2 className="text-xl font-semibold text-white mb-4 pl-1 border-l-4 border-blue-500">Individual Sensor Metrics</h2>
      <div className="grid gap-6 md:grid-cols-3">

        <Card className="bg-slate-900 border-slate-800 p-2">
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-slate-500 mt-2">Temperature Trend</p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-2">
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                <Line type="monotone" dataKey="humid" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humid" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-slate-500 mt-2">Humidity Trend</p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-2">
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                <Line type="monotone" dataKey="gas" stroke="#ef4444" strokeWidth={2} dot={false} name="Gas" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-slate-500 mt-2">Gas Levels Trend</p>
          </div>
        </Card>

      </div>
    </div>
  );
}