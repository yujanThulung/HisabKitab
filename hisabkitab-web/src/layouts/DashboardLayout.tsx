import { Layout } from "antd";
import AppHeader from "./AppHeader";
import { Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Sider width={240} theme="light">
        <div className="p-5 text-center text-xl font-bold">HisabKitab</div>
      </Sider>

      <Layout>
        <AppHeader />

        <Content className="m-6 rounded-lg bg-white p-6 shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;