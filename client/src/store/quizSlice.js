import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 设置axios默认配置
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 异步获取题目
export const getQuestions = createAsyncThunk('quiz/getQuestions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/quizzes')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步生成题目
export const generateQuestions = createAsyncThunk('quiz/generate', async (params, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/generate', params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步添加题目
export const addQuestion = createAsyncThunk('quiz/add', async (question, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes', question)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步更新题目
export const updateQuestion = createAsyncThunk('quiz/update', async ({ id, question }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/quizzes/${id}`, question)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步删除题目
export const deleteQuestion = createAsyncThunk('quiz/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/quizzes/${id}`)
    return { id, success: response.data.success }
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步批量删除题目
export const batchDeleteQuestions = createAsyncThunk('quiz/batchDelete', async (ids, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/batch-delete', { ids })
    return { ids, deletedCount: response.data.deletedCount, success: response.data.success }
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步同步题目
export const syncQuestions = createAsyncThunk('quiz/sync', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/sync')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    questions: [],
    voices: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 获取题目
    builder
      .addCase(getQuestions.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.questions = action.payload.questions
        if (action.payload.voices) {
          state.voices = action.payload.voices
        }
      })
      .addCase(getQuestions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
    // 生成题目
    builder
      .addCase(generateQuestions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload.success) {
          state.questions = [...state.questions, ...action.payload.questions]
          if (action.payload.generatedVoices) {
            state.voices = [...state.voices, ...action.payload.generatedVoices]
          }
        } else {
          state.error = action.payload.message
        }
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
    // 添加题目
    builder
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload.question)
      })
    // 更新题目
    builder
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q.id === action.payload.question.id)
        if (index !== -1) {
          state.questions[index] = action.payload.question
        }
      })
    // 删除题目
    builder
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.questions = state.questions.filter(q => q.id !== action.payload.id)
          state.voices = state.voices.filter(v => v.questionId !== action.payload.id)
        }
      })
    // 批量删除题目
    builder
      .addCase(batchDeleteQuestions.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.questions = state.questions.filter(q => !action.payload.ids.includes(q.id))
          state.voices = state.voices.filter(v => !action.payload.ids.includes(v.questionId))
        }
      })
    // 同步题目
    builder
      .addCase(syncQuestions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(syncQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // 同步成功后重新获取题目列表
      })
      .addCase(syncQuestions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
  }
})

export const { clearError } = quizSlice.actions
export default quizSlice.reducer