import React, { useState } from 'react';
import ProtocolLabel from 'Activity/Queue/ProtocolLabel.tsx';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookFormats from 'Book/BookFormats';
import BookQuality from 'Book/BookQuality';
import BookTitleLink from 'Book/BookTitleLink';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import ProgressBar from 'Components/ProgressBar';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';
import QueueStatusCell from './QueueStatusCell.tsx';
import RemoveQueueItemModal from './RemoveQueueItemModal.tsx';
import TimeleftCell from './TimeleftCell.tsx';

interface Author {
  titleSlug: string;
  authorName: string;
}

interface Book {
  titleSlug: string;
  title: string;
  disambiguation?: string;
  releaseDate?: string;
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

interface StatusMessage {
  title: string;
  messages: string[];
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface QueueRowProps {
  id: number;
  downloadId: string;
  title: string;
  status: string;
  trackedDownloadStatus?: string;
  trackedDownloadState?: string;
  statusMessages?: StatusMessage[];
  errorMessage?: string;
  author?: Author;
  book?: Book;
  quality: Quality;
  customFormats: CustomFormat[];
  customFormatScore: number;
  protocol: string;
  indexer?: string;
  outputPath?: string;
  downloadClient?: string;
  downloadClientHasPostImportCategory?: boolean;
  downloadForced: boolean;
  estimatedCompletionTime?: string;
  timeleft?: string;
  size: number;
  sizeleft: number;
  showRelativeDates: boolean;
  shortDateFormat: string;
  timeFormat: string;
  isGrabbing: boolean;
  grabError?: any;
  isRemoving: boolean;
  isSelected: boolean;
  columns: Column[];
  onSelectedChange: (options: { id: number; value: boolean }) => void;
  onGrabPress: () => void;
  onRemoveQueueItemPress: (blocklist: boolean, skipRedownload: boolean) => void;
  onQueueRowModalOpenOrClose: (isOpen: boolean) => void;
}

function QueueRow(props: QueueRowProps) {
  const {
    id,
    downloadId,
    title,
    status,
    trackedDownloadStatus,
    trackedDownloadState,
    statusMessages,
    errorMessage,
    author,
    book,
    quality,
    customFormats,
    customFormatScore,
    protocol,
    indexer,
    outputPath,
    downloadClient,
    downloadClientHasPostImportCategory,
    downloadForced,
    estimatedCompletionTime,
    timeleft,
    size,
    sizeleft,
    showRelativeDates,
    shortDateFormat,
    timeFormat,
    isGrabbing,
    grabError,
    isRemoving,
    isSelected,
    columns,
    onSelectedChange,
    onGrabPress,
    onRemoveQueueItemPress: onRemoveQueueItemPressProp,
    onQueueRowModalOpenOrClose
  } = props;

  const [isRemoveQueueItemModalOpen, setIsRemoveQueueItemModalOpen] = useState(false);
  const [isInteractiveImportModalOpen, setIsInteractiveImportModalOpen] = useState(false);

  const progress = 100 - (sizeleft / size * 100);
  const showInteractiveImport = status === 'completed' && trackedDownloadStatus === 'warning';
  const isPending = status === 'delay' || status === 'downloadClientUnavailable';

  const handleRemoveQueueItemPress = () => {
    onQueueRowModalOpenOrClose(true);
    setIsRemoveQueueItemModalOpen(true);
  };

  const handleRemoveQueueItemModalConfirmed = (blocklist: boolean, skipRedownload: boolean) => {
    onQueueRowModalOpenOrClose(false);
    onRemoveQueueItemPressProp(blocklist, skipRedownload);
    setIsRemoveQueueItemModalOpen(false);
  };

  const handleRemoveQueueItemModalClose = () => {
    onQueueRowModalOpenOrClose(false);
    setIsRemoveQueueItemModalOpen(false);
  };

  const handleInteractiveImportPress = () => {
    onQueueRowModalOpenOrClose(true);
    setIsInteractiveImportModalOpen(true);
  };

  const handleInteractiveImportModalClose = () => {
    onQueueRowModalOpenOrClose(false);
    setIsInteractiveImportModalOpen(false);
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

          if (name === 'status') {
            return (
              <QueueStatusCell
                key={name}
                sourceTitle={title}
                status={status}
                trackedDownloadStatus={trackedDownloadStatus}
                trackedDownloadState={trackedDownloadState}
                statusMessages={statusMessages}
                errorMessage={errorMessage}
              />
            );
          }

          if (name === 'authorMetadata.sortName') {
            return (
              <TableRowCell key={name}>
                {
                  author ?
                    <AuthorNameLink
                      titleSlug={author.titleSlug}
                      authorName={author.authorName}
                    /> :
                    title
                }
              </TableRowCell>
            );
          }

          if (name === 'books.title') {
            return (
              <TableRowCell key={name}>
                {
                  book ?
                    <BookTitleLink
                      titleSlug={book.titleSlug}
                      title={book.title}
                      disambiguation={book.disambiguation}
                    /> :
                    '-'
                }
              </TableRowCell>
            );
          }

          if (name === 'books.releaseDate') {
            if (book) {
              return (
                <RelativeDateCellConnector
                  key={name}
                  date={book.releaseDate}
                />
              );
            }

            return (
              <TableRowCell key={name}>
                -
              </TableRowCell>
            );
          }

          if (name === 'quality') {
            return (
              <TableRowCell key={name}>
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

          if (name === 'protocol') {
            return (
              <TableRowCell key={name}>
                <ProtocolLabel
                  protocol={protocol}
                />
              </TableRowCell>
            );
          }

          if (name === 'indexer') {
            return (
              <TableRowCell key={name}>
                {indexer}
              </TableRowCell>
            );
          }

          if (name === 'downloadClient') {
            return (
              <TableRowCell key={name}>
                {downloadClient}
              </TableRowCell>
            );
          }

          if (name === 'title') {
            return (
              <TableRowCell key={name}>
                {title}
              </TableRowCell>
            );
          }

          if (name === 'size') {
            return (
              <TableRowCell key={name}>{formatBytes(size)}</TableRowCell>
            );
          }

          if (name === 'outputPath') {
            return (
              <TableRowCell key={name}>
                {outputPath}
              </TableRowCell>
            );
          }

          if (name === 'estimatedCompletionTime') {
            return (
              <TimeleftCell
                key={name}
                status={status}
                estimatedCompletionTime={estimatedCompletionTime}
                timeleft={timeleft}
                size={size}
                sizeleft={sizeleft}
                showRelativeDates={showRelativeDates}
                shortDateFormat={shortDateFormat}
                timeFormat={timeFormat}
              />
            );
          }

          if (name === 'progress') {
            return (
              <TableRowCell
                key={name}
                className="w-[150px]"
              >
                {
                  !!progress &&
                    <ProgressBar
                      progress={progress}
                      title={`${progress.toFixed(1)}%`}
                    />
                }
              </TableRowCell>
            );
          }

          if (name === 'actions') {
            return (
              <TableRowCell
                key={name}
                className="w-[90px]"
              >
                {
                  downloadForced &&
                    <Popover
                      anchor={
                        <Icon
                          name={icons.DANGER}
                          kind={kinds.DANGER}
                        />
                      }
                      title={translate('ManualDownload')}
                      body="This release failed parsing checks and was manually downloaded from an interactive search.  Import is likely to fail."
                      position={tooltipPositions.LEFT}
                    />
                }

                {
                  showInteractiveImport &&
                    <IconButton
                      name={icons.INTERACTIVE}
                      onPress={handleInteractiveImportPress}
                    />
                }

                {
                  isPending &&
                    <SpinnerIconButton
                      name={icons.DOWNLOAD}
                      kind={grabError ? kinds.DANGER : kinds.DEFAULT}
                      isSpinning={isGrabbing}
                      onPress={onGrabPress}
                    />
                }

                <SpinnerIconButton
                  title={translate('RemoveFromQueue')}
                  name={icons.REMOVE}
                  isSpinning={isRemoving}
                  onPress={handleRemoveQueueItemPress}
                />
              </TableRowCell>
            );
          }

          return null;
        })
      }

      <InteractiveImportModal
        isOpen={isInteractiveImportModalOpen}
        downloadId={downloadId}
        title={title}
        onModalClose={handleInteractiveImportModalClose}
        showReplaceExistingFiles={true}
        replaceExistingFiles={true}
      />

      <RemoveQueueItemModal
        isOpen={isRemoveQueueItemModalOpen}
        sourceTitle={title}
        canChangeCategory={!!downloadClientHasPostImportCategory}
        canIgnore={!!author}
        isPending={isPending}
        onRemovePress={handleRemoveQueueItemModalConfirmed}
        onModalClose={handleRemoveQueueItemModalClose}
      />
    </TableRow>
  );
}

export default QueueRow;
