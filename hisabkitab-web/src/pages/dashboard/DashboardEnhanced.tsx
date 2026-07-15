import { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, DatePicker, Space, Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Spin, Empty, Menu, Avatar, Divider } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  HomeOutlined,
  BarChartOutlined,
  SwapOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Column, Pie } from '@ant-design/plots';
import { expenseApi } from '../../api/expense';
import { CATEGORIES } from '../../types/expense';
import type { Expense, ExpenseStats, CategoryType } from '../../types/expense';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;

const DashboardEnhanced = () => {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('overview');
  
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
  
  const [settlement, setSettlement] = useState<any>(null);
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
    setLoading(true);
    try {
      const [statsRes, expensesRes, settlementRes] = await Promise.all([
        expenseApi.getStatistics({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        }),
        expenseApi.getExpenses({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          limit: 100
        }),
        expenseApi.getSettlementSummary({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        })
      ]);
      
      setStats(statsRes.data);
      setExpenses(expensesRes.data.expenses);
      setSettlement(settlementRes.data);
    } catch (error: any) {
      setStats({
        summary: { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 },
        categoryBreakdown: [],
        monthlyTrend: [],
        recentTransactions: [],
        userSpending: []
      });
      setExpenses([]);
      setSettlement(null);
      
      if (error.response?.status === 404) {
        toast.info('No data available yet. Start by adding your first purchase!');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Handle create/update expense
  const handleSubmit = async (values: any) => {
    try {
      const data = {
        title: values.title,
        amount: Number(values.amount),
        category: values.category,
        note: values.note || values.description,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      };

      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense._id, data);
        toast.success('Purchase updated successfully');
      } else {
        await expenseApi.createExpense(data);
        toast.success('Purchase added successfully');
      }

      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
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
  const userSpendingChartData = stats?.userSpending?.map(item => ({
    person: item.userName,
    amount: item.totalSpent
  })) || [];

  const categoryChartData = stats?.categoryBreakdown
    .filter(item => item.type === 'expense')
    .map(item => ({
      category: CATEGORIES[item.category as CategoryType]?.label || item.category,
      value: item.total
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
      title: 'Person',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#ff8c42' }} size="small">{name?.charAt(0).toUpperCase() || 'U'}</Avatar>
          {name || 'Unknown'}
        </Space>
      )
    },
    {
      title: 'Item',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: CategoryType) => {
        const cat = CATEGORIES[category];
        return cat ? (
          <Tag color="orange">{cat.icon} {cat.label}</Tag>
        ) : category;
      }
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
      sorter: (a: Expense, b: Expense) => a.amount - b.amount
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)}
          style={{ color: '#ff8c42' }}
        >
          Edit
        </Button>
      )
    }
  ];

  const renderOverview = () => (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderLeft: '4px solid #ff6b35' }}>
            <Statistic
              title={<span style={{ color: '#666' }}>Total Purchases</span>}
              value={stats.summary.totalExpense}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ff6b35', fontSize: '28px', fontWeight: 600 }}
              suffix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderLeft: '4px solid #ff8c42' }}>
            <Statistic
              title={<span style={{ color: '#666' }}>Total Transactions</span>}
              value={stats.summary.transactionCount}
              valueStyle={{ color: '#ff8c42', fontSize: '28px', fontWeight: 600 }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderLeft: '4px solid #ffa552' }}>
            <Statistic
              title={<span style={{ color: '#666' }}>Per Person Share</span>}
              value={settlement?.perPersonShare || 0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ffa552', fontSize: '28px', fontWeight: 600 }}
              suffix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Who Purchased How Much</span>}>
            {userSpendingChartData.length > 0 ? (
              <Column
                data={userSpendingChartData}
                xField="person"
                yField="amount"
                columnStyle={{
                  radius: [8, 8, 0, 0],
                  fill: 'l(270) 0:#ff6b35 1:#ffa552'
                }}
                label={{
                  position: 'top',
                  style: { fill: '#333', fontSize: 12, fontWeight: 600 }
                }}
              />
            ) : (
              <Empty description="No purchase data" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Category Breakdown</span>}>
            {categoryChartData.length > 0 ? (
              <Pie
                data={categoryChartData}
                angleField="value"
                colorField="category"
                radius={0.8}
                innerRadius={0.6}
                color={['#ff6b35', '#ff8c42', '#ffa552']}
                label={{
                  type: 'spider',
                  content: '{name}\n₹{value}'
                }}
                statistic={{
                  title: {
                    content: 'Total',
                    style: { color: '#666' }
                  },
                  content: {
                    content: `₹${categoryChartData.reduce((a, b) => a + b.value, 0).toLocaleString()}`,
                    style: { color: '#ff6b35', fontSize: '20px', fontWeight: 600 }
                  }
                }}
              />
            ) : (
              <Empty description="No category data" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderPurchases = () => (
    <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>All Purchases</span>}>
      <Table
        columns={columns}
        dataSource={expenses}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="No purchases yet" /> }}
      />
    </Card>
  );

  const renderSettlement = () => (
    <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Summary</span>}>
      {settlement && settlement.settlements.length > 0 ? (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24}>
              <div style={{ 
                background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)', 
                padding: '24px', 
                borderRadius: '12px',
                color: 'white'
              }}>
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Spent</div>
                      <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{settlement.totalAmount.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Per Person</div>
                      <div style={{ fontSize: '32px', fontWeight: 700 }}>₹{settlement.perPersonShare.toFixed(2)}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Total People</div>
                      <div style={{ fontSize: '32px', fontWeight: 700 }}>{settlement.userCount}</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: '#ffa552' }}>Who Owes Whom</Divider>

          <Row gutter={[16, 16]}>
            {settlement.settlements.map((person: any) => (
              <Col xs={24} sm={12} lg={8} key={person.userId}>
                <Card 
                  style={{ 
                    borderLeft: person.balance > 0 ? '4px solid #52c41a' : '4px solid #ff4d4f',
                    background: person.balance > 0 ? '#f6ffed' : '#fff1f0'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Avatar style={{ backgroundColor: '#ff8c42' }} size="large">
                        {person.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{person.userName}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {person.transactionCount} purchases
                        </div>
                      </div>
                    </Space>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Spent</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#ff6b35' }}>
                        ₹{person.totalSpent.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 700,
                        color: person.balance > 0 ? '#52c41a' : '#ff4d4f'
                      }}>
                        {person.balance > 0 ? '+' : ''}₹{person.balance.toFixed(2)}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: 500,
                        color: person.balance > 0 ? '#52c41a' : '#ff4d4f'
                      }}>
                        {person.balance > 0 
                          ? `Should receive ₹${person.balance.toFixed(2)}` 
                          : person.balance < 0
                          ? `Should pay ₹${Math.abs(person.balance).toFixed(2)}`
                          : 'All settled!'
                        }
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Empty description="No settlement data available" />
      )}
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    switch (selectedMenu) {
      case 'overview':
        return renderOverview();
      case 'purchases':
        return renderPurchases();
      case 'settlement':
        return renderSettlement();
      default:
        return renderOverview();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #ff6b35 0%, #ff8c42 100%)',
          boxShadow: '2px 0 8px rgba(255, 107, 53, 0.15)'
        }}
      >
        <div style={{ 
          height: '64px', 
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '20px'
        }}>
          {!collapsed ? '🏠 HisabKitab' : '🏠'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          style={{ 
            background: 'transparent',
            border: 'none'
          }}
          items={[
            {
              key: 'overview',
              icon: <HomeOutlined />,
              label: 'Overview',
              style: { color: 'white', fontWeight: 500 }
            },
            {
              key: 'purchases',
              icon: <BarChartOutlined />,
              label: 'Purchases',
              style: { color: 'white', fontWeight: 500 }
            },
            {
              key: 'settlement',
              icon: <SwapOutlined />,
              label: 'Settlement',
              style: { color: 'white', fontWeight: 500 }
            }
          ]}
        />
        
        {!collapsed && user && (
          <div style={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 0,
            right: 0,
            padding: '0 16px'
          }}>
            <Card 
              size="small" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Avatar style={{ backgroundColor: '#fff', color: '#ff6b35' }}>
                    <UserOutlined />
                  </Avatar>
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{user.email}</div>
                  </div>
                </Space>
                <Button 
                  icon={<LogoutOutlined />} 
                  danger 
                  size="small" 
                  block
                  onClick={logout}
                >
                  Logout
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
            <h2 style={{ margin: 0, color: '#ff6b35', fontWeight: 700 }}>
              Roommate Purchase Tracker
            </h2>
          </Space>
          
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
              style={{ 
                background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              Add Purchase
            </Button>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px', 
          padding: 24, 
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Add/Edit Modal */}
      <Modal
        title={editingExpense ? 'Edit Purchase' : 'Add Purchase'}
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
            category: 'food',
            date: dayjs()
          }}
        >
          <Form.Item
            label="Item Name"
            name="title"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input placeholder="e.g., Groceries, Vegetables, Milk" />
          </Form.Item>

          <Row gutter={16}>
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
          </Row>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="MMM DD, YYYY" />
          </Form.Item>

          <Form.Item label="Description" name="note">
            <Input.TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
              >
                {editingExpense ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default DashboardEnhanced;
