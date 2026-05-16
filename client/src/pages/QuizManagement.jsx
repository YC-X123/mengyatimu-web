import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Select, message, Modal, Form, Radio, Space, Typography, Tag, Popconfirm, Checkbox } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AudioOutlined, DownloadOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { getQuestions, deleteQuestion, syncQuestions, batchDeleteQuestions } from '../store/quizSlice.js'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

const QuizManagement = () => {
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [previewQuestion, setPreviewQuestion] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  
  const dispatch = useDispatch()
  const { questions, status } = useSelector(state => state.quiz)
  const { user } = useSelector(state => state.auth)

  // 加载题目列表
  useEffect(() => {
    dispatch(getQuestions())
  }, [dispatch])

  // 同步题目
  const handleSyncQuestions = () => {
    dispatch(syncQuestions())
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success(`成功同步${result.syncedCount}道题目`)
          // 同步成功后重新获取题目列表
          dispatch(getQuestions())
        } else {
          message.error(`同步失败: ${result.message}`)
        }
      })
      .catch(error => {
        message.error(`同步失败: ${error.message}`)
      })
  }

  // 播放语音
  const playVoice = (voiceUrl) => {
    if (!voiceUrl) {
      message.warning('该题目没有配音')
      return
    }
    
    const audio = new Audio(voiceUrl)
    audio.play().catch(error => {
      message.error('播放失败: ' + error.message)
    })
  }

  // 下载语音
  const downloadVoice = (voiceUrl, questionId) => {
    if (!voiceUrl) {
      message.warning('该题目没有配音')
      return
    }
    
    fetch(voiceUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `question_${questionId}_voice.mp3`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        message.success('语音下载成功')
      })
      .catch(error => {
        message.error('下载失败: ' + error.message)
      })
  }

  // 删除题目
  const handleDelete = (questionId) => {
    dispatch(deleteQuestion(questionId))
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success('题目删除成功')
        } else {
          message.error(`删除失败: ${result.message}`)
        }
      })
      .catch(error => {
        message.error(`删除失败: ${error.message}`)
      })
  }

  // 批量删除题目
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的题目')
      return
    }
    
    dispatch(batchDeleteQuestions(selectedRowKeys))
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success(`成功删除${result.deletedCount}道题目`)
          setSelectedRowKeys([])
        } else {
          message.error(`删除失败: ${result.message}`)
        }
      })
      .catch(error => {
        message.error(`删除失败: ${error.message}`)
      })
  }

  // 预览题目
  const handlePreview = (question) => {
    setPreviewQuestion(question)
    setPreviewModalVisible(true)
  }

  // 过滤题目
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !category || question.category === category
    return matchesSearch && matchesCategory
  })

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  }

  // 列定义
  const columns = [
    {
      title: '题目',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (text) => <Text ellipsis={{ rows: 2 }}>{text}</Text>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const color = type === '单选题' ? 'blue' : type === '多选题' ? 'green' : 'orange'
        return <Tag color={color}>{type}</Tag>
      }
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => {
        const color = difficulty === '简单' ? 'green' : difficulty === '中等' ? 'blue' : 'red'
        return <Tag color={color}>{difficulty}</Tag>
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '配音',
      key: 'voice',
      render: (_, record) => (
        <Space>
          <Button
            icon={<AudioOutlined />}
            size="small"
            onClick={() => playVoice(record.voiceUrl)}
            disabled={!record.voiceUrl}
          />
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => downloadVoice(record.voiceUrl, record.id)}
            disabled={!record.voiceUrl}
          />
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingQuestion(record)
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个题目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-header">题库管理</h1>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          )}
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleSyncQuestions}
          >
            同步总部题目
          </Button>
        </Space>
      </div>
      
      <div className="page-content">
        {/* 搜索栏 */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Input
              placeholder="搜索题目"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="按分类筛选"
              style={{ width: 200 }}
              value={category}
              onChange={setCategory}
              allowClear
            >
              {[...new Set(questions.map(q => q.category))].map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>
        </Card>

        {/* 题目列表 */}
        <Card title="题目列表">
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredQuestions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={status === 'loading'}
          />
        </Card>
      </div>

      {/* 编辑题目模态框 */}
      <Modal
        title={editingQuestion ? "编辑题目" : "添加题目"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingQuestion(null)
          form.resetFields()
        }}
        onOk={() => {
          form.validateFields()
            .then(values => {
              // 这里可以添加编辑逻辑
              message.success('题目更新成功')
              setIsModalVisible(false)
              setEditingQuestion(null)
              form.resetFields()
            })
            .catch(info => {
              console.log('验证失败:', info)
            })
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingQuestion}
        >
          <Form.Item
            name="question"
            label="题目"
            rules={[{ required: true, message: '请输入题目' }]}
          >
            <TextArea rows={3} placeholder="请输入题目" />
          </Form.Item>
          <Form.Item
            name="type"
            label="题目类型"
            rules={[{ required: true, message: '请选择题目类型' }]}
          >
            <Select>
              <Option value="单选题">单选题</Option>
              <Option value="判断题">判断题</Option>
              <Option value="多选题">多选题</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="difficulty"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select>
              <Option value="简单">简单</Option>
              <Option value="中等">中等</Option>
              <Option value="困难">困难</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="请输入分类" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 题目预览模态框 */}
      <Modal
        title="题目预览"
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false)
          setPreviewQuestion(null)
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {previewQuestion && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3>题目内容</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{previewQuestion.question}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3>选项</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {previewQuestion.options.map((option, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    <Checkbox 
                      checked={previewQuestion.correctAnswer.includes(String.fromCharCode(65 + index))}
                      disabled
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3>题目信息</h3>
              <p>类型：{previewQuestion.type}</p>
              <p>难度：{previewQuestion.difficulty}</p>
              <p>分类：{previewQuestion.category}</p>
              <p>门店：{previewQuestion.storeName}</p>
              {previewQuestion.voiceUrl && (
                <div style={{ marginTop: 10 }}>
                  <Button
                    icon={<AudioOutlined />}
                    onClick={() => playVoice(previewQuestion.voiceUrl)}
                  >
                    播放配音
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default QuizManagement