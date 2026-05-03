import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  PlusOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DownOutlined 
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const OwnerLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/my-pets',
      icon: <HomeOutlined />,
      label: '我的宠物',
      onClick: () => navigate('/my-pets'),
    },
    {
      key: '/add-pet',
      icon: <PlusOutlined />,
      label: '添加宠物',
      onClick: () => navigate('/add-pet'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            {user.building}栋 {user.unit}单元 {user.room}室
          </p>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <div className="logo">
          <HomeOutlined style={{ fontSize: '28px' }} />
          <span>小区宠物备案管理系统</span>
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button 
            type="text" 
            style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Avatar 
              size={36} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#fff', color: '#8B5CF6' }}
            />
            <span>{user.name}</span>
            <DownOutlined />
          </Button>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={220} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderRight: 'none', height: '100%' }}
          />
        </Sider>
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default OwnerLayout;
