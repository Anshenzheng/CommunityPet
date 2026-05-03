import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  Button, 
  Card, 
  message,
  Row,
  Col
} from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { addPet, uploadFile } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const disabledDate = (current) => {
  return current && current > Date.now();
};

const AddPet = ({ user }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);

  const handleUploadAndPreview = async (file) => {
    setUploading(true);
    try {
      getBase64(file, (url) => {
        setPhotoPreview(url);
      });
      
      const response = await uploadFile(file);
      if (response.data.success) {
        setUploadedFilename(response.data.filename);
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败');
      }
    } catch (error) {
      message.error('图片上传失败');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
      return false;
    }
    
    handleUploadAndPreview(file);
    
    return false;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const petData = {
        owner_id: user.id,
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

      if (uploadedFilename) {
        petData.photo = uploadedFilename;
      }

      const response = await addPet(petData);
      if (response.data.success) {
        message.success('宠物备案提交成功！');
        navigate('/my-pets');
      } else {
        message.error(response.data.message || '提交失败');
      }
    } catch (error) {
      message.error('提交失败，请稍后重试');
      console.error('Add pet error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传照片</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#8B5CF6' }}>添加宠物备案</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: 'dog' }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="宠物名称"
                rules={[{ required: true, message: '请输入宠物名称' }]}
              >
                <Input placeholder="请输入宠物名称" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="宠物类型"
                rules={[{ required: true, message: '请选择宠物类型' }]}
              >
                <Select size="large" placeholder="请选择宠物类型">
                  <Option value="dog">狗狗</Option>
                  <Option value="cat">猫咪</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="breed"
                label="品种"
              >
                <Input placeholder="请输入品种" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="性别"
              >
                <Select size="large" placeholder="请选择性别">
                  <Option value="male">公</Option>
                  <Option value="female">母</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="birth_date"
                label="出生日期"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  size="large" 
                  placeholder="请选择出生日期"
                  picker="date"
                  disabledDate={disabledDate}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="color"
                label="毛色"
              >
                <Input placeholder="请输入毛色" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="photo"
            label="宠物照片"
          >
            <Upload
              name="photo"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="pet" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="vaccine_status"
            label="疫苗情况说明"
          >
            <TextArea 
              rows={4} 
              placeholder="请填写疫苗情况说明，例如：已接种狂犬疫苗、三联疫苗等"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="vaccine_date"
            label="最近疫苗接种日期"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              size="large" 
              placeholder="请选择最近疫苗接种日期"
              picker="date"
              disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ marginRight: '16px' }}
            >
              提交备案
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/my-pets')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddPet;
