import React, { memo, useCallback } from 'react';
import { Modal, Form, DatePicker, Input, Space, Typography } from 'antd';
import { BillDeliveryHistory } from 'app/models/bill';

const { Text } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (history: BillDeliveryHistory) => void;
  airLineBillId?: string;
  childBillId?: string;
}
const DeliveryHistoryModal = ({
  visible,
  onClose,
  airLineBillId,
  childBillId,
  onSubmitted,
}: Props) => {
  const [form] = Form.useForm();

  const onSubmit = useCallback(
    formData => {
      const history = new BillDeliveryHistory(formData);
      onSubmitted(history);
      onClose();
    },
    [onClose, onSubmitted],
  );

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const _onClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      visible={visible}
      onCancel={_onClose}
      onOk={onOk}
      title={
        <Space>
          <Text>Thêm tình trạng hàng - Bill</Text>
          <Text strong>
            {airLineBillId || childBillId || '<Chưa có mã bill>'}
          </Text>
        </Space>
      }
    >
      <Form form={form} size="small" labelCol={{ span: 7 }} onFinish={onSubmit}>
        <Form.Item label="Ngày" name="date">
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
        <Form.Item label="Giờ" name="time">
          <DatePicker picker="time" format="HH:mm" />
        </Form.Item>
        <Form.Item
          label="Tình trạng"
          name="status"
          rules={[{ required: true, message: 'Chưa nhập nội dung tình trạng' }]}
        >
          <Input ref={ref => ref?.focus()} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(DeliveryHistoryModal);
