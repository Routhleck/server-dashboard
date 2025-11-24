import { useEffect, useState } from 'react';
import { ServerCard } from './components/ServerCard';
import { HistoryChart } from './components/HistoryChart';
import { Server, StatusData, HistoryData } from './types';

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);

      const [serversRes, statusRes, historyRes] = await Promise.all([
        fetch('/server-dashboard/data/servers.json'),
        fetch('/server-dashboard/data/status.json'),
        fetch('/server-dashboard/data/history.json'),
      ]);

      if (!serversRes.ok || !statusRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const serversData = await serversRes.json();
      const statusDataRes = await statusRes.json();
      const historyDataRes = await historyRes.json();

      setServers(serversData);
      setStatusData(statusDataRes);
      setHistoryData(historyDataRes);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 每5分钟刷新一次数据
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">错误: {error}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">服务器状态监控</h1>
          <p className="text-gray-400">
            上次更新: {statusData ? formatDate(statusData.lastUpdate) : 'N/A'}
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">服务器状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => {
              const status = statusData?.servers.find(s => s.name === server.name);
              return <ServerCard key={server.name} server={server} status={status} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">历史数据</h2>
          <div className="grid grid-cols-1 gap-6">
            {servers.map((server) => (
              <HistoryChart
                key={server.name}
                serverName={server.name}
                history={historyData[server.name] || []}
              />
            ))}
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>数据每20分钟更新一次 | 页面每5分钟自动刷新</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
