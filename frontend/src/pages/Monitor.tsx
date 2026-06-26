import { useState, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HealthData {
  rss: string;
  heap: string;
  external: string;
  totalHeapSize: string;
  arrayBuffers: string;
}

interface DataPoint {
  time: string;
  rss: number;
  heap: number;
  external: number;
  totalHeapSize: number;
  arrayBuffers: number;
}

const MAX_MB = 512;

function parseMB(str: string): number {
  return parseInt(str);
}

function barColor(pct: number): string {
  if (pct < 60) return "bg-green-500";
  if (pct < 85) return "bg-yellow-500";
  return "bg-red-500";
}

function statusColor(pct: number): string {
  if (pct < 60) return "text-green-500";
  if (pct < 85) return "text-yellow-500";
  return "text-red-500";
}

export default function MemoryMonitor() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHealth = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url.trim(), { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: HealthData = await res.json();
      setData(json);
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setHistory((prev) => {
        const next = [
          ...prev,
          {
            time: now,
            rss: parseMB(json.rss),
            heap: parseMB(json.heap),
            external: parseMB(json.external),
            totalHeapSize: parseMB(json.totalHeapSize),
            arrayBuffers: parseMB(json.arrayBuffers),
          },
        ];
        return next.slice(-30);
      });
    } catch (e: any) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAutoRefresh(false);
    } else {
      fetchHealth();
      intervalRef.current = setInterval(fetchHealth, 5000);
      setAutoRefresh(true);
    }
  };

  const rss = data ? parseMB(data.rss) : 0;
  const rssPct = Math.round((rss / MAX_MB) * 100);

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Memory monitor</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span
              className={`h-2 w-2 rounded-full ${
                loading
                  ? "animate-pulse bg-yellow-400"
                  : error
                    ? "bg-red-500"
                    : data
                      ? "bg-green-500"
                      : "bg-gray-600"
              }`}
            />
            {loading ? "fetching…" : error ? "error" : data ? "ok" : "idle"}
          </div>
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 font-mono text-sm text-gray-200 placeholder-gray-600 focus:border-gray-600 focus:outline-none"
            placeholder="https://your-app.onrender.com/health"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchHealth()}
          />
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            Fetch
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              autoRefresh
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {autoRefresh ? "Stop" : "Auto (5s)"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error} — check the URL or CORS settings
          </p>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "RSS (total)", value: data?.rss, sub: "Render's limit" },
            { label: "Heap used", value: data?.heap, sub: "V8 engine" },
            {
              label: "External",
              value: data?.external,
              sub: "WASM / Stockfish",
            },
            {
              label: "Total heap",
              value: data?.totalHeapSize,
              sub: "Total heap allocated",
            },
            {
              label: "Array buffers",
              value: data?.arrayBuffers,
              sub: "Array buffers size",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-gray-900 p-4">
              <p className="mb-1 text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-medium">{value ?? "—"}</p>
              <p className="mt-1 text-xs text-gray-600">{sub}</p>
            </div>
          ))}
        </div>

        {/* RSS bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>RSS vs 512 MB limit</span>
            <span className={data ? statusColor(rssPct) : "text-gray-600"}>
              {data ? `${rssPct}%` : "—"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor(rssPct)}`}
              style={{ width: `${Math.min(rssPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl bg-gray-900 p-4">
          <p className="mb-4 text-xs text-gray-500">
            RSS over time ({history.length} points)
          </p>
          {history.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-600">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, MAX_MB]}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(v) => `${v}MB`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v ?? 0} MB`] as any}
                />
                <Line
                  type="monotone"
                  dataKey="rss"
                  stroke="#2a78d6"
                  strokeWidth={2}
                  dot={false}
                  name="RSS"
                />
                <Line
                  type="monotone"
                  dataKey="heap"
                  stroke="#1baf7a"
                  strokeWidth={2}
                  dot={false}
                  name="Heap"
                />
                <Line
                  type="monotone"
                  dataKey="external"
                  stroke="#eda100"
                  strokeWidth={2}
                  dot={false}
                  name="External"
                />
                <Line
                  type="monotone"
                  dataKey="totalHeapSize"
                  stroke="#ed003b"
                  strokeWidth={2}
                  dot={false}
                  name="Total Heap Size"
                />
                <Line
                  type="monotone"
                  dataKey="arrayBuffers"
                  stroke="#b600ed"
                  strokeWidth={2}
                  dot={false}
                  name="Array Buffers"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {history.length > 0 && (
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-3 bg-blue-500" />
                RSS
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-3 bg-green-500" />
                Heap
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-3 bg-yellow-500" />
                External (Stockfish)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
