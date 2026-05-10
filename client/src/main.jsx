import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import QuizManagement from './pages/QuizManagement.jsx'
import StoreManagement from './pages/StoreManagement.jsx'
import UserManagement from './pages/UserManagement.jsx'
import AIGeneration from './pages/AIGeneration.jsx'
import authSlice from './store/authSlice.js'
import quizSlice from './store/quizSlice.js'
import storeSlice from './store/storeSlice.js'
import './index.css'

// 配置Redux存储
const store = configureStore({
  reducer: {
    auth: authSlice,
    quiz: quizSlice,
    store: storeSlice
  }
})

// 路由保护组件
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/quiz" />
  }
  
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <App>
                <Routes>
                  <Route path="/quiz" element={<QuizManagement />} />
                  <Route path="/store" element={
                    <ProtectedRoute requiredRole="超级管理员">
                      <StoreManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute requiredRole="超级管理员">
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai" element={<AIGeneration />} />
                  <Route path="/" element={<Navigate to="/quiz" />} />
                </Routes>
              </App>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>,
)