import { Layout, Menu, Card, Avatar, Space, Button } from 'antd';
import {
  HomeOutlined,
  BarChartOutlined,
  SwapOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  selectedMenu: string;
  onMenuSelect: (key: string) => void;
}

const AppSidebar = ({ collapsed, selectedMenu, onMenuSelect }: AppSidebarProps) => {
  const { user, logout } = useAuthStore();

  const siderStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #ff6b35 0%, #ff8c42 100%)',
    boxShadow: '2px 0 8px rgba(255, 107, 53, 0.15)',
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  };

  return (
    <>
      {/* Fixed visible sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={siderStyle}
      >
        <div
          style={{
            height: '64px',
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          {!collapsed ? '🏠 HisabKitab' : '🏠'}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => onMenuSelect(key)}
          style={{ background: 'transparent', border: 'none' }}
          items={[
            {
              key: 'overview',
              icon: <HomeOutlined />,
              label: 'Overview',
              style: { color: 'white', fontWeight: 500 },
            },
            {
              key: 'purchases',
              icon: <BarChartOutlined />,
              label: 'Purchases',
              style: { color: 'white', fontWeight: 500 },
            },
            {
              key: 'settlement',
              icon: <SwapOutlined />,
              label: 'Settlement',
              style: { color: 'white', fontWeight: 500 },
            },
            {
              key: 'settlement-logs',
              icon: <HistoryOutlined />,
              label: 'Settlement Logs',
              style: { color: 'white', fontWeight: 500 },
            },
          ]}
        />

        {!collapsed && user && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              padding: '0 16px',
            }}
          >
            <Card
              size="small"
              style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}
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
                <Button icon={<LogoutOutlined />} danger size="small" block onClick={logout}>
                  Logout
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Sider>

      {/* Invisible placeholder so the content column doesn't go under the fixed sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ visibility: 'hidden', flexShrink: 0 }}
      />
    </>
  );
};

export default AppSidebar;
