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

// 寮傛鑾峰彇闂ㄥ簵鍒楄〃
export const getStores = createAsyncThunk('store/getStores', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/stores')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鍒涘缓闂ㄥ簵
export const createStore = createAsyncThunk('store/create', async (storeData, { rejectWithValue }) => {
  try {
    const response = await api.post('/stores', storeData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鏇存柊闂ㄥ簵
export const updateStore = createAsyncThunk('store/update', async ({ id, ...storeData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/stores/${id}`, storeData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

// 寮傛鍒犻櫎闂ㄥ簵
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
    // 鑾峰彇闂ㄥ簵鍒楄〃
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
    // 鍒涘缓闂ㄥ簵
    builder
      .addCase(createStore.fulfilled, (state, action) => {
        // 闂ㄥ簵鍒涘缓鎴愬姛鍚庯紝浼氬湪StoreManagement缁勪欢涓噸鏂拌幏鍙栧垪琛?
      })
    // 鏇存柊闂ㄥ簵
    builder
      .addCase(updateStore.fulfilled, (state, action) => {
        // 闂ㄥ簵鏇存柊鎴愬姛鍚庯紝浼氬湪StoreManagement缁勪欢涓噸鏂拌幏鍙栧垪琛?
      })
    // 鍒犻櫎闂ㄥ簵
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
