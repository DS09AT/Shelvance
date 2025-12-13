import React, { useState, useEffect } from 'react';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookFormats from 'Book/BookFormats';
import BookQuality from 'Book/BookQuality';
import BookTitleLink from 'Book/BookTitleLink';
import IconButton from 'Components/Link/IconButton';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, tooltipPositions } from 'Helpers/Props';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import HistoryDetailsModal from './Details/HistoryDetailsModal';
import HistoryEventTypeCell from './HistoryEventTypeCell.tsx';

interface Author {
  titleSlug: string;
  authorName: string;
}

interface Book {
  titleSlug: string;
  title: string;
  disambiguation?: string;
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

interface HistoryData {
  downloadClient?: string;
  indexer?: string;
  releaseGroup?: string;
  [key: string]: any;
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface HistoryRowProps {
  author: Author;
  book: Book;
  quality: Quality;
  customFormats: CustomFormat[];
  customFormatScore: number;
  qualityCutoffNotMet: boolean;
  eventType: string;
  sourceTitle: string;
  date: string;
  data: HistoryData;
  isMarkingAsFailed: boolean;
  markAsFailedError?: any;
  columns: Column[];
  shortDateFormat: string;
  timeFormat: string;
  onMarkAsFailedPress: () => void;
}

function HistoryRow(props: HistoryRowProps) {
  const {
    author,
    book,
    quality,
    customFormats,
    customFormatScore,
    qualityCutoffNotMet,
    eventType,
    sourceTitle,
    date,
    data,
    isMarkingAsFailed,
    markAsFailedError,
    columns,
    shortDateFormat,
    timeFormat,
    onMarkAsFailedPress
  } = props;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (isMarkingAsFailed === false && !markAsFailedError && isDetailsModalOpen) {
      setIsDetailsModalOpen(false);
    }
  }, [isMarkingAsFailed, markAsFailedError, isDetailsModalOpen]);

  if (!author || !book) {
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
      {
        columns.map((column) => {
          const {
            name,
            isVisible
          } = column;

          if (!isVisible) {
            return null;
          }

          if (name === 'eventType') {
            return (
              <HistoryEventTypeCell
                key={name}
                eventType={eventType}
                data={data}
              />
            );
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

          if (name === 'books.title') {
            return (
              <TableRowCell key={name}>
                <BookTitleLink
                  titleSlug={book.titleSlug}
                  title={book.title}
                  disambiguation={book.disambiguation}
                />
              </TableRowCell>
            );
          }

          if (name === 'quality') {
            return (
              <TableRowCell key={name}>
                <BookQuality
                  quality={quality}
                  isCutoffMet={qualityCutoffNotMet}
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

          if (name === 'downloadClient') {
            return (
              <TableRowCell
                key={name}
                className="w-[120px]"
              >
                {data.downloadClient}
              </TableRowCell>
            );
          }

          if (name === 'indexer') {
            return (
              <TableRowCell
                key={name}
                className="w-20"
              >
                {data.indexer}
              </TableRowCell>
            );
          }

          if (name === 'customFormatScore') {
            return (
              <TableRowCell
                key={name}
                className="w-[55px]"
              >
                <Tooltip
                  anchor={formatCustomFormatScore(
                    customFormatScore,
                    customFormats.length
                  )}
                  tooltip={<BookFormats formats={customFormats} />}
                  position={tooltipPositions.BOTTOM}
                />
              </TableRowCell>
            );
          }

          if (name === 'releaseGroup') {
            return (
              <TableRowCell
                key={name}
                className="w-[110px]"
              >
                {data.releaseGroup}
              </TableRowCell>
            );
          }

          if (name === 'sourceTitle') {
            return (
              <TableRowCell
                key={name}
              >
                {sourceTitle}
              </TableRowCell>
            );
          }

          if (name === 'details') {
            return (
              <TableRowCell
                key={name}
                className="w-[30px]"
              >
                <div className="flex items-center">
                  <IconButton
                    name={icons.INFO}
                    onPress={handleDetailsPress}
                  />
                </div>
              </TableRowCell>
            );
          }

          return null;
        })
      }

      <HistoryDetailsModal
        isOpen={isDetailsModalOpen}
        eventType={eventType}
        sourceTitle={sourceTitle}
        data={data}
        isMarkingAsFailed={isMarkingAsFailed}
        shortDateFormat={shortDateFormat}
        timeFormat={timeFormat}
        onMarkAsFailedPress={onMarkAsFailedPress}
        onModalClose={handleDetailsModalClose}
      />
    </TableRow>
  );
}

export default HistoryRow;
