import React, { useState } from 'react'
import { Card, Button, Form, Input, Select, Radio, Row, Col, message, Spin } from 'antd'
import { RobotOutlined, AudioOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { generateQuestions } from '../store/quizSlice.js'

const { Option } = Select
const { TextArea } = Input

const AIGeneration = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const { status } = useSelector(state => state.quiz)
  const { user } = useSelector(state => state.auth)

  // 处理AI生成题目
  const handleGenerate = (values) => {
    // 添加门店信息
    const generateParams = {
      ...values,
      storeId: user.storeId,
      storeName: user.storeName,
      userId: user.id
    }

    dispatch(generateQuestions(generateParams))
      .unwrap()
      .then(result => {
        if (result.success) {
          message.success(`成功生成${result.questions.length}道题目`)
          if (result.generatedVoices && result.generatedVoices.length > 0) {
            message.success(`同时生成${result.generatedVoices.length}个配音`)
          }
          form.resetFields()
        } else {
          message.error(`生成失败: ${result.message}`)
        }
      })
      .catch(error => {
        message.error(`生成失败: ${error.message}`)
      })
  }

  return (
    <div className="page-container">
      <h1 className="page-header">AI题目生成</h1>
      <div className="page-content">
        <Card title={<div><RobotOutlined /> AI智能题目生成</div>}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              type: '单选题',
              difficulty: '简单',
              language: '中文',
              target_age: 18,
              questionCount: 10,
              category: '物理',
              requirements: '生成一道简单的题目',
              correctAnswer: ['A'],
              voiceGeneration: 'false',
              voiceType: 'zh_female_qingxin',
              voiceSpeed: 1.0,
              voiceVolume: 1.0
            }}
            onFinish={handleGenerate}
          >
            {/* 基本设置 */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ marginBottom: 16, fontSize: '16px', fontWeight: 'bold' }}>基本设置</h3>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={6}>
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
                </Col>
                <Col xs={12} sm={8} md={6}>
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
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Form.Item
                    name="language"
                    label="语言"
                  >
                    <Select>
                      <Option value="中文">中文</Option>
                      <Option value="英文">英文</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Form.Item
                    name="target_age"
                    label="目标年龄"
                    rules={[{ required: true, message: '请输入目标年龄' }]}
                  >
                    <Input type="number" min="8" max="60" placeholder="请输入目标年龄" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Form.Item
                    name="category"
                    label="分类"
                    rules={[{ required: true, message: '请输入分类' }]}
                  >
                    <Input placeholder="例如：物理、电子" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Form.Item
                    name="questionCount"
                    label="题目数量"
                    rules={[{ required: true, message: '请输入题目数量' }]}
                  >
                    <Input type="number" min="1" max="50" placeholder="请输入题目数量" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24}>
                  <Form.Item
                    name="requirements"
                    label="生成需求"
                    rules={[{ required: true, message: '请输入生成需求' }]}
                  >
                    <TextArea rows={3} placeholder="请输入AI生成题目的具体需求，例如：围绕电磁锁的工作原理生成题目，包含实际应用场景" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* 答案设置 */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ marginBottom: 16, fontSize: '16px', fontWeight: 'bold' }}>答案设置</h3>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={12} md={12}>
                  <Form.Item
                    name="correctAnswer"
                    label="正确答案"
                    rules={[{ required: true, message: '请选择正确答案' }]}
                  >
                    <Select
                      placeholder="选择正确答案"
                      mode="multiple"
                      maxTagCount={4}
                    >
                      <Option value="A">A</Option>
                      <Option value="B">B</Option>
                      <Option value="C">C</Option>
                      <Option value="D">D</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* 语音生成设置 */}
              <Form.Item
                name="voiceGeneration"
                label="生成配音"
              >
                <Radio.Group>
                  <Radio value="true">是</Radio>
                  <Radio value="false">否</Radio>
                </Radio.Group>
              </Form.Item>

              {/* 语音配置 */}
              <div style={{ marginLeft: 16 }}>
                <Form.Item label="语音配置">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={8}>
                      <Form.Item
                        name="voiceType"
                        label="语音类型"
                        noStyle
                      >
                        <Select defaultValue="zh_female_qingxin">
                          <Option value="zh_female_qingxin">中文女声-清新</Option>
                          <Option value="zh_male_zhubo">中文男声-主播</Option>
                          <Option value="zh_female_jingjing">中文女声-晶晶</Option>
                          <Option value="zh_male_chengcheng">中文男声-成成</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={8} md={8}>
                      <Form.Item
                        name="voiceSpeed"
                        label="语速"
                        noStyle
                      >
                        <Input type="number" min="0.5" max="2" step="0.1" defaultValue={1.0} placeholder="0.5-2.0" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={8} md={8}>
                      <Form.Item
                        name="voiceVolume"
                        label="音量"
                        noStyle
                      >
                        <Input type="number" min="0.1" max="2" step="0.1" defaultValue={1.0} placeholder="0.1-2.0" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </div>
            </div>

            {/* 生成按钮 */}
            <Form.Item>
              <Button 
                type="primary" 
                icon={<RobotOutlined />}
                size="large"
                loading={status === 'loading'}
                htmlType="submit"
                style={{ width: '100%' }}
              >
                开始生成题目
              </Button>
            </Form.Item>

            {/* 说明 */}
            <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f6ffed', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
              <h4 style={{ marginBottom: 12, color: '#52c41a' }}>使用说明</h4>
              <ul style={{ color: '#52c41a', lineHeight: '1.8' }}>
                <li>1. 单选题：请选择一个正确答案</li>
                <li>2. 多选题：请选择多个正确答案</li>
                <li>3. 判断题：请选择A（正确）或B（错误）</li>
                <li>4. 配音生成：勾选后会为每个题目生成朗诵配音</li>
                <li>5. 生成需求：请详细描述题目内容要求，以获得更准确的结果</li>
              </ul>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default AIGeneration