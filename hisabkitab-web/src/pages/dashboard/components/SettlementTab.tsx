import { Card, Row, Col, Avatar, Space, Divider, Empty } from 'antd';
import type { DashboardData } from '../hooks/useDashboard';

interface SettlementTabProps {
  data: DashboardData;
}

interface OwedSettlement {
  from: string;
  to: string;
  amount: number;
}

const computeOwed = (breakdown: DashboardData['userBreakdown']): OwedSettlement[] => {
  const creditors = breakdown
    .filter(b => b.balance > 1e-9)
    .map(b => ({ name: b.name, amount: b.balance }));
  const debtors = breakdown
    .filter(b => b.balance < -1e-9)
    .map(b => ({ name: b.name, amount: -b.balance }));

  const result: OwedSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const pay = Math.min(creditors[i].amount, debtors[j].amount);
    result.push({ from: debtors[j].name, to: creditors[i].name, amount: pay });
    creditors[i].amount -= pay;
    debtors[j].amount -= pay;
    if (creditors[i].amount < 1e-9) i++;
    if (debtors[j].amount < 1e-9) j++;
  }

  return result;
};

const SettlementTab = ({ data }: SettlementTabProps) => {
  const breakdown = data?.userBreakdown ?? [];
  const owed = computeOwed(breakdown);

  if (!breakdown.length) {
    return (
      <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Summary</span>}>
        <Empty description="No settlement data available" />
      </Card>
    );
  }

  return (
    <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Summary</span>}>

      {/* Totals banner */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Spent</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>
                    ₹{(data?.grandTotal ?? 0).toLocaleString()}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Per Person</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>
                    ₹{(data?.perPersonShare ?? 0).toFixed(2)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total People</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>
                    {breakdown.length}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Who owes whom */}
      <Divider style={{ borderColor: '#ffa552' }}>Who Owes Whom</Divider>

      {owed.length === 0 ? (
        <Empty description="Everyone is all settled up! 🎉" />
      ) : (
        <Row gutter={[16, 16]}>
          {owed.map((item, idx) => (
            <Col xs={24} sm={12} lg={8} key={`${item.from}-${item.to}-${idx}`}>
              <Card style={{ borderLeft: '4px solid #ff6b35', background: '#fff7f2' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ fontSize: '15px' }}>
                    <strong>{item.from}</strong> needs to give <strong>{item.to}</strong>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#ff6b35' }}>
                    ₹{item.amount.toLocaleString()}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Per-person balances */}
      <Divider style={{ borderColor: '#ffa552' }}>Per-Person Balances</Divider>

      <Row gutter={[16, 16]}>
        {breakdown.map(person => (
          <Col xs={24} sm={12} lg={8} key={person.userId}>
            <Card
              style={{
                borderLeft: person.balance > 0 ? '4px solid #52c41a' : '4px solid #ff4d4f',
                background: person.balance > 0 ? '#f6ffed' : '#fff1f0',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Avatar style={{ backgroundColor: '#ff8c42' }} size="large">
                    {person.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{person.name}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {person.transactionCount} purchases
                    </div>
                  </div>
                </Space>

                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total Spent</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#ff6b35' }}>
                    ₹{person.totalAmount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Balance</div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: person.balance > 0 ? '#52c41a' : '#ff4d4f',
                    }}
                  >
                    {person.balance > 0 ? '+' : ''}₹{person.balance.toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: person.balance > 0 ? '#52c41a' : '#ff4d4f',
                    }}
                  >
                    {person.balance > 0
                      ? `Should receive ₹${person.balance.toFixed(2)}`
                      : person.balance < 0
                      ? `Should pay ₹${Math.abs(person.balance).toFixed(2)}`
                      : 'All settled!'}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default SettlementTab;
