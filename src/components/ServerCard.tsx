import { Server, ServerStatus } from '../types';

interface ServerCardProps {
  server: Server;
  status: ServerStatus | undefined;
  isExpanded: boolean;
  onClick: () => void;
}

export function ServerCard({ server, status, isExpanded, onClick }: ServerCardProps) {
  const getStatusColor = () => {
    if (!status) return 'bg-gray-500 dark:bg-gray-700';
    switch (status.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!status) return '未知';
    switch (status.status) {
      case 'online':
        return '在线';
      case 'offline':
        return '离线';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{server.name}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusText()}</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">IP地址</span>
          <span className="text-gray-900 dark:text-gray-200 font-mono">{server.ip}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">端口</span>
          <span className="text-gray-900 dark:text-gray-200 font-mono">{server.port}</span>
        </div>
        {status && status.status === 'online' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">响应时间</span>
            <span className="text-green-600 dark:text-green-400 font-mono">{status.responseTime}ms</span>
          </div>
        )}
        {status && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">上次检查</span>
            <span className="text-gray-700 dark:text-gray-300 text-xs">{formatDate(status.lastChecked)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
