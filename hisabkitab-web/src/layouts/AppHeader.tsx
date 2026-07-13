import { Avatar, Dropdown, Layout, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header } = Layout;
const { Text } = Typography;

// Keeping menu items in a single, well-typed variable
const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    label: "Profile",
  },
  {
    key: "logout",
    danger: true,
    label: "Logout",
  },
];

const AppHeader = () => {
  return (
    <Header className="flex items-center justify-between bg-white px-6">
      <Text strong className="text-lg">
        HisabKitab
      </Text>

      <Dropdown menu={{ items: userMenuItems }}>
        <Space className="cursor-pointer">
          <Avatar icon={<UserOutlined />} />
          <Text>User</Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;