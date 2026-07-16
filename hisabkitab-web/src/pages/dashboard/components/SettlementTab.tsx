import { useState } from 'react';
import {
  Card, Row, Col, Avatar, Space, Divider, Empty,
  Button, Tag, Modal, Descriptions, Alert,
} from 'antd';
import {
  CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import type { DashboardData } from '../hooks/useDashboard';

interface SettlementTabProps {
  data: DashboardData;
  lastSettledAt: Dayjs | null;
  settling: boolean;
  onSettle: () => Promise<boolean>;
}

interface OwedItem {
  from: string;
  fromId: string;
  to: string;
  toId: string;
  amount: number;
}

// Greedy balance resolution — same algorithm used in useDashboard.handleSettle
const computeOwed = (breakdown: DashboardData['userBreakdown']): OwedItem[] => {
  const creditors = breakdown
    .filter(b => b.balance > 1e-9)
    .map(b => ({ name: b.name, id: b.userId, remaining: b.balance }));
  const debtors = breakdown
    .filter(b => b.balance < -1e-9)
    .map(b => ({ name: b.name, id: b.userId, remaining: -b.balance }));

  const result: OwedItem[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const pay = Math.min(creditors[i].remaining, debtors[j].remaining);
    result.push({
      from: debtors[j].name,
      fromId: debtors[j].id,
      to: creditors[i].name,
      toId: creditors[i].id,
      amount: pay,
    });
    creditors[i].remaining -= pay;
    debtors[j].remaining -= pay;
    if (creditors[i].remaining < 1e-9) i++;
    if (debtors[j].remaining < 1e-9) j++;
  }

  return result;
};

const SettlementTab = ({ data, lastSettledAt, settling, onSettle }: SettlementTabProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const breakdown = data?.userBreakdown ?? [];
  const hasTransactions = data.totalTransactions > 0;
  const owed = computeOwed(breakdown);
  const allSettled = owed.length === 0;

  const handleConfirmSettle = async () => {
    setConfirmOpen(false);
    await onSettle();
  };

  // No data at all (before first ever expense)
  if (!hasTransactions && !lastSettledAt) {
    return (
      <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Summary</span>}>
        <Empty description="No expenses yet. Add a purchase to get started." />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement Summary</span>}
        extra={
          lastSettledAt && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Last settled: {lastSettledAt.format('MMM DD, YYYY')}
            </Tag>
          )
        }
      >
        {/* ── Fresh cycle — no transactions yet ── */}
        {!hasTransactions ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#888', fontSize: 14 }}>
                Settled on {lastSettledAt!.format('MMM DD, YYYY hh:mm A')}. <br />
                No new expenses yet — add a purchase to start the new cycle.
              </span>
            }
          />
        ) : (
          <>
            {/* Totals banner */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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

            {allSettled ? (
              <Empty description="Everyone is all settled up! 🎉" />
            ) : (
              <Row gutter={[16, 16]}>
                {owed.map((item, idx) => (
                  <Col xs={24} sm={12} lg={8} key={`${item.fromId}-${item.toId}-${idx}`}>
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

            {/* Settle All CTA */}
            {!allSettled && (
              <>
                <Divider style={{ borderColor: '#ffa552' }} />
                <div style={{ textAlign: 'center' }}>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, textAlign: 'left' }}
                    message="Ready to settle?"
                    description="Clicking 'Settle All' will record all the payments above and immediately start a fresh cycle. Expense history is preserved."
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined />}
                    loading={settling}
                    onClick={() => setConfirmOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)',
                      border: 'none',
                      height: 48,
                      paddingInline: 40,
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
                    }}
                  >
                    Settle All — ₹{(data?.grandTotal ?? 0).toLocaleString()}
                  </Button>
                </div>
              </>
            )}

            {/* Per-person balances — only when there are actual imbalances to show */}
            {!allSettled && (
              <>
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
              </>
            )}
          </>
        )}
      </Card>

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleConfirmSettle}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff6b35' }} />
            <span>Confirm Settlement</span>
          </Space>
        }
        okText="Yes, Settle All"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)',
            border: 'none',
          },
          loading: settling,
        }}
        width={520}
      >
        <Alert
          type="warning"
          showIcon
          message="This action starts a new expense cycle"
          description="All current balances will be recorded and the dashboard will reset immediately to show only new expenses from this point onwards. You can still view past settlement history."
          style={{ marginBottom: 20 }}
        />

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Total Amount">
            <strong style={{ color: '#ff6b35' }}>₹{(data?.grandTotal ?? 0).toLocaleString()}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Per Person Share">
            ₹{(data?.perPersonShare ?? 0).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Payments to Record">
            {owed.length} transaction{owed.length !== 1 ? 's' : ''}
          </Descriptions.Item>
          <Descriptions.Item label="New Cycle Starts">
            <Tag color="green">Right after settlement</Tag>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>Payment Summary:</div>
          {owed.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: idx < owed.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <span>
                <strong>{item.from}</strong> → <strong>{item.to}</strong>
              </span>
              <span style={{ fontWeight: 700, color: '#ff6b35' }}>
                ₹{item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default SettlementTab;
