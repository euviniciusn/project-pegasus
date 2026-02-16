import { useState, useEffect, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchStats } from '../services/adminApi.js';
import formatBytes from '../utils/formatBytes.js';

const REFRESH_INTERVAL = 30000;
const COLORS = ['#3dbff2', '#020f59', '#f8ad63', '#10b981'];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
      <p className="text-xs text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

function FormatChart({ data }) {
  if (!data?.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
      <p className="text-sm font-semibold text-neutral-700 mb-3">Formatos mais usados</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="format" cx="50%" cy="50%" outerRadius={50} strokeWidth={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1">
          {data.map((d, i) => (
            <div key={d.format} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-neutral-600 uppercase">{d.format}</span>
              <span className="text-neutral-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HourlyChart({ data }) {
  if (!data?.length) return null;

  const formatted = data.map((d) => ({
    hour: new Date(d.hour).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    count: d.count,
  }));

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
      <p className="text-sm font-semibold text-neutral-700 mb-3">Conversões por hora (24h)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted}>
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3dbff2" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LoginForm({ onLogin, error, loading }) {
  const [key, setKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim()) onLogin(key.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-bold text-neutral-800 text-center">Admin Dashboard</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin Key"
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
            disabled:opacity-50 transition-all duration-200"
          style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
  const [isAuthed, setIsAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const loadStats = useCallback(async (key) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStats(key);
      setStats(data);
      setIsAuthed(true);
      sessionStorage.setItem('adminKey', key);
      setAdminKey(key);
    } catch (err) {
      setError(err.message);
      setIsAuthed(false);
      sessionStorage.removeItem('adminKey');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) loadStats(adminKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthed || !adminKey) return;
    intervalRef.current = setInterval(() => loadStats(adminKey), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [isAuthed, adminKey, loadStats]);

  if (!isAuthed) {
    return <LoginForm onLogin={loadStats} error={error} loading={loading} />;
  }

  const { conversions, bytes, formats, hourly, errorRate } = stats || {};
  const savings = bytes ? bytes.totalInput - bytes.totalOutput : 0;
  const errorPct = errorRate?.total ? ((errorRate.failed / errorRate.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-neutral-800">Admin Dashboard</h1>
          <span className="text-xs text-neutral-400">Auto-refresh 30s</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Hoje" value={conversions?.today ?? 0} />
          <StatCard label="Semana" value={conversions?.week ?? 0} />
          <StatCard label="Mês" value={conversions?.month ?? 0} />
          <StatCard label="Total" value={conversions?.total ?? 0} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard label="Input total" value={formatBytes(bytes?.totalInput)} />
          <StatCard label="Output total" value={formatBytes(bytes?.totalOutput)} />
          <StatCard label="Economia" value={formatBytes(savings)} sub={savings > 0 ? `${((savings / (bytes?.totalInput || 1)) * 100).toFixed(1)}% menor` : ''} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <StatCard label="Taxa de erro" value={`${errorPct}%`} sub={`${errorRate?.failed ?? 0} de ${errorRate?.total ?? 0} jobs`} />
          <FormatChart data={formats} />
        </div>

        <HourlyChart data={hourly} />
      </div>
    </div>
  );
}
