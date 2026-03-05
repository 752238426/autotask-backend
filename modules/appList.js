const express = require('express');
const router = express.Router();

// 初始软件列表
const initialApps = [
    {
        name: "西瓜视频",
        platformKey: "xigua",
        packageName: "com.ss.android.ugc.aweme",
        description: "西瓜视频自动化任务",
        enabled: true,
        actionConfig: {
            signIn: { x: 100, y: 200, enabled: true },
            openBox: { x: 300, y: 400, enabled: true },
            watchVideo: { direction: "UP", distance: 500, count: 10, enabled: true }
        }
    },
    {
        name: "抖音",
        platformKey: "douyin",
        packageName: "com.ss.android.ugc.aweme",
        description: "抖音自动化任务",
        enabled: true,
        actionConfig: {
            signIn: { x: 150, y: 180, enabled: true },
            openBox: { x: 280, y: 420, enabled: false },
            watchVideo: { direction: "UP", distance: 500, count: 10, enabled: true }
        }
    },
    {
        name: "快手极速版",
        platformKey: "kuaishou_speed",
        packageName: "com.kuaishou.nebula",
        description: "快手极速版自动化任务",
        enabled: true,
        actionConfig: {
            signIn: { x: 150, y: 180, enabled: true },
            openBox: { x: 280, y: 420, enabled: true },
            watchVideo: { direction: "LEFT", distance: 500, count: 10, enabled: true }
        }
    },
    {
        name: "UC浏览器极速版",
        platformKey: "uc_browser_speed",
        packageName: "com.uc.browser",
        description: "UC浏览器极速版自动化任务",
        enabled: true,
        actionConfig: {
            signIn: { x: 120, y: 220, enabled: true },
            openBox: { x: 320, y: 380, enabled: true },
            watchVideo: { direction: "RIGHT", distance: 500, count: 10, enabled: true }
        }
    }
];

// 获取软件列表
router.get('/appList', async (req, res) => {
    try {
        const collections = req.collections;

        // 检查是否已有软件列表
        let apps = await collections.appList?.find({}).toArray() || [];

        // 如果没有，初始化默认软件列表
        if (apps.length === 0) {
            await collections.appList.insertMany(initialApps);
            apps = await collections.appList.find({}).toArray();
        }

        res.json({
            success: true,
            apps: apps
        });
    } catch (error) {
        console.error('获取软件列表失败:', error);
        res.json({
            success: false,
            message: '获取软件列表失败: ' + error.message
        });
    }
});

// 获取软件配置
router.get('/appConfig', async (req, res) => {
    try {
        const { platformKey } = req.query;
        const collections = req.collections;

        const app = await collections.appList.findOne({ platformKey });

        if (!app) {
            return res.json({
                success: false,
                message: '软件不存在'
            });
        }

        res.json({
            success: true,
            config: app
        });
    } catch (error) {
        console.error('获取软件配置失败:', error);
        res.json({
            success: false,
            message: '获取软件配置失败: ' + error.message
        });
    }
});

// 添加新软件（管理员）
router.post('/addApp', async (req, res) => {
    try {
        const { name, platformKey, packageName, description, actionConfig } = req.body;
        const collections = req.collections;

        // 检查是否已存在
        const existing = await collections.appList.findOne({ platformKey });
        if (existing) {
            return res.json({
                success: false,
                message: '软件已存在'
            });
        }

        // 添加新软件
        await collections.appList.insertOne({
            name,
            platformKey,
            packageName,
            description: description || '',
            enabled: true,
            actionConfig: actionConfig || {},
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: '软件添加成功'
        });
    } catch (error) {
        console.error('添加软件失败:', error);
        res.json({
            success: false,
            message: '添加软件失败: ' + error.message
        });
    }
});

module.exports = router;
