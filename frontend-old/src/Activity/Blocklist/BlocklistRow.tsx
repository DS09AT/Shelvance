import React, { useState } from 'react';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookFormats from 'Book/BookFormats';
import BookQuality from 'Book/BookQuality';
import IconButton from 'Components/Link/IconButton';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import BlocklistDetailsModal from './BlocklistDetailsModal';

interface Author {
  titleSlug: string;
  authorName: string;
}

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

interface CustomFormat {
  id: number;
  name: string;
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface BlocklistRowProps {
  id: number;
  author: Author;
  sourceTitle: string;
  quality: Quality;
  customFormats: CustomFormat[];
  date: string;
  protocol: string;
  indexer?: string;
  message?: string;
  isSelected: boolean;
  columns: Column[];
  onSelectedChange: (options: { id: number; value: boolean }) => void;
  onRemovePress: () => void;
}

function BlocklistRow(props: BlocklistRowProps) {
  const {
    id,
    author,
    sourceTitle,
    quality,
    customFormats,
    date,
    protocol,
    indexer,
    message,
    isSelected,
    columns,
    onSelectedChange,
    onRemovePress
  } = props;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  if (!author) {
    return null;
  }

  const handleDetailsPress = () => {
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
  };

  return (
    <TableRow>
      <TableSelectCell
        id={id}
        isSelected={isSelected}
        onSelectedChange={onSelectedChange}
      />

      {
        columns.map((column) => {
          const {
            name,
            isVisible
          } = column;

          if (!isVisible) {
            return null;
          }

          if (name === 'authorMetadata.sortName') {
            return (
              <TableRowCell key={name}>
                <AuthorNameLink
                  titleSlug={author.titleSlug}
                  authorName={author.authorName}
                />
              </TableRowCell>
            );
          }

          if (name === 'sourceTitle') {
            return (
              <TableRowCell key={name}>
                {sourceTitle}
              </TableRowCell>
            );
          }

          if (name === 'quality') {
            return (
              <TableRowCell
                key={name}
                className="w-[100px]"
              >
                <BookQuality
                  quality={quality}
                />
              </TableRowCell>
            );
          }

          if (name === 'customFormats') {
            return (
              <TableRowCell key={name}>
                <BookFormats
                  formats={customFormats}
                />
              </TableRowCell>
            );
          }

          if (name === 'date') {
            return (
              <RelativeDateCellConnector
                key={name}
                date={date}
              />
            );
          }

          if (name === 'indexer') {
            return (
              <TableRowCell
                key={name}
                className="w-20"
              >
                {indexer}
              </TableRowCell>
            );
          }

          if (name === 'actions') {
            return (
              <TableRowCell
                key={name}
                className="w-[70px]"
              >
                <IconButton
                  name={icons.INFO}
                  onPress={handleDetailsPress}
                />

                <IconButton
                  title={translate('RemoveFromBlocklist')}
                  name={icons.REMOVE}
                  kind={kinds.DANGER}
                  onPress={onRemovePress}
                />
              </TableRowCell>
            );
          }

          return null;
        })
      }

      <BlocklistDetailsModal
        isOpen={isDetailsModalOpen}
        sourceTitle={sourceTitle}
        protocol={protocol}
        indexer={indexer}
        message={message}
        onModalClose={handleDetailsModalClose}
      />
    </TableRow>
  );
}

export default BlocklistRow;
