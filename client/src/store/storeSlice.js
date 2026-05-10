import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'https://mengyatimu-web-production.up.railway.app/api'

export const getStores = createAsyncThunk(
  'store/getStores',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/store`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const createStore = createAsyncThunk(
  'store/createStore',
  async (storeData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/store`, storeData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const updateStore = createAsyncThunk(
  'store/updateStore',
  async ({ id, storeData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/store/${id}`, storeData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

export const deleteStore = createAsyncThunk(
  'store/deleteStore',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/store/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message)
    }
  }
)

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    stores: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStores.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false
        state.stores = action.payload
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.stores.push(action.payload)
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        const index = state.stores.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.stores[index] = action.payload
        }
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.stores = state.stores.filter(s => s._id !== action.payload)
      })
  }
})

export default storeSlice.reducer
