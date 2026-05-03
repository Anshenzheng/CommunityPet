import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.username, values.password);
      if (response.data.success) {
        message.success('登录成功！');
        onLogin(response.data.user);
        navigate('/');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title={
        <div style={{ textAlign: 'center', fontSize: '24px', color: '#8B5CF6' }}>
          <HomeOutlined style={{ marginRight: '12px' }} />
          小区宠物备案管理系统
        </div>
      }>
        <Form
          name="login"
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

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <span>还没有账号？</span>
              <Link to="/register">立即注册</Link>
            </Space>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#faf6f0', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>测试账号：</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>管理员：admin / admin123</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>业主：注册新账号即可</p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
