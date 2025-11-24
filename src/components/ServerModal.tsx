import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Server, ServerStatus, HistoryPoint } from '../types';

interface ServerModalProps {
  server: Server;
  status: ServerStatus | undefined;
  history: HistoryPoint[];
  onClose: () => void;
}

export function ServerModal({ server, status, history, onClose }: ServerModalProps) {
  // ESC 键关闭模态框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const getStatusColor = () => {
    if (!status) return 'bg-gray-500';
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 准备图表数据
  const chartData = history.slice(-72).map(point => ({
    time: new Date(point.timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    responseTime: point.status === 'online' ? point.responseTime : 0,
    status: point.status,
  }));

  // 计算统计数据
  const onlineCount = history.filter(p => p.status === 'online').length;
  const uptime = history.length > 0 ? ((onlineCount / history.length) * 100).toFixed(2) : '0.00';
  const avgResponseTime = onlineCount > 0
    ? Math.round(history.filter(p => p.status === 'online').reduce((sum, p) => sum + p.responseTime, 0) / onlineCount)
    : 0;
  const maxResponseTime = onlineCount > 0
    ? Math.max(...history.filter(p => p.status === 'online').map(p => p.responseTime))
    : 0;

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{server.name}</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusText()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Server Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP 地址</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{server.ip}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">端口</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{server.port}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">可用性</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">{uptime}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">平均响应</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{avgResponseTime}ms</p>
            </div>
          </div>

          {/* Current Status */}
          {status && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">当前状态</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">响应时间</p>
                  <p className="text-lg font-mono text-green-600 dark:text-green-400">
                    {status.status === 'online' ? `${status.responseTime}ms` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">上次检查</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(status.lastChecked)}</p>
                </div>
              </div>
            </div>
          )}

          {/* History Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">响应时间历史</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                最大: {maxResponseTime}ms
              </p>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis
                    dataKey="time"
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '0.5rem',
                      color: isDark ? '#F3F4F6' : '#111827'
                    }}
                    formatter={(value: number) => {
                      if (value === 0) {
                        return ['离线', '状态'];
                      }
                      return [`${value}ms`, '响应时间'];
                    }}
                  />
                  <ReferenceLine y={avgResponseTime} stroke="#F59E0B" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                暂无历史数据
              </div>
            )}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              橙色虚线为平均响应时间 | 0ms 表示服务器离线
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
