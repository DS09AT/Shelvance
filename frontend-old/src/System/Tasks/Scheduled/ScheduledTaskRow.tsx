import moment from 'moment';
import React, { Component } from 'react';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import { icons } from 'Helpers/Props';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import { TableRow, TableCell } from 'ComponentsV2/UI';

interface FormattedDates {
  lastExecutionTime: string;
  nextExecutionTime: string;
}

interface ScheduledTaskRowProps {
  name: string;
  interval: number;
  lastExecution: string;
  lastStartTime: string;
  lastDuration: string;
  nextExecution: string;
  isQueued: boolean;
  isExecuting: boolean;
  showRelativeDates: boolean;
  shortDateFormat: string;
  longDateFormat: string;
  timeFormat: string;
  onExecutePress: () => void;
}

interface ScheduledTaskRowState extends FormattedDates {}

function getFormattedDates(props: ScheduledTaskRowProps): FormattedDates {
  const {
    lastExecution,
    nextExecution,
    interval,
    showRelativeDates,
    shortDateFormat,
  } = props;

  const isDisabled = interval === 0;

  if (showRelativeDates) {
    return {
      lastExecutionTime: moment(lastExecution).fromNow(),
      nextExecutionTime: isDisabled ? '-' : moment(nextExecution).fromNow(),
    };
  }

  return {
    lastExecutionTime: formatDate(lastExecution, shortDateFormat),
    nextExecutionTime: isDisabled ? '-' : formatDate(nextExecution, shortDateFormat),
  };
}

class ScheduledTaskRow extends Component<ScheduledTaskRowProps, ScheduledTaskRowState> {
  private _updateTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ScheduledTaskRowProps) {
    super(props);

    this.state = getFormattedDates(props);
  }

  componentDidMount() {
    this.setUpdateTimer();
  }

  componentDidUpdate(prevProps: ScheduledTaskRowProps) {
    const { lastExecution, nextExecution } = this.props;

    if (
      lastExecution !== prevProps.lastExecution ||
      nextExecution !== prevProps.nextExecution
    ) {
      this.setState(getFormattedDates(this.props));
    }
  }

  componentWillUnmount() {
    if (this._updateTimeoutId) {
      clearTimeout(this._updateTimeoutId);
      this._updateTimeoutId = null;
    }
  }

  setUpdateTimer() {
    const { interval } = this.props;
    const timeout = interval < 60 ? 10000 : 60000;

    this._updateTimeoutId = setTimeout(() => {
      this.setState(getFormattedDates(this.props));
      this.setUpdateTimer();
    }, timeout);
  }

  render() {
    const {
      name,
      interval,
      lastExecution,
      lastStartTime,
      lastDuration,
      nextExecution,
      isQueued,
      isExecuting,
      longDateFormat,
      timeFormat,
      onExecutePress,
    } = this.props;

    const { lastExecutionTime, nextExecutionTime } = this.state;

    const isDisabled = interval === 0;
    const executeNow = !isDisabled && moment().isAfter(nextExecution);
    const hasNextExecutionTime = !isDisabled && !executeNow;
    const duration = moment
      .duration(interval, 'minutes')
      .humanize()
      .replace(/an?(?=\s)/, '1');
    const hasLastStartTime = moment(lastStartTime).isAfter('2010-01-01');

    return (
      <TableRow>
        <TableCell>{name}</TableCell>
        
        <TableCell className="w-36">
          {isDisabled ? 'disabled' : duration}
        </TableCell>

        <TableCell
          className="w-44"
          title={formatDateTime(lastExecution, longDateFormat, timeFormat)}
        >
          {lastExecutionTime}
        </TableCell>

        {!hasLastStartTime && <TableCell className="w-44">-</TableCell>}

        {hasLastStartTime && (
          <TableCell className="w-44" title={lastDuration}>
            {formatTimeSpan(lastDuration)}
          </TableCell>
        )}

        {isDisabled && <TableCell className="w-44">-</TableCell>}

        {executeNow && isQueued && <TableCell className="w-44">queued</TableCell>}

        {executeNow && !isQueued && <TableCell className="w-44">now</TableCell>}

        {hasNextExecutionTime && (
          <TableCell
            className="w-44"
            title={formatDateTime(nextExecution, longDateFormat, timeFormat, {
              includeSeconds: true,
            })}
          >
            {nextExecutionTime}
          </TableCell>
        )}

        <TableCell className="w-5">
          <SpinnerIconButton
            name={icons.REFRESH}
            spinningName={icons.REFRESH}
            isSpinning={isExecuting}
            onPress={onExecutePress}
          />
        </TableCell>
      </TableRow>
    );
  }
}

export default ScheduledTaskRow;
