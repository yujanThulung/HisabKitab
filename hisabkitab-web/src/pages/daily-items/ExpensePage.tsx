import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { expenseApi } from '../../api/expense';
import type { Expense } from '../../types/expense';
import { toast } from 'sonner';
import ExpenseFormModal from '../dashboard/components/ExpenseFormModal';
import type { ExpenseFormValues } from '../dashboard/components/ExpenseFormModal';
import { Form } from 'antd';
import { getErrorMessage } from '../../utils/error';

const { RangePicker } = DatePicker;

const ExpensePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm<ExpenseFormValues>();

  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        from?: string;
        to?: string;
      } = {
        page,
        limit: pagination.pageSize,
        ...(dateRange && {
          from: dateRange[0].toISOString(),
          to: dateRange[1].toISOString()
        })
      };

      const response = await expenseApi.getExpenses(params);
      setExpenses(response.data.items);
      setGrandTotal(response.data.summary?.grandTotal ?? 0);
      setPagination({
        ...pagination,
        current: response.data.pagination?.page || 1,
        total: response.data.pagination?.total || 0
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch expenses'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpenses();
  }, [dateRange]);

  const handleDelete = async (id: string) => {
    try {
      await expenseApi.deleteExpense(id);
      toast.success('Expense deleted successfully');
      fetchExpenses(pagination.current);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete'));
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      title: expense.title,
      amount: expense.amount,
      note: expense.note,
      date: dayjs(expense.date),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
    form.resetFields();
  };

  const handleFormSuccess = () => {
    closeModal();
    fetchExpenses(pagination.current);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
      width: 120
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, fontSize: '15px' }}>
          ₹{amount.toLocaleString()}
        </span>
      ),
      sorter: true,
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: unknown, record: Expense) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openAddModal}
        >
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Spent"
              value={grandTotal}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ff6b35' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Transactions"
              value={pagination.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | undefined)}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transactions`,
            onChange: (page) => fetchExpenses(page)
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <ExpenseFormModal
        open={modalVisible}
        editingExpense={editingExpense}
        form={form}
        onSuccess={handleFormSuccess}
        onClose={closeModal}
      />
    </div>
  );
};

export default ExpensePage;
