import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  DatePicker,
  Tag,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { expenseApi } from '../../api/expense';
import { CATEGORIES } from '../../types/expense';
import type { Expense, CategoryType } from '../../types/expense';
import { toast } from 'sonner';

const { RangePicker } = DatePicker;

const ExpensePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    type: undefined as 'income' | 'expense' | undefined,
    category: undefined as string | undefined,
    dateRange: undefined as [Dayjs, Dayjs] | undefined
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();

  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pagination.pageSize,
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.dateRange && {
          startDate: filters.dateRange[0].toISOString(),
          endDate: filters.dateRange[1].toISOString()
        })
      };

      const response = await expenseApi.getExpenses(params);
      setExpenses(response.data.expenses);
      setPagination({
        ...pagination,
        current: response.data.pagination?.page || 1,
        total: response.data.pagination?.total || 0
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        date: values.date ? dayjs(values.date).toISOString() : undefined
      };

      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense._id, data);
        toast.success('Expense updated successfully');
      } else {
        await expenseApi.createExpense(data);
        toast.success('Expense created successfully');
      }

      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      fetchExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Expense',
      content: 'Are you sure you want to delete this expense?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await expenseApi.deleteExpense(id);
          toast.success('Expense deleted successfully');
          fetchExpenses();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to delete');
        }
      }
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
    setModalVisible(true);
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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: CategoryType) => {
        const cat = CATEGORIES[category];
        return (
          <Tag color={cat?.color || 'default'}>
            {cat?.icon} {cat?.label || category}
          </Tag>
        );
      },
      filters: Object.entries(CATEGORIES).map(([key, value]) => ({
        text: `${value.icon} ${value.label}`,
        value: key
      })),
      width: 150
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? 'Income' : 'Expense'}
        </Tag>
      ),
      filters: [
        { text: 'Income', value: 'income' },
        { text: 'Expense', value: 'expense' }
      ],
      width: 100
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Expense) => (
        <span style={{ 
          color: record.type === 'income' ? '#52c41a' : '#ff4d4f', 
          fontWeight: 600,
          fontSize: '15px'
        }}>
          {record.type === 'income' ? '+' : '-'}₹{amount.toLocaleString()}
        </span>
      ),
      sorter: true,
      width: 120
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: Expense) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
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

  // Calculate quick stats
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingExpense(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Income"
              value={totalIncome}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Expense"
              value={totalExpense}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Net Balance"
              value={totalIncome - totalExpense}
              precision={2}
              prefix="₹"
              valueStyle={{ color: totalIncome - totalExpense >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ width: '100%' }}
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value.icon} {value.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [Dayjs, Dayjs] | undefined })}
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingExpense ? 'Edit Transaction' : 'Add Transaction'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingExpense(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'expense',
            category: 'other',
            date: dayjs()
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Grocery Shopping" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select size="large">
                  <Select.Option value="income">💰 Income</Select.Option>
                  <Select.Option value="expense">💸 Expense</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  prefix="₹"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category" size="large">
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <Select.Option key={key} value={key}>
                      {value.icon} {value.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="MMM DD, YYYY" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea 
              rows={3} 
              placeholder="Optional description or notes" 
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button size="large" onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" size="large" htmlType="submit">
                {editingExpense ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpensePage;
