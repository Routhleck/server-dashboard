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

// SSH 连接测试函数
async function checkServer(server) {
  return new Promise((resolve) => {
    const conn = new Client();
    const startTime = Date.now();
    let resolved = false;

    // 设置超时
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.end();
        resolve({
          name: server.name,
          status: 'offline',
          responseTime: 0,
          lastChecked: new Date().toISOString(),
        });
      }
    }, 10000); // 10秒超时

    conn
      .on('ready', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const responseTime = Date.now() - startTime;
          conn.end();
          resolve({
            name: server.name,
            status: 'online',
            responseTime,
            lastChecked: new Date().toISOString(),
          });
        }
      })
      .on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.error(`Error connecting to ${server.name}:`, err.message);
          resolve({
            name: server.name,
            status: 'offline',
            responseTime: 0,
            lastChecked: new Date().toISOString(),
          });
        }
      })
      .connect({
        host: server.ip,
        port: server.port,
        username: sshUsername,
        privateKey,
        readyTimeout: 10000,
      });
  });
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
