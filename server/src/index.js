const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// 加载环境变量
dotenv.config()

// 导入路由
const authRoutes = require('./routes/auth')
const storeRoutes = require('./routes/store')
const quizRoutes = require('./routes/quiz')

const app = express()
const PORT = process.env.PORT || 5000

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/quizzes', quizRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 连接数据库
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully')
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
.catch((error) => {
  console.error('MongoDB connection error:', error)
  console.error('请确保MongoDB服务已启动，并且连接字符串正确')
  console.log('使用的连接字符串:', process.env.MONGO_URI)
  // 即使数据库连接失败，也启动服务器（用于开发测试）
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (数据库连接失败)`)
  })
})
