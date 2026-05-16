import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Form, Modal, message, Space, Tag, Popconfirm, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers, createUser, updateUser, deleteUser } from '../store/authSlice.js'
import { getStores } from '../store/storeSlice.js'

const { Option } = Select

const UserManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const dispatch = useDispatch()
  const { users, status: usersStatus } = useSelector(state => state.auth)
  const { stores, status: storesStatus } = useSelector(state => state.store)

  // 加载用户和门店列表
  useEffect(() => {
    dispatch(getUsers())
    dispatch(getStores())
  }, [dispatch])

  // 处理添加/编辑用户
  const handleSubmit = (values) => {
    if (editingUser) {
      // 编辑用户
      dispatch(updateUser({ id: editingUser.id, ...values }))
        .unwrap()
        .then(result => {
          if (result.success) {
            message.success('用户更新成功')
            setIsModalVisible(false)
            setEditingUser(null)
            form.resetFields()
          } else {
            message.error(`更新失败: ${result.message}`)
          }
        })
        .catch(error => {
          message.error(`更新失败: ${error.message}`)
        })
    } else {
      // 添加用户
      dispatch(createUser(values))
        .unwrap()
        .then(result => {
          if (result.success) {
            message.success('用户创建成功')
            setIsModalVisible(false)
            form.resetFields()
          } else {
            message.error(`创建失败: ${result.message}`)
          }
        })
        .catch(error => {
          message.error(`创建失败: ${error.message}`)
        })
    }
  }

  // 处理删除用户
  const handleDelete = (userId) => {
    dispatch(deleteUser(userId))
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success('用户删除成功')
        } else {
          message.error(`删除失败: ${result.message}`)
        }
      })
      .catch(error => {
        message.error(`删除失败: ${error.message}`)
      })
  }

  // 列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === '超级管理员' ? 'red' : 'blue'
        return <Tag color={color}>{role}</Tag>
      }
    },
    {
      title: '门店',
      dataIndex: 'storeName',
      key: 'storeName',
      render: (storeName) => storeName || '总部'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'active' ? 'green' : 'red'
        const text = status === 'active' ? '正常' : '禁用'
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingUser(record)
              form.setFieldsValue(record)
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
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
        <h1 className="page-header">用户管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null)
            form.resetFields()
            setIsModalVisible(true)
          }}
        >
          添加用户
        </Button>
      </div>
      
      <div className="page-content">
        <Card title="用户列表">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={usersStatus === 'loading'}
          />
        </Card>
      </div>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        onOk={() => {
          form.validateFields()
            .then(values => {
              handleSubmit(values)
            })
            .catch(info => {
              console.log('验证失败:', info)
            })
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[editingUser ? {} : { required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="超级管理员">超级管理员</Option>
              <Option value="门店管理员">门店管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="storeId"
            label="所属门店"
            rules={[{ required: true, message: '请选择门店' }]}
          >
            <Select placeholder="请选择门店">
              <Option value="0">总部</Option>
              {stores.map(store => (
                <Option key={store.id} value={store.id}>{store.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement