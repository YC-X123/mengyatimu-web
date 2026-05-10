const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// 模拟用户数据（用于MongoDB连接失败时）
const mockUsers = [
  {
    _id: '1',
    username: 'admin',
    password: 'admin123',
    name: '超级管理员',
    phone: '13800138000',
    role: '超级管理员',
    storeId: '0',
    storeName: '总部',
    status: 'active'
  },
  {
    _id: '2',
    username: 'store1',
    password: 'store123',
    name: '门店管理员',
    phone: '13900139000',
    role: '门店管理员',
    storeId: '1',
    storeName: '北京门店',
    status: 'active'
  }
]

// 检查MongoDB连接状态
let isMongoDBConnected = false
try {
  const mongoose = require('mongoose')
  isMongoDBConnected = mongoose.connection.readyState === 1
} catch (error) {
  console.error('MongoDB connection check error:', error)
}

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 验证参数
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }
    
    if (isMongoDBConnected) {
      // 使用真实数据库
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' })
      }
      
      if (user.status !== 'active') {
        return res.status(400).json({ success: false, message: '用户已被禁用' })
      }
      
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ success: false, message: '密码错误' })
      }
      
      const token = jwt.sign(
        { id: user._id, role: user.role, storeId: user.storeId, storeName: user.storeName },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({ 
        success: true, 
        token, 
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          storeName: user.storeName,
          phone: user.phone
        }
      })
    } else {
      // 使用模拟数据
      const user = mockUsers.find(u => u.username === username)
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' })
      }
      
      if (user.status !== 'active') {
        return res.status(400).json({ success: false, message: '用户已被禁用' })
      }
      
      // 验证密码（模拟数据使用明文密码比较）
      if (password !== user.password) {
        return res.status(400).json({ success: false, message: '密码错误' })
      }
      
      const token = jwt.sign(
        { id: user._id, role: user.role, storeId: user.storeId, storeName: user.storeName },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      )
      
      res.json({ 
        success: true, 
        token, 
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          storeName: user.storeName,
          phone: user.phone
        }
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 注册
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { username, password, name, phone, role, storeId, storeName, status } = req.body
    
    // 检查权限
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    // 验证参数
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' })
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // 创建新用户
    const user = new User({
      username,
      password: hashedPassword,
      name,
      phone,
      role,
      storeId,
      storeName,
      status: status || 'active'
    })
    
    await user.save()
    res.json({ success: true, message: '用户创建成功' })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 获取用户列表
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const users = await User.find()
    res.json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 更新用户
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const { id } = req.params
    const { password, ...updateData } = req.body
    
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }
    
    Object.assign(user, updateData)
    await user.save()
    
    res.json({ success: true, message: '用户更新成功' })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 删除用户
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }
    
    await user.remove()
    res.json({ success: true, message: '用户删除成功' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

module.exports = router