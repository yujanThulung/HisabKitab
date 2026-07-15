import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Spin, Empty } from 'antd';
import { 
  DollarOutlined, 
  RiseOutlined, 
  FallOutlined, 
  WalletOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Column, Pie } from '@ant-design/plots';
import { expenseApi } from '../../api/expense';
import { CATEGORIES } from '../../types/expense';
import type { Expense, ExpenseStats, CategoryType } from '../../types/expense';
import { toast } from 'sonner';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  console.log('=== Dashboard Component Rendering ===');
  
  const [stats, setStats] = useState<ExpenseStats>({
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0
    },
    categoryBreakdown: [],
    monthlyTrend: [],
    recentTransactions: [],
    userSpending: []
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = async () => {
    console.log('Fetching data...', { dateRange });
    setLoading(true);
    try {
      const [statsRes, expensesRes] = await Promise.all([
        expenseApi.getStatistics({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        }),
        expenseApi.getExpenses({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          limit: 100
        })
      ]);
      
      setStats(statsRes.data);
      setExpenses(expensesRes.data.expenses);
      console.log('Data fetched successfully', { stats: statsRes.data, expenses: expensesRes.data.expenses });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      // Set empty state on error so dashboard still renders
      setStats({
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          transactionCount: 0
        },
        categoryBreakdown: [],
        monthlyTrend: [],
        recentTransactions: [],
        userSpending: []
      });
      setExpenses([]);
      
      // Show error message
      if (error.response?.status === 404) {
        toast.info('No data available yet. Start by adding your first transaction!');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch data. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Handle create/update expense
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
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete
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
          fetchData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to delete');
        }
      }
    });
  };

  // Open modal for editing
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
    setModalVisible(true);
  };

  // Prepare chart data
  const categoryChartData = stats?.categoryBreakdown
    .filter(item => item.type === 'expense')
    .map(item => ({
      category: CATEGORIES[item.category as CategoryType]?.label || item.category,
      value: item.total
    })) || [];

  const monthlyChartData = stats?.monthlyTrend.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    type: item._id.type === 'income' ? 'Income' : 'Expense',
    amount: item.total
  })) || [];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Expense, b: Expense) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: CategoryType) => {
        const cat = CATEGORIES[category];
        return cat ? `${cat.icon} ${cat.label}` : category;
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? 'Income' : 'Expense'}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Expense) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {record.type === 'income' ? '+' : '-'}₹{amount.toLocaleString()}
        </span>
      ),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            format="MMM DD, YYYY"
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingExpense(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Transaction
          </Button>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Income"
                  value={stats.summary.totalIncome}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ color: '#52c41a' }}
                  suffix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Expense"
                  value={stats.summary.totalExpense}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={<FallOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Balance"
                  value={stats.summary.balance}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ color: stats.summary.balance >= 0 ? '#52c41a' : '#ff4d4f' }}
                  suffix={<WalletOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Transactions"
                  value={stats.summary.transactionCount}
                  suffix={<DollarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={16}>
              <Card title="Income vs Expense Trend" bordered={false}>
                {monthlyChartData.length > 0 ? (
                  <Column
                    data={monthlyChartData}
                    xField="month"
                    yField="amount"
                    seriesField="type"
                    group
                    columnStyle={{
                      radius: [8, 8, 0, 0]
                    }}
                    color={['#52c41a', '#ff4d4f']}
                    label={{
                      position: 'top',
                      style: { fill: '#000', fontSize: 10 }
                    }}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Expense by Category" bordered={false}>
                {categoryChartData.length > 0 ? (
                  <Pie
                    data={categoryChartData}
                    angleField="value"
                    colorField="category"
                    radius={0.8}
                    innerRadius={0.6}
                    label={{
                      type: 'spider',
                      content: '{name}\n₹{value}'
                    }}
                    statistic={{
                      title: {
                        content: 'Total'
                      },
                      content: {
                        content: `₹${categoryChartData.reduce((a, b) => a + b.value, 0).toLocaleString()}`
                      }
                    }}
                  />
                ) : (
                  <Empty description="No expense data" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Recent Transactions Table */}
          <Card title="Recent Transactions" bordered={false}>
            <Table
              columns={columns}
              dataSource={expenses}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}

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
            date: dayjs()
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter transaction title" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select>
                  <Select.Option value="income">Income</Select.Option>
                  <Select.Option value="expense">Expense</Select.Option>
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
                <Select placeholder="Select category">
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
                <DatePicker style={{ width: '100%' }} format="MMM DD, YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingExpense ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
