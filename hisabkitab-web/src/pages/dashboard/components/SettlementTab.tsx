import { useState } from 'react';
import {
  Card, Row, Col, Avatar, Space, Divider, Empty,
  Button, Tag, Modal, Alert, Spin, Typography,
} from 'antd';
import {
  CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSettlement } from '../hooks/useSettlement';
import type { UserBalanceSnapshot, SettlementTransaction } from '../../../api/settlement';

const { Text } = Typography;

// ── Shared sub-components ────────────────────────────────────────────────────

const TotalsBanner = ({
  totalAmount,
  perPersonShare,
  peopleCount,
}: {
  totalAmount: number;
  perPersonShare: number;
  peopleCount: number;
}) => (
  <div
    style={{
      background: '#ff6b35',
      padding: '24px',
      borderRadius: '12px',
      color: 'white',
      marginBottom: 24,
    }}
  >
    <Row gutter={16}>
      <Col xs={24} sm={8}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Total Spent</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{totalAmount.toLocaleString()}</div>
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Per Person</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{perPersonShare.toFixed(2)}</div>
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>People</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{peopleCount}</div>
        </div>
      </Col>
    </Row>
  </div>
);

const TransactionCards = ({ transactions }: { transactions: SettlementTransaction[] }) => {
  if (!transactions?.length) {
    return <Empty description="Everyone is even — no transfers needed." />;
  }
  return (
    <Row gutter={[16, 16]}>
      {transactions.map((item, idx) => (
        <Col xs={24} sm={12} lg={8} key={`${item.fromId}-${item.toId}-${idx}`}>
          <Card style={{ borderLeft: '4px solid #ff6b35', background: '#fff7f2' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ fontSize: 15 }}>
                <strong>{item.fromName}</strong> needs to give <strong>{item.toName}</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff6b35' }}>
                ₹{Math.abs(item.amount).toFixed(2)}
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const BalanceCards = ({ snapshot }: { snapshot: UserBalanceSnapshot[] }) => {
  if (!snapshot?.length) return null;
  return (
    <Row gutter={[16, 16]}>
      {snapshot.map(person => (
        <Col xs={24} sm={12} lg={8} key={person.userId}>
          <Card
            style={{
              borderLeft: person.balance >= 0 ? '4px solid #52c41a' : '4px solid #ff4d4f',
              background: person.balance >= 0 ? '#f6ffed' : '#fff1f0',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Avatar style={{ backgroundColor: '#ff8c42' }} size="large">
                  {person.name.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{person.name}</div>
              </Space>

              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Total Spent</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#ff6b35' }}>
                  ₹{person.totalAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Balance</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: person.balance >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {person.balance > 0 ? '+' : ''}₹{person.balance.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: person.balance >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {person.balance > 0
                    ? `Should receive ₹${person.balance.toFixed(2)}`
                    : person.balance < 0
                    ? `Should pay ₹${Math.abs(person.balance).toFixed(2)}`
                    : 'All even!'}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const SettlementTab = () => {
  const { preview, lastSettlement, loading, settling, settle } = useSettlement();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmSettle = async () => {
    setConfirmOpen(false);
    await settle();
  };

  if (loading) {
    return (
      <Card title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Settlement</span>}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* ── Section 1: Current open cycle (live preview) ── */}
      <Card
        style={{ marginBottom: 24 }}
        title={<span style={{ color: '#ff6b35', fontWeight: 600 }}>Current Cycle</span>}
        extra={
          lastSettlement && (
            <Tag color="blue">
              Since {dayjs(lastSettlement.settledAt).format('MMM DD, YYYY hh:mm A')}
            </Tag>
          )
        }
      >
        {!preview ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              lastSettlement
                ? 'No new expenses since the last settlement. Add purchases to start a new cycle.'
                : 'No expenses yet. Add purchases to get started.'
            }
          />
        ) : (
          <>
            <TotalsBanner
              totalAmount={preview.totalAmount}
              perPersonShare={preview.perPersonShare}
              peopleCount={preview.userSnapshot?.length ?? 0}
            />

            <Divider style={{ borderColor: '#ffa552' }}>Who Owes Whom</Divider>
            <TransactionCards transactions={preview.transactions} />

            <Divider style={{ borderColor: '#ffa552' }}>Per-Person Balances</Divider>
            <BalanceCards snapshot={preview.userSnapshot} />

            <Divider style={{ borderColor: '#ffa552' }} />
            <div style={{ textAlign: 'center' }}>
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16, textAlign: 'left' }}
                message="Ready to settle?"
                description="Clicking 'Settle All' tells the backend to record the current balances and start a fresh cycle. Expense history is always preserved."
              />
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                loading={settling}
                onClick={() => setConfirmOpen(true)}
                style={{
                  background: '#ff6b35',
                  border: 'none',
                  height: 48,
                  paddingInline: 40,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
                }}
              >
                Settle All — ₹{preview.totalAmount.toLocaleString()}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* ── Section 2: Last completed settlement ── */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#ff6b35' }} />
            <span style={{ color: '#ff6b35', fontWeight: 600 }}>Last Settlement</span>
          </Space>
        }
        extra={
          lastSettlement && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {dayjs(lastSettlement.settledAt).format('MMM DD, YYYY hh:mm A')}
            </Tag>
          )
        }
      >
        {!lastSettlement ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No completed settlements yet."
          />
        ) : (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              Cycle: {dayjs(lastSettlement.periodFrom).format('MMM DD, YYYY')}
              {' → '}
              {dayjs(lastSettlement.periodTo).format('MMM DD, YYYY hh:mm A')}
            </Text>

            <TotalsBanner
              totalAmount={lastSettlement.totalAmount}
              perPersonShare={lastSettlement.perPersonShare}
              peopleCount={lastSettlement.userSnapshot?.length ?? 0}
            />

            <Divider style={{ borderColor: '#ffa552' }}>Who Paid Whom</Divider>
            <TransactionCards transactions={lastSettlement.transactions} />

            <Divider style={{ borderColor: '#ffa552' }}>Per-Person Balances</Divider>
            <BalanceCards snapshot={lastSettlement.userSnapshot} />
          </>
        )}
      </Card>

      {/* ── Confirm modal ── */}
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
        okButtonProps={{ style: { background: '#ff6b35', border: 'none' }, loading: settling }}
        width={480}
      >
        <Alert
          type="warning"
          showIcon
          message="This action starts a new expense cycle"
          description="The backend will record the current balances and reset the cycle. All expense history is preserved and viewable in Settlement Logs."
          style={{ marginBottom: 20 }}
        />

        {preview && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Text strong>Total: </Text>
              <Text strong style={{ color: '#ff6b35', fontSize: 16 }}>
                ₹{preview.totalAmount.toLocaleString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: 12 }}>
                (₹{preview.perPersonShare.toFixed(2)} per person)
              </Text>
            </div>

            {preview.transactions?.length > 0 && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, color: '#555' }}>
                  Payments to record:
                </Text>
                {preview.transactions.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom:
                        idx < preview.transactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <span>
                      <strong>{item.fromName}</strong> → <strong>{item.toName}</strong>
                    </span>
                    <span style={{ fontWeight: 700, color: '#ff6b35' }}>
                      ₹{Math.abs(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default SettlementTab;
