import React from 'react';
import formatTime from 'Utilities/Date/formatTime';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { TableCell } from 'ComponentsV2/UI';

interface TimeleftCellProps {
  estimatedCompletionTime?: string;
  timeleft?: string;
  status: string;
  size: number;
  sizeleft: number;
  showRelativeDates: boolean;
  shortDateFormat: string;
  timeFormat: string;
}

function TimeleftCell(props: TimeleftCellProps) {
  const {
    estimatedCompletionTime,
    timeleft,
    status,
    size,
    sizeleft,
    showRelativeDates,
    shortDateFormat,
    timeFormat,
  } = props;

  if (status === 'delay') {
    const date = getRelativeDate(estimatedCompletionTime!, shortDateFormat, showRelativeDates);
    const time = formatTime(estimatedCompletionTime!, timeFormat, { includeMinuteZero: true });

    return (
      <TableCell
        className="w-24"
        title={translate('DelayingDownloadUntilInterp', [date, time])}
      >
        -
      </TableCell>
    );
  }

  if (status === 'downloadClientUnavailable') {
    const date = getRelativeDate(estimatedCompletionTime!, shortDateFormat, showRelativeDates);
    const time = formatTime(estimatedCompletionTime!, timeFormat, { includeMinuteZero: true });

    return (
      <TableCell
        className="w-24"
        title={translate('RetryingDownloadInterp', [date, time])}
      >
        -
      </TableCell>
    );
  }

  if (!timeleft || status === 'completed' || status === 'failed') {
    return <TableCell className="w-24">-</TableCell>;
  }

  const totalSize = formatBytes(size);
  const remainingSize = formatBytes(sizeleft);

  return (
    <TableCell className="w-24" title={`${remainingSize} / ${totalSize}`}>
      {formatTimeSpan(timeleft)}
    </TableCell>
  );
}

export default TimeleftCell;
