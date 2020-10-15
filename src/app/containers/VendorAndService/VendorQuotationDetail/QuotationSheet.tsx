import React, { memo, useCallback, useMemo, useState } from 'react';
import ReactDataSheet from 'react-datasheet';
import forEach from 'lodash/fp/forEach';
import isEmpty from 'lodash/fp/isEmpty';
import orderBy from 'lodash/fp/orderBy';
import join from 'lodash/fp/join';
import find from 'lodash/fp/find';

import { Space, InputNumber, Tooltip, Button, Divider } from 'antd';
import { toast } from 'react-toastify';

import Vendor from 'app/models/vendor';
import VendorQuotation, {
  VendorQuotationPrice,
} from 'app/models/vendorQuotation';
import type Zone from 'app/models/zone';

const initAnEmptyWeightRow = (weightRowColumnCount: number) => {
  const weightRow: any[] = [];
  for (let col = 0; col < weightRowColumnCount; col++) {
    weightRow.push({ value: '' });
  }

  return weightRow;
};

const getWeightValueString = (vendorQuotation: VendorQuotation): string => {
  let weightValue = `${vendorQuotation.endWeight}`;
  if (vendorQuotation.startWeight) {
    weightValue = `${vendorQuotation.startWeight}-${vendorQuotation.endWeight}`;
  }

  return weightValue;
};

const MIN_ROW_COUNT = 60;

interface SelectionRowRange {
  startRow?: number;
  endRow?: number;
}

