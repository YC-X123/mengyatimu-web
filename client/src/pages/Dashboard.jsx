import React, { useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, message } from 'antd'
import { BookOutlined, UserOutlined, SettingOutlined, RobotOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { getQuestions } from '../store/quizSlice.js'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { questions, status } = useSelector(state => state.quiz)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    // 加载题目数据
    dispatch(getQuestions())
  }, [dispatch])

  // 统计数据
  const totalQuestions = questions.length
  const storeQuestions = questions.filter(q => q.storeId === user.storeId).length
  const aiGeneratedQuestions = questions.filter(q => q.isAIGenerated).length

  return (
    <div className="page-container">
      <h1 className="page-header">仪表盘</h1>
      <div className="page-content">
        <Row gutter={16}>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic 
                title="总题目数" 
                value={totalQuestions} 
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic 
                title="门店题目数" 
                value={storeQuestions} 
                prefix={<SettingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic 
                title="AI生成题目" 
                value={aiGeneratedQuestions} 
                prefix={<RobotOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic 
                title="用户角色" 
                value={user.role} 
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={12}>
            <Card title="快速操作" className="dashboard-card">
              <Row gutter={16}>
                <Col span={8}>
                  <Button 
                    type="primary" 
                    icon={<BookOutlined />} 
                    block
                    component={Link} to="/quiz"
                  >
                    题库管理
                  </Button>
                </Col>
                <Col span={8}>
                  <Button 
                    type="primary" 
                    icon={<RobotOutlined />} 
                    block
                    component={Link} to="/ai"
                  >
                    AI生成
                  </Button>
                </Col>
                {user.role === '超级管理员' && (
                  <>
                    <Col span={8}>
                      <Button 
                        type="primary" 
                        icon={<UserOutlined />} 
                        block
                        component={Link} to="/users"
                      >
                        用户管理
                      </Button>
                    </Col>
                    <Col span={8} style={{ marginTop: 16 }}>
                      <Button 
                        type="primary" 
                        icon={<SettingOutlined />} 
                        block
                        component={Link} to="/store"
                      >
                        门店管理
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="系统信息" className="dashboard-card">
              <div style={{ lineHeight: '2' }}>
                <p><strong>当前用户:</strong> {user.username}</p>
                <p><strong>所属门店:</strong> {user.storeName}</p>
                <p><strong>用户角色:</strong> {user.role}</p>
                <p><strong>系统状态:</strong> 正常运行</p>
                <p><strong>最新更新:</strong> {new Date().toLocaleString()}</p>
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="最近生成的题目" className="dashboard-card" style={{ marginTop: 20 }}>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {questions.slice(0, 5).map(question => (
              <div key={question.id} style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                <h4>{question.question}</h4>
                <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                  类型: {question.type} | 难度: {question.difficulty} | 生成时间: {new Date(question.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无题目数据
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard