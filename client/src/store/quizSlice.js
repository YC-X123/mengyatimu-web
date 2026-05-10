import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'https://mengyatimu-web-production.up.railway.app/api'

export const getQuestions = createAsyncThunk(
  'quiz/getQuestions',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const getQuestionById = createAsyncThunk(
  'quiz/getQuestionById',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const createQuestion = createAsyncThunk(
  'quiz/createQuestion',
  async (questionData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/quiz`, questionData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'quiz/updateQuestion',
  async ({ id, questionData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/quiz/${id}`, questionData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'quiz/deleteQuestion',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const generateQuestion = createAsyncThunk(
  'quiz/generateQuestion',
  async (topic, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/quiz/generate`, { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    questions: [],
    currentQuestion: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.questions = action.payload
      })
      .addCase(getQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getQuestionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getQuestionById.fulfilled, (state, action) => {
        state.loading = false
        state.currentQuestion = action.payload
      })
      .addCase(getQuestionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload)
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload._id)
        if (index !== -1) {
          state.questions[index] = action.payload
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload)
      })
      .addCase(generateQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload)
      })
  }
})

export default quizSlice.reducer
