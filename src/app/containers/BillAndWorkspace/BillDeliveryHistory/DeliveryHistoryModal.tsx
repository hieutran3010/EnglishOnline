import React, { memo, useCallback, useEffect } from 'react';
import moment from 'moment';
import {
  Modal,
  Form,
  DatePicker,
  Input,
  Space,
  Typography,
  TimePicker,
} from 'antd';
import { BillDeliveryHistory } from 'app/models/bill';

const { Text } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (history: any) => void;
  airLineBillId?: string;
  childBillId?: string;
  selectedHistory?: BillDeliveryHistory;
}
const DeliveryHistoryModal = ({
  visible,
  onClose,
  airLineBillId,
  childBillId,
  onSubmitted,
  selectedHistory,
}: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedHistory) {
      const { date, time, status } = selectedHistory;
      form.setFieldsValue({
        date,
        time,
        status,
      });
    } else {
      form.setFieldsValue({
        date: moment(),
        time: moment(),
        status: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHistory]);

  const _onClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSubmit = useCallback(
    formData => {
      if (!selectedHistory) {
        onSubmitted(formData);
      } else {
        const submitted = { ...selectedHistory };
        submitted.date = formData.date;
        submitted.time = formData.time;
        submitted.status = formData.status;
        onSubmitted(submitted);
      }

      _onClose();
    },
    [_onClose, onSubmitted, selectedHistory],
  );

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  return (
    <Modal
      visible={visible}
      onCancel={_onClose}
      onOk={onOk}
      title={
        <Space>
          <Text>Tình trạng hàng - Bill</Text>
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
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item
          label="Tình trạng"
          name="status"
          rules={[{ required: true, message: 'Chưa nhập nội dung tình trạng' }]}
        >
          <Input ref={ref => ref?.select()} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(DeliveryHistoryModal);
