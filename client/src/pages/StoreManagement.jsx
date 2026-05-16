import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Form, Modal, message, Space, Tag, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { getStores, createStore, updateStore, deleteStore } from '../store/storeSlice.js'

const { TextArea } = Input

const StoreManagement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  
  const dispatch = useDispatch()
  const { stores, status } = useSelector(state => state.store)

  // 加载门店列表
  useEffect(() => {
    dispatch(getStores())
  }, [dispatch])

  // 处理添加/编辑门店
  const handleSubmit = (values) => {
    if (editingStore) {
      // 编辑门店
      dispatch(updateStore({ id: editingStore.id, ...values }))
        .unwrap()
        .then(result => {
          if (result.success) {
            message.success('门店更新成功')
            setIsModalVisible(false)
            setEditingStore(null)
            form.resetFields()
            dispatch(getStores()) // 重新获取门店列表
          } else {
            message.error(`更新失败: ${result.message}`)
          }
        })
        .catch(error => {
          message.error(`更新失败: ${error.message}`)
        })
    } else {
      // 添加门店
      dispatch(createStore(values))
        .unwrap()
        .then(result => {
          if (result.success) {
            message.success('门店创建成功')
            setIsModalVisible(false)
            form.resetFields()
            dispatch(getStores()) // 重新获取门店列表
          } else {
            message.error(`创建失败: ${result.message}`)
          }
        })
        .catch(error => {
          message.error(`创建失败: ${error.message}`)
        })
    }
  }

  // 处理删除门店
  const handleDelete = (storeId) => {
    dispatch(deleteStore(storeId))
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success('门店删除成功')
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
      title: '门店名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '门店编号',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
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
              setEditingStore(record)
              form.setFieldsValue(record)
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个门店吗？"
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
        <h1 className="page-header">门店管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingStore(null)
            form.resetFields()
            setIsModalVisible(true)
          }}
        >
          添加门店
        </Button>
      </div>
      
      <div className="page-content">
        <Card title="门店列表">
          <Table
            columns={columns}
            dataSource={stores}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={status === 'loading'}
          />
        </Card>
      </div>

      {/* 添加/编辑门店模态框 */}
      <Modal
        title={editingStore ? "编辑门店" : "添加门店"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingStore(null)
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
            name="name"
            label="门店名称"
            rules={[{ required: true, message: '请输入门店名称' }]}
          >
            <Input placeholder="请输入门店名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="门店编号"
            rules={[{ required: true, message: '请输入门店编号' }]}
          >
            <Input placeholder="请输入门店编号" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <TextArea rows={3} placeholder="请输入地址" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <select style={{ width: '100%', padding: '8px' }}>
              <option value="active">正常</option>
              <option value="inactive">禁用</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default StoreManagement