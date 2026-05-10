import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import quizReducer from './quizSlice'
import storeReducer from './storeSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    store: storeReducer
  }
})
