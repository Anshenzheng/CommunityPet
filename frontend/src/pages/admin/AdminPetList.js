import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Row, 
  Col,
  Image,
  Descriptions,
  Popconfirm,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { 
  getAllPets, 
  getBuildings, 
  reviewPet, 
  editPet, 
  cancelPet,
  getImageUrl 
} from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

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

const AdminPetList = () => {
  const [pets, setPets] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ building: '', status: '' });
  
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.building) params.building = filters.building;
      if (filters.status) params.status = filters.status;
      
      const petsResponse = await getAllPets(params);
      if (petsResponse.data.success) {
        setPets(petsResponse.data.pets);
      }

      const buildingsResponse = await getBuildings();
      if (buildingsResponse.data.success) {
        setBuildings(buildingsResponse.data.buildings);
      }
    } catch (error) {
      message.error('获取数据失败');
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setCurrentPet(record);
    setViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentPet(record);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      breed: record.breed,
      gender: record.gender,
      color: record.color,
      vaccine_status: record.vaccine_status,
    });
    if (record.birth_date) {
      form.setFieldsValue({ birth_date: record.birth_date ? record.birth_date : null });
    }
    if (record.vaccine_date) {
      form.setFieldsValue({ vaccine_date: record.vaccine_date ? record.vaccine_date : null });
    }
    setEditModalVisible(true);
  };

  const handleReview = async (petId, status) => {
    try {
      const response = await reviewPet(petId, status);
      if (response.data.success) {
        message.success(status === 'approved' ? '审核通过！' : '已拒绝');
        fetchData();
      }
    } catch (error) {
      message.error('审核失败');
      console.error('Review error:', error);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const petData = {
        name: values.name,
        type: values.type,
        breed: values.breed || '',
        gender: values.gender || '',
        color: values.color || '',
        vaccine_status: values.vaccine_status || '',
      };

      if (values.birth_date) {
        petData.birth_date = values.birth_date.format('YYYY-MM-DD');
      }

      if (values.vaccine_date) {
        petData.vaccine_date = values.vaccine_date.format('YYYY-MM-DD');
      }

      const response = await editPet(currentPet.id, petData);
      if (response.data.success) {
        message.success('编辑成功！');
        setEditModalVisible(false);
        fetchData();
      }
    } catch (error) {
      message.error('编辑失败');
      console.error('Edit error:', error);
    }
  };

  const handleCancel = async (petId) => {
    try {
      const response = await cancelPet(petId);
      if (response.data.success) {
        message.success('已注销备案！');
        fetchData();
      }
    } catch (error) {
      message.error('注销失败');
      console.error('Cancel error:', error);
    }
  };

  const columns = [
    {
      title: '宠物名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => typeMap[type] || type,
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
      width: 100,
    },
    {
      title: '业主信息',
      key: 'owner',
      width: 200,
      render: (_, record) => (
        <div>
          <p style={{ margin: 0, fontWeight: '500' }}>{record.owner_name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            {record.owner_building}栋 {record.owner_unit}单元 {record.owner_room}室
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            {record.owner_phone}
          </p>
        </div>
      ),
    },
    {
      title: '备案状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag className={`status-${status}`} color={statusMap[status]?.color}>
          {statusMap[status]?.text}
        </Tag>
      ),
    },
    {
      title: '备案时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                size="small" 
                icon={<CheckOutlined />}
                style={{ color: '#52C41A' }}
                onClick={() => handleReview(record.id, 'approved')}
              >
                通过
              </Button>
              <Button 
                type="link" 
                size="small" 
                icon={<CloseOutlined />}
                style={{ color: '#FF4D4F' }}
                onClick={() => handleReview(record.id, 'rejected')}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="确定要注销这个宠物备案吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                size="small" 
                icon={<DeleteOutlined />}
                style={{ color: '#FF4D4F' }}
              >
                注销
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#8B5CF6' }}>宠物备案管理</h2>
      
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#faf6f0', borderRadius: '8px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: '8px', fontWeight: '500' }}>楼栋筛选：</span>
            <Select
              style={{ width: 150 }}
              placeholder="全部楼栋"
              allowClear
              value={filters.building || undefined}
              onChange={(value) => setFilters({ ...filters, building: value || '' })}
            >
              {buildings.map((building) => (
                <Option key={building} value={building}>{building}栋</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span style={{ marginRight: '8px', fontWeight: '500' }}>状态筛选：</span>
            <Select
              style={{ width: 120 }}
              placeholder="全部状态"
              allowClear
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="pending">待审核</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="cancelled">已注销</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={fetchData}>
              刷新
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={pets}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50'],
          defaultPageSize: 10,
        }}
      />

      {/* 查看详情模态框 */}
      <Modal
        title="宠物备案详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentPet && (
          <div>
            {currentPet.photo && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Image
                  width={200}
                  height={200}
                  src={getImageUrl(currentPet.photo)}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                  alt={currentPet.name}
                />
              </div>
            )}
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="宠物名称" span={1}>
                {currentPet.name}
              </Descriptions.Item>
              <Descriptions.Item label="类型" span={1}>
                {typeMap[currentPet.type] || currentPet.type}
              </Descriptions.Item>
              <Descriptions.Item label="品种" span={1}>
                {currentPet.breed || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="性别" span={1}>
                {genderMap[currentPet.gender] || currentPet.gender || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="毛色" span={1}>
                {currentPet.color || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="出生日期" span={1}>
                {currentPet.birth_date || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="疫苗情况" span={2}>
                {currentPet.vaccine_status || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最近疫苗日期" span={2}>
                {currentPet.vaccine_date || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备案状态" span={1}>
                <Tag className={`status-${currentPet.status}`} color={statusMap[currentPet.status]?.color}>
                  {statusMap[currentPet.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备案时间" span={1}>
                {currentPet.created_at ? new Date(currentPet.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="业主姓名" span={1}>
                {currentPet.owner_name}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话" span={1}>
                {currentPet.owner_phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="住址" span={2}>
                {currentPet.owner_building}栋 {currentPet.owner_unit}单元 {currentPet.owner_room}室
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 编辑模态框 */}
      <Modal
        title="编辑宠物信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="宠物名称"
                rules={[{ required: true, message: '请输入宠物名称' }]}
              >
                <Input placeholder="请输入宠物名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="宠物类型"
                rules={[{ required: true, message: '请选择宠物类型' }]}
              >
                <Select placeholder="请选择宠物类型">
                  <Option value="dog">狗狗</Option>
                  <Option value="cat">猫咪</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="breed"
                label="品种"
              >
                <Input placeholder="请输入品种" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="性别"
              >
                <Select placeholder="请选择性别">
                  <Option value="male">公</Option>
                  <Option value="female">母</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="birth_date"
                label="出生日期"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="请选择出生日期"
                  picker="date"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="color"
                label="毛色"
              >
                <Input placeholder="请输入毛色" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="vaccine_status"
            label="疫苗情况说明"
          >
            <TextArea 
              rows={3} 
              placeholder="请填写疫苗情况说明"
            />
          </Form.Item>

          <Form.Item
            name="vaccine_date"
            label="最近疫苗接种日期"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="请选择最近疫苗接种日期"
              picker="date"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              style={{ marginRight: '8px' }}
              onClick={() => setEditModalVisible(false)}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPetList;
