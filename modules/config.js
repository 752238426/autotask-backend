const express = require('express');
const router = express.Router();

/**
 * Config 模块 - APP 配置管理 (MongoDB 版本)
 * 
 * 集合映射（根据 moduleName）：
 * - global -> globalConfig
 * - xiJuDuanJu -> xiJuDuanJuConfig
 * - hongGuoDuanJu -> hongGuoDuanJuConfig
 * - xiGuaShiPin -> xiJuDuanJuConfig (复用)
 * - douyin -> xiJuDuanJuConfig (复用)
 * - kuaishou -> xiJuDuanJuConfig (复用)
 */

/**
 * 根据 moduleName 获取对应的 MongoDB 集合
 * @param {string} moduleName - 模块名称
 * @param {object} collections - 集合对象
 * @returns {object} MongoDB 集合
 */
function getCollectionByModuleName(moduleName, collections) {
  // 统一转小写处理
  const name = (moduleName || '').toLowerCase();
  
  const collectionMap = {
    'global': collections.globalConfig,
    'xijuduanju': collections.xiJuDuanJuConfig,
    'hongguoduanju': collections.hongGuoDuanJuConfig,
    'xiguashipin': collections.xiJuDuanJuConfig,
    'douyin': collections.xiJuDuanJuConfig,
    'kuaishou': collections.xiJuDuanJuConfig,
    'fanqienovel': collections.xiJuDuanJuConfig,
    'fanqichangting': collections.xiJuDuanJuConfig
  };
  
  return collectionMap[name] || collections.globalConfig;
}

/**
 * POST /api/saveConfig
 * 保存用户配置
 * 
 * 请求体：
 * {
 *   userId: string,       // 用户ID
 *   moduleName: string,   // 模块名称，如 "xiJuDuanJu"
 *   configData: object    // 配置数据
 * }
 */
router.post('/saveConfig', async (req, res) => {
  try {
    const { userId, moduleName, configData } = req.body;
    
    // 兼容旧参数名 platformName
    const module = moduleName || req.body.platformName;
    
    if (!userId || !module) {
      return res.status(400).json({
        success: false,
        message: 'userId 和 moduleName 为必填项'
      });
    }
    
    const collection = getCollectionByModuleName(module, req.collections);
    
    // 查找是否已存在该用户的配置
    const existingConfig = await collection.findOne({ userId });
    
    if (existingConfig) {
      // 更新已有配置
      await collection.updateOne(
        { userId },
        {
          $set: {
            moduleName: module,
            configData: configData || {},
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      res.json({
        success: true,
        message: '配置更新成功'
      });
    } else {
      // 创建新配置
      await collection.insertOne({
        userId,
        moduleName: module,
        configData: configData || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      res.json({
        success: true,
        message: '配置保存成功'
      });
    }
  } catch (error) {
    console.error('saveConfig error:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

/**
 * GET /api/getConfig
 * 获取指定用户某个模块的配置
 * 
 * 查询参数：
 * - moduleName: 模块名称，如 "xiJuDuanJu"
 * - userId: 用户ID
 */
router.get('/getConfig', async (req, res) => {
  try {
    const { moduleName, userId } = req.query;
    
    // 兼容旧参数名 platformName
    const module = moduleName || req.query.platformName;
    
    if (!userId || !module) {
      return res.status(400).json({
        success: false,
        message: 'userId 和 moduleName 为必填项'
      });
    }
    
    const collection = getCollectionByModuleName(module, req.collections);
    
    const config = await collection.findOne({ userId });
    
    if (!config) {
      return res.json({
        success: false,
        message: '未找到该配置'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('getConfig error:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

/**
 * GET /api/getAllConfigs
 * 获取用户所有模块的配置
 * 
 * 查询参数：
 * - userId: 用户ID
 */
router.get('/getAllConfigs', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId 为必填项'
      });
    }
    
    const { collections } = req;
    const configs = [];
    
    // 从所有配置集合中查找
    const globalConfig = await collections.globalConfig.findOne({ userId });
    if (globalConfig) {
      globalConfig.moduleName = 'global';
      configs.push(globalConfig);
    }
    
    const xiJuConfig = await collections.xiJuDuanJuConfig.findOne({ userId });
    if (xiJuConfig) {
      xiJuConfig.moduleName = xiJuConfig.moduleName || 'xiJuDuanJu';
      configs.push(xiJuConfig);
    }
    
    const hongGuoConfig = await collections.hongGuoDuanJuConfig.findOne({ userId });
    if (hongGuoConfig) {
      hongGuoConfig.moduleName = hongGuoConfig.moduleName || 'hongGuoDuanJu';
      configs.push(hongGuoConfig);
    }
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('getAllConfigs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

// ============ 以下为模块内部 API ============

// 获取所有配置（管理用）
router.get('/', async (req, res) => {
  try {
    const { collections } = req;
    
    const globalConfigs = await collections.globalConfig.find({}).toArray();
    const xiJuConfigs = await collections.xiJuDuanJuConfig.find({}).toArray();
    const hongGuoConfigs = await collections.hongGuoDuanJuConfig.find({}).toArray();
    
    const allConfigs = [
      ...globalConfigs,
      ...xiJuConfigs,
      ...hongGuoConfigs
    ];
    
    res.json({ success: true, data: allConfigs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除配置
router.delete('/delete', async (req, res) => {
  try {
    const { moduleName, userId } = req.query;
    
    if (!userId || !moduleName) {
      return res.status(400).json({
        success: false,
        message: 'userId 和 moduleName 为必填项'
      });
    }
    
    const collection = getCollectionByModuleName(moduleName, req.collections);
    const result = await collection.deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.json({
        success: false,
        message: '未找到该配置'
      });
    }
    
    res.json({ success: true, message: '配置删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
