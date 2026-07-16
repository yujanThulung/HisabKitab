import { Card, Table, Tag, Button, Tooltip, Typography, Empty } from 'antd';
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSettlementLogs } from './hooks/useSettlementLogs';
import type { SettlementRecord, SettlementTransaction } from '../../api/settlement';

const { Text } = Typography;

// Expandable row — shows the individual payment transactions
const TransactionList = ({ transactions }: { transactions: SettlementTransaction[] }) => {
  if (!transactions?.length) {
    return <Text type="secondary">No transactions recorded.</Text>;
  }

  return (
    <Table
      dataSource={transactions}
      rowKey={(_, idx) => String(idx)}
      pagination={false}
      size="small"
      style={{ margin: '0 48px' }}
      columns={[
        {
          title: 'From',
          dataIndex: 'fromName',
          key: 'fromName',
          render: (name: string) => <Text strong>{name}</Text>,
        },
        {
          title: '',
          key: 'arrow',
          width: 40,
          render: () => <Text type="secondary">→</Text>,
        },
        {
          title: 'To',
          dataIndex: 'toName',
          key: 'toName',
          render: (name: string) => <Text strong>{name}</Text>,
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          align: 'right',
          render: (amount: number) => (
            <Text strong style={{ color: '#ff6b35' }}>
              ₹{amount.toLocaleString()}
            </Text>
          ),
        },
      ]}
    />
  );
};

const columns: ColumnsType<SettlementRecord> = [
  {
    title: '#',
    key: 'index',
    width: 50,
    render: (_: any, __: any, idx: number) => (
      <Text type="secondary">{idx + 1}</Text>
    ),
  },
  {
    title: 'Settled On',
    dataIndex: 'settledAt',
    key: 'settledAt',
    render: (date: string) => (
      <div>
        <div style={{ fontWeight: 600 }}>{dayjs(date).format('MMM DD, YYYY')}</div>
        <div style={{ fontSize: 12, color: '#999' }}>{dayjs(date).format('hh:mm A')}</div>
      </div>
    ),
  },
  {
    title: 'Period',
    key: 'period',
    render: (_: any, record: SettlementRecord) => (
      <Text type="secondary" style={{ fontSize: 13 }}>
        {dayjs(record.periodFrom).format('MMM DD')} → {dayjs(record.periodTo).format('MMM DD, YYYY')}
      </Text>
    ),
  },
  {
    title: 'Total Amount',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    align: 'right',
    render: (amount: number) => (
      <Text strong style={{ color: '#ff6b35', fontSize: 15 }}>
        ₹{amount.toLocaleString()}
      </Text>
    ),
  },
  {
    title: 'Per Person',
    dataIndex: 'perPersonShare',
    key: 'perPersonShare',
    align: 'right',
    render: (amount: number) => (
      <Text>₹{Number(amount).toFixed(2)}</Text>
    ),
  },
  {
    title: 'Payments',
    key: 'txCount',
    align: 'center',
    render: (_: any, record: SettlementRecord) => (
      <Tag color="orange">
        {record.transactions?.length ?? 0} payment{(record.transactions?.length ?? 0) !== 1 ? 's' : ''}
      </Tag>
    ),
  },
  {
    title: 'Status',
    key: 'status',
    align: 'center',
    render: () => (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Settled
      </Tag>
    ),
  },
];

const SettlementLogsPage = () => {
  const { logs, loading, fetchLogs } = useSettlementLogs();

  return (
    <Card
      title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Logs</span>}
      extra={
        <Tooltip title="Refresh">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchLogs}
            loading={loading}
          >
            Refresh
          </Button>
        </Tooltip>
      }
    >
      <Table<SettlementRecord>
        dataSource={logs}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} settlement${total !== 1 ? 's' : ''}`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <TransactionList transactions={record.transactions ?? []} />
          ),
          rowExpandable: (record) => (record.transactions?.length ?? 0) > 0,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No settlements recorded yet."
            />
          ),
        }}
        style={{ marginTop: 8 }}
      />
    </Card>
  );
};

export default SettlementLogsPage;
