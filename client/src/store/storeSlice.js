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

// 异步获取门店列表
export const getStores = createAsyncThunk('store/getStores', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/stores')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步创建门店
export const createStore = createAsyncThunk('store/create', async (storeData, { rejectWithValue }) => {
  try {
    const response = await api.post('/stores', storeData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步更新门店
export const updateStore = createAsyncThunk('store/update', async ({ id, ...storeData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/stores/${id}`, storeData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 异步删除门店
export const deleteStore = createAsyncThunk('store/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/stores/${id}`)
    return { id, success: response.data.success }
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    stores: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 获取门店列表
    builder
      .addCase(getStores.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stores = action.payload.stores
      })
      .addCase(getStores.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
    // 创建门店
    builder
      .addCase(createStore.fulfilled, (state, action) => {
        // 门店创建成功后，会在StoreManagement组件中重新获取列表
      })
    // 更新门店
    builder
      .addCase(updateStore.fulfilled, (state, action) => {
        // 门店更新成功后，会在StoreManagement组件中重新获取列表
      })
    // 删除门店
    builder
      .addCase(deleteStore.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.stores = state.stores.filter(s => s.id !== action.payload.id)
        }
      })
  }
})

export const { clearError } = storeSlice.actions
export default storeSlice.reducer