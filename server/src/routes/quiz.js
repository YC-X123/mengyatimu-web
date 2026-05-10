const express = require('express')
const router = express.Router()
const Quiz = require('../models/Quiz')
const authMiddleware = require('../middleware/auth')
const axios = require('axios')

// 模拟题目数据（用于MongoDB连接失败时）
const mockQuestions = [
  {
    _id: '1',
    question: '总部下发的题目1',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correctAnswer: ['A'],
    type: '选择题',
    difficulty: '简单',
    language: '中文',
    target_age: '6-8岁',
    category: '数学',
    voiceUrl: '',
    storeId: '0',
    storeName: '总部',
    isHeadquarters: true,
    createdAt: new Date()
  },
  {
    _id: '2',
    question: '总部下发的题目2',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correctAnswer: ['B'],
    type: '选择题',
    difficulty: '中等',
    language: '中文',
    target_age: '9-12岁',
    category: '语文',
    voiceUrl: '',
    storeId: '0',
    storeName: '总部',
    isHeadquarters: true,
    createdAt: new Date()
  },
  {
    _id: '3',
    question: '北京门店的题目',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correctAnswer: ['C'],
    type: '选择题',
    difficulty: '困难',
    language: '中文',
    target_age: '13-15岁',
    category: '英语',
    voiceUrl: '',
    storeId: '1',
    storeName: '北京门店',
    isHeadquarters: false,
    createdAt: new Date()
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

// 获取题目列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { storeId } = req.user
    
    if (isMongoDBConnected) {
      // 构建查询条件：门店只能看到自己的题目和总部的题目
      const query = {
        $or: [
          { storeId: storeId },
          { isHeadquarters: true }
        ]
      }
      
      const questions = await Quiz.find(query)
      res.json({ success: true, questions })
    } else {
      // 使用模拟数据
      const questions = mockQuestions.filter(q => 
        q.storeId === storeId || q.isHeadquarters === true
      )
      res.json({ success: true, questions })
    }
  } catch (error) {
    console.error('Get questions error:', error)
    // 发生错误时使用模拟数据
    const { storeId } = req.user
    const questions = mockQuestions.filter(q => 
      q.storeId === storeId || q.isHeadquarters === true
    )
    res.json({ success: true, questions })
  }
})

