import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await register(values);
      if (response.data.success) {
        message.success('注册成功！请登录');
        navigate('/login');
      } else {
        message.error(response.data.message || '注册失败');
      }
    } catch (error) {
      message.error('注册失败，请稍后重试');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title={
        <div style={{ textAlign: 'center', fontSize: '24px', color: '#8B5CF6' }}>
          <HomeOutlined style={{ marginRight: '12px' }} />
          业主注册
        </div>
      }>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input 
              placeholder="请输入真实姓名"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="building"
                label="楼栋号"
                rules={[{ required: true, message: '请输入楼栋号' }]}
              >
                <Input placeholder="如：1" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单元号"
                rules={[{ required: true, message: '请输入单元号' }]}
              >
                <Input placeholder="如：1" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="room"
                label="房间号"
                rules={[{ required: true, message: '请输入房间号' }]}
              >
                <Input placeholder="如：101" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />}
              placeholder="请输入联系电话"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <span>已有账号？</span>
              <Link to="/login">立即登录</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
