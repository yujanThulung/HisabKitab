import { Layout, Space, Button, DatePicker } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Header } = Layout;
const { RangePicker } = DatePicker;

// Must match Ant Design Sider default widths
const SIDER_WIDTH = 200;
const SIDER_COLLAPSED_WIDTH = 80;

interface AppHeaderProps {
  collapsed: boolean;
  dateRange: [Dayjs, Dayjs];
  onToggleSidebar: () => void;
  onDateRangeChange: (range: [Dayjs, Dayjs]) => void;
  onRefresh: () => void;
  onAddPurchase: () => void;
}

const AppHeader = ({
  collapsed,
  dateRange,
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
        // Fixed at top, offset by sidebar width so it sits flush against it
        position: 'fixed',
        top: 0,
        left: siderWidth,
        right: 0,
        zIndex: 99,
        // Smooth slide when sidebar collapses/expands
        transition: 'left 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
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
      </Space>

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
