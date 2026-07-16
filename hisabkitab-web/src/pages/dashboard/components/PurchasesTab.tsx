import { Card, Table, Button, Space, Avatar, Empty, Image } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Expense } from '../../../types/expense';

const getImageUrl = (image?: string): string | undefined => {
  if (!image) return undefined;
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  const base = import.meta.env.VITE_API_URL ?? '';
  return `${base.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
};

interface PurchasesTabProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

const PurchasesTab = ({ expenses, onEdit }: PurchasesTabProps) => {
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) =>
        image ? (
          <Image
            src={getImageUrl(image)}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <span style={{ color: '#bbb' }}>—</span>
        ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Expense, b: Expense) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Person',
      dataIndex: 'userId',
      key: 'person',
      render: (user: Expense['userId']) => (
        <Space>
          <Avatar style={{ backgroundColor: '#ff8c42' }} size="small">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          {user?.name || 'Unknown'}
        </Space>
      ),
    },
    {
      title: 'Item',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '—',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: '#ff6b35', fontWeight: 600, fontSize: '15px' }}>
          ₹{amount.toLocaleString()}
        </span>
      ),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Expense) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
          style={{ color: '#ff8c42' }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>All Purchases</span>}>
      <Table
        columns={columns}
        dataSource={expenses ?? []}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="No purchases yet" /> }}
      />
    </Card>
  );
};

export default PurchasesTab;