// 创建题目
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { storeId, storeName, role } = req.user
    const { question, options, correctAnswer, type, difficulty, language, target_age, category, voiceUrl, isHeadquarters } = req.body
    
    // 检查权限
    if (isHeadquarters && role !== '超级管理员') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    
    // 验证参数
    if (!question || !options || !correctAnswer) {
      return res.status(400).json({ success: false, message: '题目、选项和正确答案不能为空' })
    }
    
    if (isMongoDBConnected) {
      const quiz = new Quiz({
        question,
        options,
        correctAnswer,
        type,
        difficulty,
        language,
        target_age,
        category,
        voiceUrl,
        storeId,
        storeName,
        isHeadquarters: isHeadquarters || false
      })
      
      await quiz.save()
      res.json({ success: true, message: '题目创建成功' })
    } else {
      // 使用模拟数据
      const newQuestion = {
        _id: Date.now().toString(),
        question,
        options,
        correctAnswer,
        type,
        difficulty,
        language,
        target_age,
        category,
        voiceUrl,
        storeId,
        storeName,
        isHeadquarters: isHeadquarters || false,
        createdAt: new Date()
      }
      mockQuestions.push(newQuestion)
      res.json({ success: true, message: '题目创建成功' })
    }
  } catch (error) {
    console.error('Create quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 批量删除题目
router.post('/batch-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: '请提供要删除的题目ID列表' })
    }
    
    if (isMongoDBConnected) {
      let deletedCount = 0
      
      for (const id of ids) {
        const quiz = await Quiz.findById(id)
        if (quiz) {
          // 检查权限
          if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
            continue
          }
          
          if (quiz.storeId && quiz.storeId.toString() !== req.user.storeId.toString()) {
            continue
          }
          
          await quiz.remove()
          deletedCount++
        }
      }
      
      res.json({ success: true, deletedCount, message: `成功删除${deletedCount}道题目` })
    } else {
      // 使用模拟数据
      let deletedCount = 0
      
      for (const id of ids) {
        const quizIndex = mockQuestions.findIndex(q => q._id === id)
        if (quizIndex !== -1) {
          const quiz = mockQuestions[quizIndex]
          // 检查权限
          if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
            continue
          }
          
          if (quiz.storeId && quiz.storeId !== req.user.storeId) {
            continue
          }
          
          mockQuestions.splice(quizIndex, 1)
          deletedCount++
        }
      }
      
      res.json({ success: true, deletedCount, message: `成功删除${deletedCount}道题目` })
    }
  } catch (error) {
    console.error('Batch delete quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 更新题目
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    if (isMongoDBConnected) {
      const quiz = await Quiz.findById(id)
      if (!quiz) {
        return res.status(404).json({ success: false, message: '题目不存在' })
      }
      
      // 检查权限
      if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      if (quiz.storeId && quiz.storeId.toString() !== req.user.storeId.toString()) {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      Object.assign(quiz, updateData)
      await quiz.save()
      
      res.json({ success: true, message: '题目更新成功' })
    } else {
      // 使用模拟数据
      const quizIndex = mockQuestions.findIndex(q => q._id === id)
      if (quizIndex === -1) {
        return res.status(404).json({ success: false, message: '题目不存在' })
      }
      
      const quiz = mockQuestions[quizIndex]
      // 检查权限
      if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      if (quiz.storeId && quiz.storeId !== req.user.storeId) {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      mockQuestions[quizIndex] = { ...quiz, ...updateData }
      res.json({ success: true, message: '题目更新成功' })
    }
  } catch (error) {
    console.error('Update quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 删除题目
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    if (isMongoDBConnected) {
      const quiz = await Quiz.findById(id)
      if (!quiz) {
        return res.status(404).json({ success: false, message: '题目不存在' })
      }
      
      // 检查权限
      if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      if (quiz.storeId && quiz.storeId.toString() !== req.user.storeId.toString()) {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      await quiz.remove()
      res.json({ success: true, message: '题目删除成功' })
    } else {
      // 使用模拟数据
      const quizIndex = mockQuestions.findIndex(q => q._id === id)
      if (quizIndex === -1) {
        return res.status(404).json({ success: false, message: '题目不存在' })
      }
      
      const quiz = mockQuestions[quizIndex]
      // 检查权限
      if (quiz.isHeadquarters && req.user.role !== '超级管理员') {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      if (quiz.storeId && quiz.storeId !== req.user.storeId) {
        return res.status(403).json({ success: false, message: '权限不足' })
      }
      
      mockQuestions.splice(quizIndex, 1)
      res.json({ success: true, message: '题目删除成功' })
    }
  } catch (error) {
    console.error('Delete quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 同步总部题目
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { storeId, storeName } = req.user
    
    if (isMongoDBConnected) {
      // 获取总部题目
      const headquartersQuestions = await Quiz.find({ isHeadquarters: true })
      
      // 同步到门店
      let syncedCount = 0
      
      for (const HQQuestion of headquartersQuestions) {
        // 检查是否已经同步
        const existingQuestion = await Quiz.findOne({
          question: HQQuestion.question,
          storeId: storeId
        })
        
        if (!existingQuestion) {
          const newQuestion = new Quiz({
            ...HQQuestion.toObject(),
            _id: undefined,
            storeId,
            storeName,
            isHeadquarters: false,
            createdAt: new Date()
          })
          
          await newQuestion.save()
          syncedCount++
        }
      }
      
      res.json({ success: true, syncedCount, message: `成功同步${syncedCount}道题目` })
    } else {
      // 使用模拟数据
      const headquartersQuestions = mockQuestions.filter(q => q.isHeadquarters === true)
      
      // 同步到门店
      let syncedCount = 0
      
      for (const HQQuestion of headquartersQuestions) {
        // 检查是否已经同步
        const existingQuestion = mockQuestions.find(q => 
          q.question === HQQuestion.question && q.storeId === storeId
        )
        
        if (!existingQuestion) {
          const newQuestion = {
            ...HQQuestion,
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            storeId,
            storeName,
            isHeadquarters: false,
            createdAt: new Date()
          }
          
          mockQuestions.push(newQuestion)
          syncedCount++
        }
      }
      
      res.json({ success: true, syncedCount, message: `成功同步${syncedCount}道题目` })
    }
  } catch (error) {
    console.error('Sync quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// AI生成题目
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { storeId, storeName } = req.user
    const { type, difficulty, language, target_age, questionCount, category, requirements, voiceGeneration, voiceType, voiceSpeed, voiceVolume } = req.body
    
    // 验证参数
    if (!type || !difficulty || !category || !questionCount) {
      return res.status(400).json({ success: false, message: '请提供必要的生成参数' })
    }
    
    if (isMongoDBConnected) {
      // 这里可以集成AI模型API
      // 暂时返回模拟数据
      const generatedQuestions = []
      for (let i = 0; i < questionCount; i++) {
        const quiz = new Quiz({
          question: `这是一道${difficulty}的${type}，关于${category}的题目 ${i+1}`,
          options: ['选项A', '选项B', '选项C', '选项D'],
          correctAnswer: ['A'],
          type,
          difficulty,
          language,
          target_age,
          category,
          voiceUrl: voiceGeneration === 'true' ? 'https://example.com/voice.mp3' : '',
          storeId,
          storeName,
          isHeadquarters: false
        })
        
        await quiz.save()
        generatedQuestions.push(quiz)
      }
      
      res.json({ 
        success: true, 
        questions: generatedQuestions,
        generatedVoices: voiceGeneration === 'true' ? generatedQuestions.filter(q => q.voiceUrl) : []
      })
    } else {
      // 使用模拟数据
      const generatedQuestions = []
      for (let i = 0; i < questionCount; i++) {
        const newQuestion = {
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          question: `这是一道${difficulty}的${type}，关于${category}的题目 ${i+1}`,
          options: ['选项A', '选项B', '选项C', '选项D'],
          correctAnswer: ['A'],
          type,
          difficulty,
          language,
          target_age,
          category,
          voiceUrl: voiceGeneration === 'true' ? 'https://example.com/voice.mp3' : '',
          storeId,
          storeName,
          isHeadquarters: false,
          createdAt: new Date()
        }
        generatedQuestions.push(newQuestion)
        mockQuestions.push(newQuestion)
      }
      
      res.json({ 
        success: true, 
        questions: generatedQuestions,
        generatedVoices: voiceGeneration === 'true' ? generatedQuestions.filter(q => q.voiceUrl) : []
      })
    }
  } catch (error) {
    console.error('Generate quiz error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

module.exports = router