interface Props {
  vendor: Vendor;
  onCellChanged?: () => void;
  isReadOnly?: boolean;
}
const QuotationSheet = React.forwardRef(
  ({ vendor, onCellChanged, isReadOnly }: Props, ref: any) => {
    const [moreRowCount, setMoreRowCount] = useState(1);
    const [selectedRowRange, setSelectedRowRange] = useState<
      SelectionRowRange
    >();

    const { zones, vendorQuotations } = vendor;
    const weightRowColumnCount = zones ? zones.length + 1 : 0;
    const hasZone = zones && !isEmpty(zones);

    const quotationSheet = useMemo((): any[][] => {
      const grid: any[] = [];

      if (!zones || !hasZone) {
        return grid;
      }

      const countriesRow: any[] = [
        {
          value: 'Kg',
          rowSpan: 2,
          readOnly: true,
          disableEvents: true,
          width: '100px',
        },
      ];
      const zoneRow: any[] = [];

      const orderedZones = orderBy('name', ['asc'], zones);
      forEach((zone: Zone) => {
        const { countries, name } = zone;

        countriesRow.push({
          value: join(', ')(countries),
          readOnly: true,
          overflow: 'wrap',
          disableEvents: true,
        });

        zoneRow.push({ value: name, readOnly: true, disableEvents: true });
      })(orderedZones);

      grid.push(countriesRow);
      grid.push(zoneRow);

      // buffer 100 empty rows
      if (!vendorQuotations || isEmpty(vendorQuotations)) {
        if (!isReadOnly) {
          for (let row = 0; row < MIN_ROW_COUNT; row++) {
            const weightRow = initAnEmptyWeightRow(weightRowColumnCount);
            grid.push(weightRow);
          }
        }
      } else {
        for (let row = 0; row < vendorQuotations.length; row++) {
          const vendorQuotation = vendorQuotations[row];
          const weightRow: any[] = [];
          const actualRow = row + 2; // since two rows are Countries and Zones
          //weight
          weightRow.push({
            value: getWeightValueString(vendorQuotation),
            disableEvents: isReadOnly,
            row: actualRow,
            col: 0,
          });

          for (let col = 0; col < orderedZones.length; col++) {
            const zone = orderedZones[col];
            const zonePrice = find(
              (zp: VendorQuotationPrice) => zp.zoneId === zone.id,
            )(vendorQuotation.zonePrices);

            const actualCol = col + 1; // since the first row is weight
            weightRow.push({
              value: zonePrice ? zonePrice.priceInUsd : 0,
              disableEvents: isReadOnly,
              row: actualRow,
              col: actualCol,
            });
          }

          grid.push(weightRow);
        }

        // add buffer rows for making sure always having at least 100 rows
        if (!isReadOnly && vendorQuotations.length < MIN_ROW_COUNT) {
          const bufferRowCount = MIN_ROW_COUNT - vendorQuotations.length;
          for (let row = 0; row < bufferRowCount; row++) {
            grid.push(initAnEmptyWeightRow(weightRowColumnCount));
          }
        }
      }

      return grid;
    }, [zones, hasZone, vendorQuotations, weightRowColumnCount, isReadOnly]);

    const onCellChange = useCallback(
      (arrayOfChanges: any[]) => {
        forEach((cell: any) => {
          const { row, col } = cell;
          cell.value = cell.value.replace(/[^0-9.,/-]+/g, '');
          quotationSheet[row][col] = cell;
        })(arrayOfChanges);

        if (onCellChanged) {
          onCellChanged();
        }
      },
      [onCellChanged, quotationSheet],
    );

    const onAddMoreEmptyRowAtTheEndPage = useCallback(() => {
      for (let index = 0; index < moreRowCount; index++) {
        quotationSheet.push(initAnEmptyWeightRow(weightRowColumnCount));
      }

      toast.info(`Đã thêm ${moreRowCount} dòng trống`);
    }, [moreRowCount, quotationSheet, weightRowColumnCount]);

    const onAddMoreEmptyRowAtTheEndOfSelection = useCallback(() => {
      if (selectedRowRange) {
        const { endRow } = selectedRowRange;
        if (endRow) {
          for (let index = 0; index < moreRowCount; index++) {
            quotationSheet.splice(
              endRow + 1,
              0,
              initAnEmptyWeightRow(weightRowColumnCount),
            );
          }

          toast.info(`Đã thêm ${moreRowCount} dòng trống`);
        }
      }
    }, [moreRowCount, quotationSheet, selectedRowRange, weightRowColumnCount]);

    const onMoreRowCountChanged = useCallback((value: any) => {
      setMoreRowCount(value);
    }, []);

    const onSheetSelectionChanged = useCallback(({ start, end }: any) => {
      const selectionRange: SelectionRowRange = {
        startRow: start.i,
        endRow: end.i,
      };
      setSelectedRowRange(selectionRange);
    }, []);

    const onDeleteSelectedRows = useCallback(() => {
      if (selectedRowRange) {
        const { startRow, endRow } = selectedRowRange;
        if (startRow && endRow) {
          let numberRowToDelete = endRow - startRow;
          quotationSheet.splice(startRow, numberRowToDelete + 1);
        }
      }
      setSelectedRowRange(undefined);
    }, [quotationSheet, selectedRowRange]);

    return (
      <>
        {!isReadOnly && (
          <Space style={{ marginBottom: 5, marginTop: 10 }}>
            <Button type="ghost" onClick={onAddMoreEmptyRowAtTheEndPage}>
              Thêm vào cuối
            </Button>
            <span>hoặc</span>
            <Button type="ghost" onClick={onAddMoreEmptyRowAtTheEndOfSelection}>
              Thêm dưới chỗ đang chọn
            </Button>
            <Tooltip title="Tối đa 20 dòng cho một lần thêm">
              <InputNumber
                precision={0}
                min={1}
                max={20}
                value={moreRowCount}
                onChange={onMoreRowCountChanged}
              />
            </Tooltip>
            <span>dòng</span>
            <Divider type="vertical" />
            <Button danger onClick={onDeleteSelectedRows}>
              Xóa dòng đang chọn
            </Button>
          </Space>
        )}
        <ReactDataSheet
          ref={ref}
          data={quotationSheet}
          valueRenderer={(cell: any) => cell.value}
          onCellsChanged={onCellChange}
          onContextMenu={(e, cell, i, j) =>
            cell.readOnly ? e.preventDefault() : null
          }
          onSelect={onSheetSelectionChanged}
        />
      </>
    );
  },
);

QuotationSheet.defaultProps = {
  isReadOnly: false,
};
export default memo(QuotationSheet);
