import { useEffect, useState } from 'react';
import { ServerCard } from './components/ServerCard';
import { ServerModal } from './components/ServerModal';
import { Server, StatusData, HistoryData } from './types';

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  // 检测系统主题
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 初始设置
    if (darkModeQuery.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 监听主题变化
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);

      const [serversRes, statusRes, historyRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}data/servers.json`),
        fetch(`${import.meta.env.BASE_URL}data/status.json`),
        fetch(`${import.meta.env.BASE_URL}data/history.json`),
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

  // 获取选中的服务器信息
  const selectedServerData = selectedServer ? servers.find(s => s.name === selectedServer) : null;
  const selectedServerStatus = selectedServer ? statusData?.servers.find(s => s.name === selectedServer) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-gray-900 dark:text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-red-500 text-xl">错误: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">服务器状态监控</h1>
          <p className="text-gray-600 dark:text-gray-400">
            上次更新: {statusData ? formatDate(statusData.lastUpdate) : 'N/A'}
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">服务器状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => {
              const status = statusData?.servers.find(s => s.name === server.name);

              return (
                <ServerCard
                  key={server.name}
                  server={server}
                  status={status}
                  onClick={() => setSelectedServer(server.name)}
                />
              );
            })}
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>数据每小时更新一次 | 页面每5分钟自动刷新 | 点击服务器卡片查看详情</p>
        </footer>
      </div>

      {/* Modal */}
      {selectedServer && selectedServerData && (
        <ServerModal
          server={selectedServerData}
          status={selectedServerStatus}
          history={historyData[selectedServer] || []}
          onClose={() => setSelectedServer(null)}
        />
      )}
    </div>
  );
}

export default App;
