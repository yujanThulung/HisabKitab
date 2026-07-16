import { Modal, Form, Input, InputNumber, DatePicker, Button, Space, Upload } from 'antd';
import type { FormInstance, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import { expenseApi } from '../../../api/expense';
import type { CreateExpenseDto, Expense } from '../../../types/expense';
import { getErrorMessage } from '../../../utils/error';

export interface ExpenseFormValues {
  title: string;
  amount: number;
  note?: string;
  date?: Dayjs;
  image?: UploadFile[];
}

interface ExpenseFormModalProps {
  open: boolean;
  editingExpense: Expense | null;
  form: FormInstance<ExpenseFormValues>;
  onSuccess: () => void;
  onClose: () => void;
}

const ExpenseFormModal = ({
  open,
  editingExpense,
  form,
  onSuccess,
  onClose,
}: ExpenseFormModalProps) => {
  const isEditing = !!editingExpense;

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      const amount = Number(values.amount);

      if (isEditing && editingExpense) {
        await expenseApi.updateExpense(editingExpense._id, { title: values.title, amount });
        toast.success('Purchase updated successfully');
      } else {
        const imageFile = values.image?.[0]?.originFileObj as File | undefined;
        const payload: CreateExpenseDto = {
          title: values.title,
          amount,
          note: values.note,
          date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          ...(imageFile ? { image: imageFile } : {}),
        };
        await expenseApi.createExpense(payload);
        toast.success('Purchase added successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error(getErrorMessage(error, 'Operation failed'));
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Purchase' : 'Add Purchase'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ date: dayjs() }}
      >
        <Form.Item
          label="Item Name"
          name="title"
          rules={[{ required: true, message: 'Please enter item name' }]}
        >
          <Input placeholder="e.g., Groceries, Vegetables, Milk" />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <InputNumber
            prefix="₹"
            style={{ width: '100%' }}
            min={0}
            placeholder="0.00"
          />
        </Form.Item>

        {!isEditing && (
          <>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="MMM DD, YYYY" />
            </Form.Item>

            <Form.Item label="Note" name="note">
              <Input.TextArea rows={3} placeholder="Optional notes" />
            </Form.Item>

            <Form.Item
              label="Image (optional)"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false} // prevent auto upload
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Choose Image</Button>
              </Upload>
            </Form.Item>
          </>
        )}

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseFormModal;
