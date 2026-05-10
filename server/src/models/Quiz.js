const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  correctAnswer: {
    type: Array,
    required: true
  },
  type: {
    type: String,
    enum: ['单选题', '判断题', '多选题'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['简单', '中等', '困难'],
    required: true
  },
  language: {
    type: String,
    enum: ['中文', '英文'],
    default: '中文'
  },
  target_age: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  voiceUrl: {
    type: String,
    default: ''
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null
  },
  storeName: {
    type: String,
    default: ''
  },
  isHeadquarters: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Quiz', quizSchema)