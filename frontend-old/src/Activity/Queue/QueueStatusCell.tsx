import React from 'react';
import Icon from 'Components/Icon';
import Popover from 'Components/Tooltip/Popover';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { TableCell } from 'ComponentsV2/UI';

interface StatusMessage {
  title: string;
  messages: string[];
}

interface QueueStatusCellProps {
  sourceTitle: string;
  status: string;
  trackedDownloadStatus?: string;
  trackedDownloadState?: string;
  statusMessages?: StatusMessage[];
  errorMessage?: string;
}

function getDetailedPopoverBody(statusMessages: StatusMessage[]) {
  return (
    <div>
      {statusMessages.map(({ title, messages }) => {
        return (
          <div key={title}>
            {title}
            <ul>
              {messages.map((message) => {
                return <li key={message}>{message}</li>;
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function QueueStatusCell(props: QueueStatusCellProps) {
  const {
    sourceTitle,
    status,
    trackedDownloadStatus = 'Ok',
    trackedDownloadState = 'Downloading',
    statusMessages,
    errorMessage,
  } = props;

  const hasWarning = trackedDownloadStatus === 'warning';
  const hasError = trackedDownloadStatus === 'error';

  let iconName = icons.DOWNLOADING;
  let iconKind = kinds.DEFAULT;
  let title = translate('Title');

  if (status === 'paused') {
    iconName = icons.PAUSED;
    title = 'Paused';
  }

  if (status === 'queued') {
    iconName = icons.QUEUED;
    title = 'Queued';
  }

  if (status === 'completed') {
    iconName = icons.DOWNLOADED;
    title = 'Downloaded';

    if (trackedDownloadState === 'importPending') {
      title += ' - Waiting to Import';
      iconKind = kinds.PURPLE;
    }

    if (trackedDownloadState === 'importing') {
      title += ' - Importing';
      iconKind = kinds.PURPLE;
    }

    if (trackedDownloadState === 'failedPending') {
      title += ' - Waiting to Process';
      iconKind = kinds.DANGER;
    }
  }

  if (hasWarning) {
    iconKind = kinds.WARNING;
  }

  if (status === 'delay') {
    iconName = icons.PENDING;
    title = 'Pending';
  }

  if (status === 'downloadClientUnavailable') {
    iconName = icons.PENDING;
    iconKind = kinds.WARNING;
    title = 'Pending - Download client is unavailable';
  }

  if (status === 'failed') {
    iconName = icons.DOWNLOADING;
    iconKind = kinds.DANGER;
    title = 'Download failed';
  }

  if (status === 'warning') {
    iconName = icons.DOWNLOADING;
    iconKind = kinds.WARNING;
    title = `Download warning: ${errorMessage || 'check download client for more details'}`;
  }

  if (hasError) {
    if (status === 'completed') {
      iconName = icons.DOWNLOAD;
      iconKind = kinds.DANGER;
      title = `Import failed: ${sourceTitle}`;
    } else {
      iconName = icons.DOWNLOADING;
      iconKind = kinds.DANGER;
      title = 'Download failed';
    }
  }

  return (
    <TableCell className="w-8">
      <Popover
        anchor={<Icon name={iconName} kind={iconKind} />}
        title={title}
        body={hasWarning || hasError ? getDetailedPopoverBody(statusMessages!) : sourceTitle}
        position={tooltipPositions.RIGHT}
        canFlip={false}
      />
    </TableCell>
  );
}

export default QueueStatusCell;
