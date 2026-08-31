import React, { useState, useEffect } from 'react';
import { getHealthCheck, getPlants, getReadings } from '../services/api';
import { Server, RefreshCw, CheckCircle2, AlertTriangle, Clock, Database, Factory, FileSpreadsheet } from 'lucide-react';

export const StatusCard = () => {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
    latency: null,
    timestamp: null,
  });

  const [dbData, setDbData] = useState({
    loading: true,
    connected: false,
    plantCount: 0,
    readingCount: 0,
    plantsList: [],
    error: null,
  });

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    setDbData((prev) => ({ ...prev, loading: true }));

    const res = await getHealthCheck();
    if (res.success) {
      setStatus({
        loading: false,
        connected: true,
        data: res.data,
        error: null,
        latency: res.latency,
        timestamp: res.timestamp,
      });

      // Fetch Database Plants & Readings summary
      const plantRes = await getPlants();
      const readingRes = await getReadings(1, 1);

      if (plantRes.success) {
        setDbData({
          loading: false,
          connected: true,
          plantCount: plantRes.data.length,
          readingCount: readingRes.success ? readingRes.data.total : 0,
          plantsList: plantRes.data,
          error: null,
        });
      } else {
        setDbData({
          loading: false,
          connected: false,
          plantCount: 0,
          readingCount: 0,
          plantsList: [],
          error: plantRes.error,
        });
      }
    } else {
      setStatus({
        loading: false,
        connected: false,
        data: null,
        error: res.error,
        latency: res.latency,
        timestamp: res.timestamp,
      });
      setDbData({
        loading: false,
        connected: false,
        plantCount: 0,
        readingCount: 0,
        plantsList: [],
        error: 'API Disconnected',
      });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* API & Database Combined Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend API Health Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div
            className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 ${
              status.connected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />

          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-800/90 text-cyan-400 rounded-xl border border-slate-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">FastAPI Service Status</h3>
                <p className="text-xs text-slate-400">Backend API Connectivity</p>
              </div>
            </div>

            <button
              onClick={checkStatus}
              disabled={status.loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{status.loading ? 'Checking...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Backend Connection</span>
              {status.connected ? (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 animate-pulse" />
                  Disconnected
                </span>
              )}
            </div>

            {status.connected && status.data && (
              <div className="bg-slate-950/80 rounded-xl p-4 border border-emerald-900/40 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> API Active
                  </span>
                  <span className="text-[11px] text-slate-500">Latency: {status.latency} ms</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block uppercase">Service</span>
                    <span className="text-cyan-300 font-semibold">{status.data.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Environment</span>
                    <span className="text-amber-300 font-semibold">Production Ready</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PostgreSQL Database Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div
            className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 ${
              dbData.connected ? 'bg-cyan-500' : 'bg-rose-500'
            }`}
          />

          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-800/90 text-cyan-400 rounded-xl border border-slate-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Database Status</h3>
                <p className="text-xs text-slate-400">PostgreSQL / SQLAlchemy 2.x ORM</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Database Connection</span>
              {dbData.connected ? (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 animate-pulse" />
                  Disconnected
                </span>
              )}
            </div>

            {dbData.connected && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Total Plants</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono">{dbData.plantCount}</span>
                  </div>
                  <Factory className="w-8 h-8 text-cyan-500/30" />
                </div>

                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Daily Readings</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{dbData.readingCount}</span>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500/30" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Industrial Facilities Seeded Summary Table */}
      {dbData.connected && dbData.plantsList.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center">
              <Factory className="w-4 h-4 mr-2 text-cyan-400" />
              Registered Industrial Facilities (Seed Dataset)
            </h4>
            <span className="text-xs text-slate-500 font-mono">GET /api/plants</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Facility Name</th>
                  <th className="px-4 py-3">Industry Sector</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Prod Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dbData.plantsList.map((plant) => (
                  <tr key={plant.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-cyan-400">{plant.plant_code}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans font-medium">{plant.plant_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {plant.industry_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{plant.location || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{plant.production_unit || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
