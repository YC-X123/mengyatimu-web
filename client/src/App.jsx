import React from 'react'
import { Layout, Menu, theme, Button, Avatar, Dropdown } from 'antd'
import { 
  DashboardOutlined, 
  BookOutlined, 
  UserOutlined, 
  SettingOutlined, 
  RobotOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from './store/authSlice.js'

const { Header, Content, Sider } = Layout

const App = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false)
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { 
    token: { colorBgContainer, borderRadiusLG }, 
  } = theme.useToken()

  // 处理 logout
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // 用户菜单
  const userMenu = [
    {
      key: 'profile',
      label: '个人资料'
    },
    {
      key: 'logout',
      label: (
        <a onClick={handleLogout} style={{ color: '#ff4d4f' }}>
          <LogoutOutlined /> 退出登录
        </a>
      )
    }
  ]

  // 导航菜单
  const menuItems = [
    { key: 'quiz', icon: <BookOutlined />, label: <Link to="/quiz">题库管理</Link> },
    { key: 'ai', icon: <RobotOutlined />, label: <Link to="/ai">AI生成</Link> }
  ]

  // 管理员菜单
  if (user && user.role === '超级管理员') {
    menuItems.push(
      { key: 'users', icon: <UserOutlined />, label: <Link to="/users">用户管理</Link> },
      { key: 'store', icon: <SettingOutlined />, label: <Link to="/store">门店管理</Link> }
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'AI题库' : 'AI题目生成系统'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 20px', 
          background: colorBgContainer,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {isAuthenticated && user && (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar style={{ marginRight: 8 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                <span>{user.username} ({user.role})</span>
              </div>
            </Dropdown>
          )}
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App