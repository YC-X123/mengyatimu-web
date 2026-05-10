import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 设置axios默认配置 - 使用完整的后端URL
const api = axios.create({
  baseURL: 'https://mengyatimu-web-production.up.railway.app/api',
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

// 异步登录
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步注册
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 获取用户列表
export const getUsers = createAsyncThunk('auth/getUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/users')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 创建用户
export const createUser = createAsyncThunk('auth/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 更新用户
export const updateUser = createAsyncThunk('auth/updateUser', async (userData, { rejectWithValue }) => {
  try {
    const { id, ...data } = userData
    const response = await api.put(`/auth/users/${id}`, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 删除用户
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
    // 登录
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
    // 注册
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
    // 获取用户列表
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
    // 创建用户
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
    // 更新用户
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
    // 删除用户
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
