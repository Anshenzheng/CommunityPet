import React, { useState, useEffect } from 'react';
import { Card, Tag, Empty, Descriptions, Image, Row, Col, Spin, message } from 'antd';
import { getOwnerPets, getImageUrl } from '../../services/api';

const statusMap = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  cancelled: { text: '已注销', color: 'default' },
};

const typeMap = {
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
};

const genderMap = {
  male: '公',
  female: '母',
};

const PetList = ({ user }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, [user.id]);

  const fetchPets = async () => {
    try {
      const response = await getOwnerPets(user.id);
      if (response.data.success) {
        setPets(response.data.pets);
      }
    } catch (error) {
      message.error('获取宠物列表失败');
      console.error('Fetch pets error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <Card title="我的宠物">
        <Empty 
          description="您还没有添加宠物信息"
          style={{ padding: '60px 0' }}
        />
      </Card>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#8B5CF6' }}>我的宠物备案</h2>
      <Row gutter={[24, 24]}>
        {pets.map((pet) => (
          <Col xs={24} md={12} lg={8} key={pet.id}>
            <Card 
              className="pet-card"
              hoverable
              cover={
                pet.photo ? (
                  <div style={{ 
                    height: '200px', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#faf6f0'
                  }}>
                    <Image
                      width="100%"
                      height={200}
                      src={getImageUrl(pet.photo)}
                      style={{ objectFit: 'cover' }}
                      alt={pet.name}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#faf6f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#d9d9d9'
                  }}>
                    🐾
                  </div>
                )
              }
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{pet.name}</span>
                    <Tag 
                      className={`status-${pet.status}`}
                      color={statusMap[pet.status]?.color}
                    >
                      {statusMap[pet.status]?.text}
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ marginTop: '12px' }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="类型">
                        {typeMap[pet.type] || pet.type}
                      </Descriptions.Item>
                      <Descriptions.Item label="品种">
                        {pet.breed || '未知'}
                      </Descriptions.Item>
                      <Descriptions.Item label="性别">
                        {genderMap[pet.gender] || pet.gender || '未知'}
                      </Descriptions.Item>
                      <Descriptions.Item label="毛色">
                        {pet.color || '未知'}
                      </Descriptions.Item>
                      <Descriptions.Item label="疫苗情况">
                        {pet.vaccine_status || '未填写'}
                      </Descriptions.Item>
                      <Descriptions.Item label="备案时间">
                        {pet.created_at ? new Date(pet.created_at).toLocaleDateString('zh-CN') : '未知'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PetList;
