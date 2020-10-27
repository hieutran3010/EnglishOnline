import React, {
  memo,
  useCallback,
  useState,
  useMemo,
  ReactNode,
  ReactElement,
  useEffect,
} from 'react';
import { Space, Typography, Tooltip, Button, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import forEach from 'lodash/fp/forEach';

import Zone from 'app/models/zone';
import { ParcelServiceZone } from 'app/models/parcelService';
import { ZoneValidator } from 'app/models/validators/zoneValidator';
import { ParcelServiceZoneValidator } from 'app/models/validators/parcelServiceZoneValidator';

import ZoneTable from './ZoneTable';
import ZoneCreationModal from './ZoneCreationModal';
import { ExcludedCountry } from 'app/components/Select/CountrySelect';
import filter from 'lodash/fp/filter';
import { ZONE_VENDOR_ASSOCIATION_SEPARATOR } from '../constants';

const { Title } = Typography;

interface Props {
  isFetchingZones: boolean;
  zones: (Zone | ParcelServiceZone)[];
  validator: ZoneValidator | ParcelServiceZoneValidator;
  onSubmitZone: (zone: Zone | ParcelServiceZone) => void;
  onUpdateZone: (zone: Zone | ParcelServiceZone) => void;
  onDeleteZone?: (zone: Zone | ParcelServiceZone) => void;
  onDisposeModal: () => void;
  onRefresh: () => void;
  isSubmittingZone: boolean;
  editingZone?: ParcelServiceZone | Zone;
  note?: ReactNode;
  extendActions?: ReactNode[];
  onRenderZoneName?: (zoneName: string) => ReactElement;
  isVendorZone?: boolean;
  canUpdateZone?: (zone: Zone | ParcelServiceZone) => boolean;
  canDeleteZone?: (zone: Zone | ParcelServiceZone) => boolean;
}
const ZoneCreateOrEdit = ({
  isFetchingZones,
  zones,
  validator,
  onSubmitZone,
  onUpdateZone,
  onDeleteZone,
  isSubmittingZone,
  editingZone,
  onDisposeModal,
  onRefresh,
  note,
  extendActions,
  onRenderZoneName,
  isVendorZone,
  canUpdateZone,
  canDeleteZone,
}: Props) => {
  const [visibleZoneCreationModal, setVisibleZoneCreationModal] = useState(
    false,
  );

  useEffect(() => {
    if (editingZone) {
      setVisibleZoneCreationModal(true);
    }
  }, [editingZone]);

  const onCancelZoneCreationModal = useCallback(() => {
    setVisibleZoneCreationModal(false);
    onDisposeModal();
  }, [onDisposeModal]);

  const onCreateNewZone = useCallback(() => {
    setVisibleZoneCreationModal(true);
  }, []);

  const _onUpdateZone = useCallback(
    (zone: ParcelServiceZone | Zone) => {
      onUpdateZone(zone);
      setVisibleZoneCreationModal(true);
    },
    [onUpdateZone],
  );

  const mappedCountries = useMemo(() => {
    let filteredZones = zones;

    if (isVendorZone) {
      filteredZones = filter(
        (z: Zone) => !z.name.includes(ZONE_VENDOR_ASSOCIATION_SEPARATOR),
      )(zones);
    }

    const newExcludedCountries = map((zone: Zone | ParcelServiceZone) => {
      const { countries, name } = zone;
      const convertedExcludedCountries: ExcludedCountry[] = [];

      forEach((country: string) => {
        convertedExcludedCountries.push({ country: country, reason: name });
      })(countries);

      return convertedExcludedCountries;
    })(filteredZones);

    return flatten(newExcludedCountries);
  }, [isVendorZone, zones]);

  return (
    <>
      <Space>
        <Title type="secondary" level={4} style={{ marginTop: 7 }}>
          Zone
        </Title>
        <Tooltip title="Thêm một Zone mới">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            shape="circle"
            size="small"
            onClick={onCreateNewZone}
          />
        </Tooltip>
        {extendActions}
      </Space>
      {note && (
        <Alert
          type="info"
          showIcon
          message={note}
          style={{ marginBottom: 10 }}
        />
      )}
      <ZoneTable
        isLoading={isFetchingZones}
        zones={zones}
        onUpdateZone={_onUpdateZone}
        onDeleteZone={onDeleteZone}
        onRenderZoneName={onRenderZoneName}
        canUpdateZone={canUpdateZone}
        canDeleteZone={canDeleteZone}
      />
      <ZoneCreationModal
        validator={validator}
        visible={visibleZoneCreationModal}
        onCancel={onCancelZoneCreationModal}
        onSubmit={onSubmitZone}
        isSubmittingZone={isSubmittingZone}
        zone={editingZone}
        mappedCountries={mappedCountries}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default memo(ZoneCreateOrEdit);
