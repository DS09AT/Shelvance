import React, { useState } from 'react';
import BookQuality from 'Book/BookQuality';
import FileDetailsModal from 'BookFile/FileDetailsModal';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import { icons, kinds } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

interface Quality {
  quality: {
    id: number;
    name: string;
  };
  revision: {
    version: number;
    real: number;
  };
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface UnmappedFilesTableRowProps {
  id: number;
  path: string;
  size: number;
  quality: Quality;
  dateAdded: string;
  columns: Column[];
  isSelected?: boolean;
  onSelectedChange: (id: number, selected: boolean) => void;
  deleteUnmappedFile: (id: number) => void;
}

const columnStyles: Record<string, string> = {
  path: 'flex-[4_0_400px] text-[13px] font-mono',
  quality: 'flex-[0_0_120px] whitespace-nowrap',
  dateAdded: 'flex-[0_0_120px] whitespace-nowrap',
  size: 'flex-[0_0_120px] whitespace-nowrap',
  actions: 'flex-[0_0_100px]'
};

function UnmappedFilesTableRow(props: UnmappedFilesTableRowProps) {
  const {
    id,
    path,
    size,
    dateAdded,
    quality,
    columns,
    isSelected,
    onSelectedChange,
    deleteUnmappedFile
  } = props;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isInteractiveImportModalOpen, setIsInteractiveImportModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  const folder = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')));

  const handleConfirmDelete = () => {
    setIsConfirmDeleteModalOpen(false);
    deleteUnmappedFile(id);
  };

  return (
    <>
      {columns.map((column) => {
        const { name, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'select') {
          return (
            <VirtualTableSelectCell
              inputClassName="mt-0"
              id={id}
              key={name}
              isSelected={isSelected}
              isDisabled={false}
              onSelectedChange={onSelectedChange}
            />
          );
        }

        if (name === 'path') {
          return (
            <VirtualTableRowCell
              key={name}
              className={columnStyles[name]}
            >
              {path}
            </VirtualTableRowCell>
          );
        }

        if (name === 'size') {
          return (
            <VirtualTableRowCell
              key={name}
              className={columnStyles[name]}
            >
              {formatBytes(size)}
            </VirtualTableRowCell>
          );
        }

        if (name === 'dateAdded') {
          return (
            <RelativeDateCellConnector
              key={name}
              className={columnStyles[name]}
              date={dateAdded}
              component={VirtualTableRowCell}
            />
          );
        }

        if (name === 'quality') {
          return (
            <VirtualTableRowCell
              key={name}
              className={columnStyles[name]}
            >
              <BookQuality quality={quality} />
            </VirtualTableRowCell>
          );
        }

        if (name === 'actions') {
          return (
            <VirtualTableRowCell
              key={name}
              className={columnStyles[name]}
            >
              <IconButton
                name={icons.INFO}
                onPress={() => setIsDetailsModalOpen(true)}
              />

              <IconButton
                name={icons.INTERACTIVE}
                onPress={() => setIsInteractiveImportModalOpen(true)}
              />

              <IconButton
                name={icons.DELETE}
                onPress={() => setIsConfirmDeleteModalOpen(true)}
              />
            </VirtualTableRowCell>
          );
        }

        return null;
      })}

      <InteractiveImportModal
        isOpen={isInteractiveImportModalOpen}
        folder={folder}
        showFilterExistingFiles={true}
        filterExistingFiles={false}
        showImportMode={false}
        showReplaceExistingFiles={false}
        replaceExistingFiles={false}
        onModalClose={() => setIsInteractiveImportModalOpen(false)}
      />

      <FileDetailsModal
        isOpen={isDetailsModalOpen}
        onModalClose={() => setIsDetailsModalOpen(false)}
        id={id}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteBookFile')}
        message={translate('DeleteBookFileMessageText', [path])}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteModalOpen(false)}
      />
    </>
  );
}

export default UnmappedFilesTableRow;
