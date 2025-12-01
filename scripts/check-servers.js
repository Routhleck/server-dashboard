import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取私钥和用户名
const privateKey = process.env.SSH_PRIVATE_KEY || fs.readFileSync(
  path.join(__dirname, '..', 'admin_recovery_key'),
  'utf8'
);
const sshUsername = process.env.SSH_USERNAME || 'adminuser';

// 读取服务器列表
const servers = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'public', 'data', 'servers.json'),
    'utf8'
  )
);

// 配置参数
const MAX_RETRIES = 3; // 重试次数（总共4次尝试）
const RETRY_DELAY = 5000; // 重试间隔（毫秒）
const CONNECTION_TIMEOUT = 20000; // 单次连接超时（毫秒）

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// SSH 单次连接尝试
async function attemptConnection(server, attemptNum, totalAttempts) {
  return new Promise((resolve) => {
    const conn = new Client();
    const startTime = Date.now();
    let resolved = false;

    console.log(`[${server.name}] 尝试 ${attemptNum}/${totalAttempts}...`);

    // 设置超时
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.end();
        const elapsed = Date.now() - startTime;
        console.log(`[${server.name}] 尝试 ${attemptNum}/${totalAttempts} - 超时 (${elapsed}ms)`);
        resolve({
          success: false,
          reason: 'timeout',
          responseTime: 0,
        });
      }
    }, CONNECTION_TIMEOUT);

    conn
      .on('ready', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const responseTime = Date.now() - startTime;
          conn.end();
          console.log(`[${server.name}] 尝试 ${attemptNum}/${totalAttempts} - 成功! (${responseTime}ms)`);
          resolve({
            success: true,
            responseTime,
          });
        }
      })
      .on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const elapsed = Date.now() - startTime;
          console.log(`[${server.name}] 尝试 ${attemptNum}/${totalAttempts} - 错误: ${err.message} (${elapsed}ms)`);
          resolve({
            success: false,
            reason: err.message,
            responseTime: 0,
          });
        }
      })
      .connect({
        host: server.ip,
        port: server.port,
        username: sshUsername,
        privateKey,
        readyTimeout: CONNECTION_TIMEOUT,
      });
  });
}

// SSH 连接测试函数（带重试）
async function checkServer(server) {
  const totalAttempts = MAX_RETRIES + 1;
  const overallStartTime = Date.now();

  console.log(`\n检查服务器: ${server.name} (${server.ip}:${server.port})`);

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const result = await attemptConnection(server, attempt, totalAttempts);

    // 任意一次成功即认为在线
    if (result.success) {
      const totalTime = Date.now() - overallStartTime;
      console.log(`[${server.name}] ✓ 最终状态: 在线 (总耗时: ${totalTime}ms, 响应时间: ${result.responseTime}ms)\n`);
      return {
        name: server.name,
        status: 'online',
        responseTime: result.responseTime,
        lastChecked: new Date().toISOString(),
      };
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < totalAttempts) {
      console.log(`[${server.name}] 等待 ${RETRY_DELAY/1000} 秒后重试...`);
      await delay(RETRY_DELAY);
    }
  }

  // 所有尝试都失败
  const totalTime = Date.now() - overallStartTime;
  console.log(`[${server.name}] ✗ 最终状态: 离线 (总耗时: ${totalTime}ms, ${totalAttempts} 次尝试全部失败)\n`);
  return {
    name: server.name,
    status: 'offline',
    responseTime: 0,
    lastChecked: new Date().toISOString(),
  };
}

// 主函数
async function main() {
  console.log('Starting server checks...');

  // 检查所有服务器
  const results = await Promise.all(servers.map(checkServer));

  console.log('Check results:', results);

  // 更新 status.json
  const statusData = {
    lastUpdate: new Date().toISOString(),
    servers: results,
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'data', 'status.json'),
    JSON.stringify(statusData, null, 2)
  );

  // 更新 history.json
  let historyData = {};
  const historyPath = path.join(__dirname, '..', 'public', 'data', 'history.json');

  try {
    historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch (err) {
    // 如果文件不存在，初始化历史数据
    historyData = {};
    servers.forEach(server => {
      historyData[server.name] = [];
    });
  }

  // 为每个服务器添加历史记录
  results.forEach(result => {
    if (!historyData[result.name]) {
      historyData[result.name] = [];
    }

    historyData[result.name].push({
      timestamp: result.lastChecked,
      status: result.status,
      responseTime: result.responseTime,
    });

    // 只保留最近7天的数据 (假设每20分钟检查一次，7天约504个数据点)
    const maxPoints = 504;
    if (historyData[result.name].length > maxPoints) {
      historyData[result.name] = historyData[result.name].slice(-maxPoints);
    }
  });

  fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2));

  console.log('Status and history updated successfully!');
}

main().catch(console.error);
