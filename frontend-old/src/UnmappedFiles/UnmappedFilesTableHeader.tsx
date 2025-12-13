import React from 'react';
import IconButton from 'Components/Link/IconButton';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import { icons } from 'Helpers/Props';

interface Column {
  name: string;
  label?: string;
  isSortable?: boolean;
  isVisible: boolean;
}

interface UnmappedFilesTableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  allUnselected: boolean;
  onSelectAllChange: (selected: boolean) => void;
  onTableOptionChange: (payload: unknown) => void;
}

const columnStyles: Record<string, string> = {
  quality: 'flex-[0_0_120px]',
  size: 'flex-[0_0_120px]',
  dateAdded: 'flex-[0_0_120px]',
  path: 'flex-[4_0_400px]',
  actions: 'flex-[0_1_100px]'
};

function UnmappedFilesTableHeader(props: UnmappedFilesTableHeaderProps) {
  const {
    columns,
    onTableOptionChange,
    allSelected,
    allUnselected,
    onSelectAllChange,
    ...otherProps
  } = props;

  return (
    <VirtualTableHeader>
      {columns.map((column) => {
        const {
          name,
          label,
          isSortable,
          isVisible
        } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'select') {
          return (
            <VirtualTableSelectAllHeaderCell
              key={name}
              allSelected={allSelected}
              allUnselected={allUnselected}
              onSelectAllChange={onSelectAllChange}
            />
          );
        }

        if (name === 'actions') {
          return (
            <VirtualTableHeaderCell
              key={name}
              className={columnStyles[name]}
              name={name}
              isSortable={false}
              {...otherProps}
            >
              <TableOptionsModalWrapper
                columns={columns}
                onTableOptionChange={onTableOptionChange}
              >
                <IconButton
                  name={icons.ADVANCED_SETTINGS}
                />
              </TableOptionsModalWrapper>
            </VirtualTableHeaderCell>
          );
        }

        return (
          <VirtualTableHeaderCell
            key={name}
            className={columnStyles[name]}
            name={name}
            isSortable={isSortable}
            {...otherProps}
          >
            {label}
          </VirtualTableHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default UnmappedFilesTableHeader;
