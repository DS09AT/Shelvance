import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CommandBody } from 'Commands/Command';
import { AppDispatch } from 'Store/types';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import { cancelCommand } from 'Store/Actions/commandActions';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import { TableRow, TableCell } from 'ComponentsV2/UI';
import QueuedTaskRowNameCell from './QueuedTaskRowNameCell';

function getStatusIconProps(status: string, message: string | undefined) {
  const title = titleCase(status);

  switch (status) {
    case 'queued':
      return {
        name: icons.PENDING,
        title,
      };

    case 'started':
      return {
        name: icons.REFRESH,
        isSpinning: true,
        title,
      };

    case 'completed':
      return {
        name: icons.CHECK,
        kind: kinds.SUCCESS,
        title: message === 'Completed' ? title : `${title}: ${message}`,
      };

    case 'failed':
      return {
        name: icons.FATAL,
        kind: kinds.DANGER,
        title: `${title}: ${message}`,
      };

    default:
      return {
        name: icons.UNKNOWN,
        title,
      };
  }
}

function getFormattedDates(
  queued: string,
  started: string | undefined,
  ended: string | undefined,
  showRelativeDates: boolean,
  shortDateFormat: string
) {
  if (showRelativeDates) {
    return {
      queuedAt: moment(queued).fromNow(),
      startedAt: started ? moment(started).fromNow() : '-',
      endedAt: ended ? moment(ended).fromNow() : '-',
    };
  }

  return {
    queuedAt: formatDate(queued, shortDateFormat),
    startedAt: started ? formatDate(started, shortDateFormat) : '-',
    endedAt: ended ? formatDate(ended, shortDateFormat) : '-',
  };
}

interface QueuedTimes {
  queuedAt: string;
  startedAt: string;
  endedAt: string;
}

export interface QueuedTaskRowProps {
  id: number;
  trigger: string;
  commandName: string;
  queued: string;
  started?: string;
  ended?: string;
  status: string;
  duration?: string;
  message?: string;
  body: CommandBody;
  clientUserAgent?: string;
}

export default function QueuedTaskRow(props: QueuedTaskRowProps) {
  const {
    id,
    trigger,
    commandName,
    queued,
    started,
    ended,
    status,
    duration,
    message,
    body,
    clientUserAgent,
  } = props;

  const dispatch = useDispatch<AppDispatch>();
  const { longDateFormat, shortDateFormat, showRelativeDates, timeFormat } =
    useSelector(createUISettingsSelector());

  const updateTimeTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [times, setTimes] = useState<QueuedTimes>(
    getFormattedDates(
      queued,
      started,
      ended,
      showRelativeDates,
      shortDateFormat
    )
  );

  const [
    isCancelConfirmModalOpen,
    openCancelConfirmModal,
    closeCancelConfirmModal,
  ] = useModalOpenState(false);

  const handleCancelPress = useCallback(() => {
    dispatch(cancelCommand({ id }));
  }, [id, dispatch]);

  useEffect(() => {
    updateTimeTimeoutId.current = setTimeout(() => {
      setTimes(
        getFormattedDates(
          queued,
          started,
          ended,
          showRelativeDates,
          shortDateFormat
        )
      );
    }, 30000);

    return () => {
      if (updateTimeTimeoutId.current) {
        clearTimeout(updateTimeTimeoutId.current);
      }
    };
  }, [queued, started, ended, showRelativeDates, shortDateFormat, setTimes]);

  const { queuedAt, startedAt, endedAt } = times;

  let triggerIcon = icons.QUICK;

  if (trigger === 'manual') {
    triggerIcon = icons.INTERACTIVE;
  } else if (trigger === 'scheduled') {
    triggerIcon = icons.SCHEDULED;
  }

  return (
    <TableRow>
      <TableCell className="w-12">
        <div className="flex w-full items-center justify-between">
          <Icon name={triggerIcon} title={titleCase(trigger)} />
          <Icon {...getStatusIconProps(status, message)} />
        </div>
      </TableCell>

      <QueuedTaskRowNameCell
        commandName={commandName}
        body={body}
        clientUserAgent={clientUserAgent}
      />

      <TableCell
        className="w-44"
        title={formatDateTime(queued, longDateFormat, timeFormat)}
      >
        {queuedAt}
      </TableCell>

      <TableCell
        className="w-44"
        title={formatDateTime(started, longDateFormat, timeFormat)}
      >
        {startedAt}
      </TableCell>

      <TableCell
        className="w-44"
        title={formatDateTime(ended, longDateFormat, timeFormat)}
      >
        {endedAt}
      </TableCell>

      <TableCell className="w-24">
        {formatTimeSpan(duration)}
      </TableCell>

      <TableCell className="w-14">
        {status === 'queued' && (
          <IconButton
            title={translate('RemovedFromTaskQueue')}
            name={icons.REMOVE}
            onPress={openCancelConfirmModal}
          />
        )}
      </TableCell>

      <ConfirmModal
        isOpen={isCancelConfirmModalOpen}
        kind={kinds.DANGER}
        title={translate('Cancel')}
        message={translate('CancelPendingTask')}
        confirmLabel={translate('YesCancel')}
        cancelLabel={translate('NoLeaveIt')}
        onConfirm={handleCancelPress}
        onCancel={closeCancelConfirmModal}
      />
    </TableRow>
  );
}
