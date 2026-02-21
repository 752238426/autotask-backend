const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

// 导入模块路由
const authModule = require('./modules/auth');
const configModule = require('./modules/config');
const updateModule = require('./modules/update');

// MongoDB 连接配置
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:b4fstr4b@test-db-mongodb.ns-ms8ltdpj.svc:27017';
const DB_NAME = process.env.DB_NAME || 'autotask';

// MongoDB 客户端
let mongoClient;
let db;

// 集合引用
let collections = {};

// 连接 MongoDB
async function connectMongoDB() {
  try {
    mongoClient = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await mongoClient.connect();
    console.log('✅ MongoDB 连接成功');

    db = mongoClient.db(DB_NAME);

    // 初始化集合
    collections = {
      globalConfig: db.collection('globalConfig'),
      xiJuDuanJuConfig: db.collection('xiJuDuanJuConfig'),
      hongGuoDuanJuConfig: db.collection('hongGuoDuanJuConfig'),
      keys: db.collection('keys'),
      users: db.collection('users'),
        updates: db.collection('updates')
    };

    // 创建索引
    await collections.globalConfig.createIndex({ userId: 1 }, { unique: true });
    await collections.xiJuDuanJuConfig.createIndex({ userId: 1 }, { unique: true });
    await collections.hongGuoDuanJuConfig.createIndex({ userId: 1 }, { unique: true });
    await collections.keys.createIndex({ key: 1 }, { unique: true });

    // 初始化测试卡密
    const testKey = await collections.keys.findOne({ key: '123456' });
    if (!testKey) {
      await collections.keys.insertOne({
        key: '123456',
        valid: true,
        createdAt: new Date().toISOString()
      });
      console.log('✅ 测试卡密已初始化');
    }

    console.log('✅ MongoDB 集合初始化完成');
    return true;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    return false;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
// CORS 配置 - 允许所有来源访问，支持 HTTPS
  app.use(cors({
    origin: '*',  // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,  // 支持携带凭证
    optionsSuccessStatus: 200,  // 兼容旧版浏览器
    preflightContinue: false,
    maxAge: 86400  // 预检请求缓存24小时
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 将 db 和 collections 注入到请求中
app.use((req, res, next) => {
  req.db = db;
  req.collections = collections;
  next();
});

// 统一注册模块路由
app.use('/api/auth', authModule);
app.use('/api', configModule);  // config 模块的 API 直接挂载到 /api
app.use('/api/update', updateModule);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'AutoTaskApp API Server',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      verifyKey: 'POST /api/verifyKey',
      saveConfig: 'POST /api/saveConfig',
      getConfig: 'GET /api/getConfig',
      getAllConfigs: 'GET /api/getAllConfigs'
    }
  });
});

// 简单测试路由 - 确认部署成功
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AutoTaskApp API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await db.admin().ping();
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// 卡密验证接口
app.post('/api/verifyKey', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: '请提供卡密'
      });
    }

    const keyRecord = await collections.keys.findOne({ key });

    if (!keyRecord) {
      return res.json({
        success: false,
        message: '卡密不存在'
      });
    }

    if (!keyRecord.valid) {
      return res.json({
        success: false,
        message: '卡密已失效'
      });
    }

    res.json({
      success: true,
      message: '卡密验证成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// 启动服务器
async function startServer() {
  const connected = await connectMongoDB();
  
  if (connected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 http://localhost:${PORT}`);
    });
  } else {
    console.error('❌ 无法启动服务器：MongoDB 连接失败');
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('MongoDB 连接已关闭');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n正在关闭服务器...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('MongoDB 连接已关闭');
  }
  process.exit(0);
});

startServer();

module.exports = app;
