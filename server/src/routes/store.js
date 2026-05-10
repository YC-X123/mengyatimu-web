const express = require('express')
const router = express.Router()
const Store = require('../models/Store')
const authMiddleware = require('../middleware/auth')

// 获取门店列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stores = await Store.find()
    res.json({ success: true, stores })
  } catch (error) {
    console.error('Get stores error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 创建门店
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const { name, code, phone, address, status } = req.body
    
    // 验证参数
    if (!name || !code) {
      return res.status(400).json({ success: false, message: '门店名称和编号不能为空' })
    }
    
    // 检查门店编号是否已存在
    const existingStore = await Store.findOne({ code })
    if (existingStore) {
      return res.status(400).json({ success: false, message: '门店编号已存在' })
    }
    
    const store = new Store({
      name,
      code,
      phone,
      address,
      status: status || 'active'
    })
    
    await store.save()
    res.json({ success: true, message: '门店创建成功' })
  } catch (error) {
    console.error('Create store error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 更新门店
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const { id } = req.params
    const updateData = req.body
    
    const store = await Store.findById(id)
    if (!store) {
      return res.status(404).json({ success: false, message: '门店不存在' })
    }
    
    // 检查门店编号是否已存在（如果更新了编号）
    if (updateData.code && updateData.code !== store.code) {
      const existingStore = await Store.findOne({ code: updateData.code })
      if (existingStore) {
        return res.status(400).json({ success: false, message: '门店编号已存在' })
      }
    }
    
    Object.assign(store, updateData)
    await store.save()
    
    res.json({ success: true, message: '门店更新成功' })
  } catch (error) {
    console.error('Update store error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 删除门店
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    const { id } = req.params
    const store = await Store.findById(id)
    if (!store) {
      return res.status(404).json({ success: false, message: '门店不存在' })
    }
    
    await store.remove()
    res.json({ success: true, message: '门店删除成功' })
  } catch (error) {
    console.error('Delete store error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

module.exports = router