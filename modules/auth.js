const express = require('express');
const router = express.Router();

/**
 * Auth 模块 - 用户认证相关功能 (MongoDB 版本)
 */

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // 检查用户是否已存在
    const existingUser = await req.collections.users.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // 创建新用户
    const newUser = {
      username,
      password, // 实际项目中应该加密存储
      email: email || '',
      createdAt: new Date().toISOString()
    };

    const result = await req.collections.users.insertOne(newUser);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // 查找用户
    const user = await req.collections.users.findOne({ username, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: `token_${user._id}_${Date.now()}` // 简化的 token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户信息
router.get('/user/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const user = await req.collections.users.findOne({ _id: new ObjectId(req.params.id) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有用户
router.get('/users', async (req, res) => {
  try {
    const users = await req.collections.users.find({}).toArray();
    const safeUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));

    res.json({ success: true, data: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
