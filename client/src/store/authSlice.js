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

// 寮傛鐧诲綍
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛娉ㄥ唽
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 鑾峰彇鐢ㄦ埛鍒楄〃
export const getUsers = createAsyncThunk('auth/getUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/users')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 鍒涘缓鐢ㄦ埛
export const createUser = createAsyncThunk('auth/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 鏇存柊鐢ㄦ埛
export const updateUser = createAsyncThunk('auth/updateUser', async (userData, { rejectWithValue }) => {
  try {
    const { id, ...data } = userData
    const response = await api.put(`/auth/users/${id}`, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 鍒犻櫎鐢ㄦ埛
export const deleteUser = createAsyncThunk('auth/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/auth/users/${userId}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    users: [],
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.users = []
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 鐧诲綍
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
    // 娉ㄥ唽
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
    // 鑾峰彇鐢ㄦ埛鍒楄〃
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
    // 鍒涘缓鐢ㄦ埛
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
    // 鏇存柊鐢ㄦ埛
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
    // 鍒犻櫎鐢ㄦ埛
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer


