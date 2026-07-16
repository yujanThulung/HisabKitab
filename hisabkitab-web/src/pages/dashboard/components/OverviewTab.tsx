import { Card, Row, Col, Statistic, Empty } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DashboardData } from '../hooks/useDashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface OverviewTabProps {
  data: DashboardData;
}

const OverviewTab = ({ data }: OverviewTabProps) => {
  const chartData = (data?.userBreakdown ?? []).map(u => ({
    person: u.name,
    amount: u.totalAmount,
  }));

  const barChartData = {
    labels: chartData.map(d => d.person),
    datasets: [
      {
        label: 'Amount Spent',
        data: chartData.map(d => d.amount),
        backgroundColor: '#ff6b35',
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `₹${Number(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `₹${Number(value).toLocaleString()}`,
        },
      },
    },
  };

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
              <div style={{ height: 580, width: '100%' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
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
