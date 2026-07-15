import { Card, Row, Col, Statistic } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const DashboardSimple = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Income"
              value={0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Expense"
              value={0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ff4d4f' }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Balance"
              value={0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Transactions"
              value={0}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <p>Dashboard is rendering correctly!</p>
        <p>API integration will load real data when backend is ready.</p>
      </Card>
    </div>
  );
};

export default DashboardSimple;
