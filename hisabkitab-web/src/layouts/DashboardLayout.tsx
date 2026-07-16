import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout className="min-h-screen">
        <Content className="m-6 rounded-lg bg-white p-6 shadow-sm">
          <Outlet />
        </Content>
    </Layout>
  );
};

export default DashboardLayout;