import { useState } from 'react';
import { Layout, Spin, Form } from 'antd';
import dayjs from 'dayjs';
import { useDashboard } from './hooks/useDashboard';
import AppSidebar from '../../layouts/AppSidebar';
import AppHeader from '../../layouts/AppHeader';
import OverviewTab from './components/OverviewTab';
import PurchasesTab from './components/PurchasesTab';
import SettlementTab from './components/SettlementTab';
import SettlementLogsPage from '../settlement-logs/SettlementLogsPage';
import UsersPage from '../users/UsersPage';
import ExpenseFormModal from './components/ExpenseFormModal';
import type { ExpenseFormValues } from './components/ExpenseFormModal';
import type { Expense } from '../../types/expense';

const { Content } = Layout;

const DashboardEnhanced = () => {
  const { data, loading, dateRange, setDateRange, fetchData } = useDashboard();

  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(
    () => localStorage.getItem('activeTab') ?? 'overview'
  );

  const handleMenuSelect = (key: string) => {
    localStorage.setItem('activeTab', key);
    setSelectedMenu(key);
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form] = Form.useForm<ExpenseFormValues>();

  const openAddModal = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      title: expense.title,
      amount: expense.amount,
      note: expense.note,
      date: dayjs(expense.date),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
    form.resetFields();
  };

  const handleFormSuccess = () => {
    closeModal();
    fetchData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    switch (selectedMenu) {
      case 'overview':
        return <OverviewTab data={data} />;
      case 'purchases':
        return <PurchasesTab expenses={data.items} onEdit={openEditModal} />;
      case 'settlement':
        return <SettlementTab />;
      case 'settlement-logs':
        return <SettlementLogsPage />;
      case 'members':
        return <UsersPage />;
      default:
        return <OverviewTab data={data} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuSelect}
      />

      <Layout>
        <AppHeader
          collapsed={collapsed}
          dateRange={dateRange}
          onToggleSidebar={() => setCollapsed(prev => !prev)}
          onDateRangeChange={setDateRange}
          onRefresh={fetchData}
          onAddPurchase={openAddModal}
        />

        <Content
          style={{
            marginTop: 64,
            padding: 24,
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>

      <ExpenseFormModal
        open={modalVisible}
        editingExpense={editingExpense}
        form={form}
        onSuccess={handleFormSuccess}
        onClose={closeModal}
      />
    </Layout>
  );
};

export default DashboardEnhanced;
