import { useEffect, useState } from 'react';
import {
  Card, Table, Avatar, Tag, Button, Tooltip, Empty, Typography,
  Modal, Form, Input, Space,
} from 'antd';
import { ReloadOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import api from '../../api/axios';
import { register } from '../../api/auth';
import type { RegisterPayload } from '../../types/auth';

const { Text } = Typography;

interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnsType<AppUser> = [
  {
    title: '#',
    key: 'index',
    width: 50,
    render: (_: any, __: any, idx: number) => (
      <Text type="secondary">{idx + 1}</Text>
    ),
  },
  {
    title: 'User',
    key: 'user',
    render: (_: any, record: AppUser) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar
          style={{ backgroundColor: '#ff8c42', flexShrink: 0 }}
          size={40}
        >
          {record.name.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string) => (
      <Text style={{ fontFamily: 'monospace' }}>{phone}</Text>
    ),
  },
  {
    title: 'Joined',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => (
      <div>
        <div style={{ fontWeight: 500 }}>{dayjs(date).format('MMM DD, YYYY')}</div>
        <div style={{ fontSize: 12, color: '#999' }}>{dayjs(date).format('hh:mm A')}</div>
      </div>
    ),
  },
  {
    title: 'Status',
    key: 'status',
    align: 'center',
    render: () => <Tag color="green">Active</Tag>,
  },
];

const UsersPage = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<RegisterPayload>();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: AppUser[];
      }>('/auth/users');
      setUsers(res.data?.data ?? []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await register(values);
      toast.success(`${values.name} registered successfully`);
      setModalOpen(false);
      fetchUsers(); // refresh list
    } catch (error: any) {
      if (error?.errorFields) return; // form validation error — antd handles display
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card
        title={
          <span style={{ color: '#ff6b35', fontWeight: 600 }}>
            Members ({users.length})
          </span>
        }
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading} />
            </Tooltip>
          </Space>
        }
      >
        {/* Add Member button — right aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={openModal}
            style={{
              background: '#ff6b35',
              border: 'none',
              boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
              fontWeight: 600,
            }}
          >
            Add Member
          </Button>
        </div>

        <Table<AppUser>
          dataSource={users}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} member${total !== 1 ? 's' : ''}`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No members found."
              />
            ),
          }}
        />
      </Card>

      {/* Register modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleRegister}
        title={
          <Space>
            <UserAddOutlined style={{ color: '#ff6b35' }} />
            <span>Add New Member</span>
          </Space>
        }
        okText="Register"
        cancelText="Cancel"
        okButtonProps={{
          loading: submitting,
          style: { background: '#ff6b35', border: 'none' },
        }}
        width={440}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Yujan Rai" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="yujan@example.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="9800000000" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'At least 6 characters' },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm the password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
