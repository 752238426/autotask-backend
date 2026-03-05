const express = require('express');
const router = express.Router();

/**
 * Update 模块 - APP 更新管理 (MongoDB 版本)
 */

// 获取所有更新记录
router.get('/', async (req, res) => {
  try {
    const updates = await req.collections.updates.find({}).toArray();
    res.json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个更新记录
router.get('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const update = await req.collections.updates.findOne({ _id: new ObjectId(req.params.id) });

    if (!update) {
      return res.status(404).json({
        success: false,
        error: 'Update record not found'
      });
    }

    res.json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取指定 APP 的更新记录
router.get('/app/:appId', async (req, res) => {
  try {
    const updates = await req.collections.updates
      .find({ appId: req.params.appId })
      .sort({ versionCode: -1 })
      .toArray();
    res.json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 检查更新
router.post('/check', async (req, res) => {
  try {
    const { appId, currentVersionCode } = req.body;

    if (!appId || currentVersionCode === undefined) {
      return res.status(400).json({
        success: false,
        error: 'appId and currentVersionCode are required'
      });
    }

    // 查找最新版本
    const latestUpdate = await req.collections.updates.findOne(
      { appId, versionCode: { $gt: currentVersionCode } },
      { sort: { versionCode: -1 } }
    );

    if (!latestUpdate) {
      return res.json({
        success: true,
        data: { hasUpdate: false }
      });
    }

    res.json({
      success: true,
      data: {
        hasUpdate: true,
        versionName: latestUpdate.versionName,
        versionCode: latestUpdate.versionCode,
        downloadUrl: latestUpdate.downloadUrl,
        updateLog: latestUpdate.updateLog,
        forceUpdate: latestUpdate.forceUpdate || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发布新版本
router.post('/', async (req, res) => {
  try {
    const { appId, versionName, versionCode, downloadUrl, updateLog, forceUpdate } = req.body;

    if (!appId || !versionName || !versionCode || !downloadUrl) {
      return res.status(400).json({
        success: false,
        error: 'appId, versionName, versionCode and downloadUrl are required'
      });
    }

    const newUpdate = {
      appId,
      versionName,
      versionCode: parseInt(versionCode),
      downloadUrl,
      updateLog: updateLog || '',
      forceUpdate: forceUpdate || false,
      createdAt: new Date().toISOString()
    };

    const result = await req.collections.updates.insertOne(newUpdate);
    newUpdate._id = result.insertedId;

    res.status(201).json({ success: true, data: newUpdate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新版本信息
router.put('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const { versionName, versionCode, downloadUrl, updateLog, forceUpdate } = req.body;
    const id = new ObjectId(req.params.id);

    const update = await req.collections.updates.findOne({ _id: id });

    if (!update) {
      return res.status(404).json({
        success: false,
        error: 'Update record not found'
      });
    }

    const updatedRecord = {
      versionName: versionName || update.versionName,
      versionCode: versionCode !== undefined ? parseInt(versionCode) : update.versionCode,
      downloadUrl: downloadUrl || update.downloadUrl,
      updateLog: updateLog !== undefined ? updateLog : update.updateLog,
      forceUpdate: forceUpdate !== undefined ? forceUpdate : update.forceUpdate,
      updatedAt: new Date().toISOString()
    };

    await req.collections.updates.updateOne({ _id: id }, { $set: updatedRecord });

    res.json({ success: true, data: { ...update, ...updatedRecord } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除更新记录
router.delete('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const id = new ObjectId(req.params.id);
    
    const update = await req.collections.updates.findOne({ _id: id });

    if (!update) {
      return res.status(404).json({
        success: false,
        error: 'Update record not found'
      });
    }

    await req.collections.updates.deleteOne({ _id: id });

    res.json({ success: true, message: 'Update record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
