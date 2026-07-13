import { Menu } from "antd";
import {
  DashboardOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const sidebar = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "expenses",
    icon: <DollarOutlined />,
    label: "Expenses",
  },
  {
    key: "profile",
    icon: <UserOutlined />,
    label: "Profile",
  },
];

const AppSidebar = () => {
  return (
    <Menu mode="inline" defaultSelectedKeys={["dashboard"]} items={sidebar} />
  );
};

export default AppSidebar;
