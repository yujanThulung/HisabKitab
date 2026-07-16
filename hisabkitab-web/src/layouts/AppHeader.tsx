import { Layout, Space, Button, DatePicker, Tag, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Header } = Layout;
const { RangePicker } = DatePicker;

const SIDER_WIDTH = 200;
const SIDER_COLLAPSED_WIDTH = 80;

interface AppHeaderProps {
  collapsed: boolean;
  dateRange: [Dayjs, Dayjs];
  lastSettledAt: Dayjs | null;
  onToggleSidebar: () => void;
  onDateRangeChange: (range: [Dayjs, Dayjs]) => void;
  onRefresh: () => void;
  onAddPurchase: () => void;
}

const AppHeader = ({
  collapsed,
  dateRange,
  lastSettledAt,
  onToggleSidebar,
  onDateRangeChange,
  onRefresh,
  onAddPurchase,
}: AppHeaderProps) => {
  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: siderWidth,
        right: 0,
        zIndex: 99,
        transition: 'left 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left: toggle + title + last settled badge */}
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{ fontSize: '16px', width: 48, height: 48 }}
        />
        <h2 style={{ margin: 0, color: '#ff6b35', fontWeight: 700 }}>
          Roommate Purchase Tracker
        </h2>
        {lastSettledAt && (
          <Tooltip title={`Expenses shown from ${lastSettledAt.format('MMM DD, YYYY')} onwards`}>
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              style={{ cursor: 'default', fontSize: 12 }}
            >
              Settled {lastSettledAt.format('MMM DD, YYYY')}
            </Tag>
          </Tooltip>
        )}
      </Space>

      {/* Right: date range + actions */}
      <Space>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && onDateRangeChange(dates as [Dayjs, Dayjs])}
          format="MMM DD, YYYY"
        />
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Refresh
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddPurchase}
          style={{
            background: 'linear-gradient(135deg, #ff6b35 0%, #ffa552 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
          }}
        >
          Add Purchase
        </Button>
      </Space>
    </Header>
  );
};

export default AppHeader;
