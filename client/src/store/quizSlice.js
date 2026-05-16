import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 璁剧疆axios榛樿閰嶇疆
const api = axios.create({
  baseURL: 'https://mengyatimu-web-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 璇锋眰鎷︽埅鍣?
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 寮傛鑾峰彇棰樼洰
export const getQuestions = createAsyncThunk('quiz/getQuestions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/quizzes')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鐢熸垚棰樼洰
export const generateQuestions = createAsyncThunk('quiz/generate', async (params, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/generate', params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛娣诲姞棰樼洰
export const addQuestion = createAsyncThunk('quiz/add', async (question, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes', question)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鏇存柊棰樼洰
export const updateQuestion = createAsyncThunk('quiz/update', async ({ id, question }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/quizzes/${id}`, question)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鍒犻櫎棰樼洰
export const deleteQuestion = createAsyncThunk('quiz/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/quizzes/${id}`)
    return { id, success: response.data.success }
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鎵归噺鍒犻櫎棰樼洰
export const batchDeleteQuestions = createAsyncThunk('quiz/batchDelete', async (ids, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/batch-delete', { ids })
    return { ids, deletedCount: response.data.deletedCount, success: response.data.success }
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鍚屾棰樼洰
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
    // 鑾峰彇棰樼洰
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
    // 鐢熸垚棰樼洰
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
    // 娣诲姞棰樼洰
    builder
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload.question)
      })
    // 鏇存柊棰樼洰
    builder
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q.id === action.payload.question.id)
        if (index !== -1) {
          state.questions[index] = action.payload.question
        }
      })
    // 鍒犻櫎棰樼洰
    builder
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.questions = state.questions.filter(q => q.id !== action.payload.id)
          state.voices = state.voices.filter(v => v.questionId !== action.payload.id)
        }
      })
    // 鎵归噺鍒犻櫎棰樼洰
    builder
      .addCase(batchDeleteQuestions.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.questions = state.questions.filter(q => !action.payload.ids.includes(q.id))
          state.voices = state.voices.filter(v => !action.payload.ids.includes(v.questionId))
        }
      })
    // 鍚屾棰樼洰
    builder
      .addCase(syncQuestions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(syncQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // 鍚屾鎴愬姛鍚庨噸鏂拌幏鍙栭鐩垪琛?
      })
      .addCase(syncQuestions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
  }
})

export const { clearError } = quizSlice.actions
export default quizSlice.reducer
