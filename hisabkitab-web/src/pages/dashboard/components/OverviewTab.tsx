import { Card, Row, Col, Statistic, Empty } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, SwapOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import type { DashboardData } from '../hooks/useDashboard';

interface OverviewTabProps {
  data: DashboardData;
}

const OverviewTab = ({ data }: OverviewTabProps) => {
  const chartData = (data?.userBreakdown ?? []).map(u => ({
    person: u.name,
    amount: u.totalAmount,
  }));

  return (
    <>
      {/* Summary stat cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderLeft: '4px solid #ff6b35' }}>
            <Statistic
              title={<span style={{ color: '#666' }}>Total Purchases</span>}
              value={data?.grandTotal ?? 0}
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
              value={data?.totalTransactions ?? 0}
              valueStyle={{ color: '#ff8c42', fontSize: '28px', fontWeight: 600 }}
              suffix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderLeft: '4px solid #ffa552' }}>
            <Statistic
              title={<span style={{ color: '#666' }}>Per Person Share</span>}
              value={data?.perPersonShare ?? 0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#ffa552', fontSize: '28px', fontWeight: 600 }}
              suffix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* User breakdown bar chart — full width */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Who Spent How Much</span>}>
            {chartData.length > 0 ? (
              <Column
                data={chartData}
                xField="person"
                yField="amount"
                columnStyle={{
                  radius: [8, 8, 0, 0],
                  fill: 'l(270) 0:#ff6b35 1:#ffa552',
                }}
                label={{
                  position: 'top',
                  formatter: (v: { amount: number }) => `₹${Number(v.amount).toLocaleString()}`,
                  style: { fill: '#333', fontSize: 12, fontWeight: 600 },
                }}
                yAxis={{
                  label: {
                    formatter: (v: string) => `₹${Number(v).toLocaleString()}`,
                  },
                }}
              />
            ) : (
              <Empty description="No purchase data" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OverviewTab;
