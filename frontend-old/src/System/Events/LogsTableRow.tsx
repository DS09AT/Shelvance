import React, { Component } from 'react';
import Icon from 'Components/Icon';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowButton from 'Components/Table/TableRowButton';
import { icons } from 'Helpers/Props';
import { TableCell } from 'ComponentsV2/UI';
import LogsTableDetailsModal from './LogsTableDetailsModal';

function getIconName(level: string) {
  switch (level) {
    case 'trace':
    case 'debug':
    case 'info':
      return icons.INFO;
    case 'warn':
      return icons.DANGER;
    case 'error':
      return icons.BUG;
    case 'fatal':
      return icons.FATAL;
    default:
      return icons.UNKNOWN;
  }
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'info':
      return 'text-blue-500 dark:text-blue-400';
    case 'debug':
      return 'text-zinc-500 dark:text-zinc-400';
    case 'trace':
      return 'text-zinc-400 dark:text-zinc-500';
    case 'warn':
      return 'text-amber-500 dark:text-amber-400';
    case 'error':
      return 'text-red-500 dark:text-red-400';
    case 'fatal':
      return 'text-purple-500 dark:text-purple-400';
    default:
      return 'text-zinc-700 dark:text-zinc-300';
  }
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface LogsTableRowProps {
  level: string;
  time: string;
  logger: string;
  message: string;
  exception?: string;
  columns: Column[];
}

interface LogsTableRowState {
  isDetailsModalOpen: boolean;
}

class LogsTableRow extends Component<LogsTableRowProps, LogsTableRowState> {
  constructor(props: LogsTableRowProps) {
    super(props);

    this.state = {
      isDetailsModalOpen: false,
    };
  }

  onPress = () => {
    if (!this.state.isDetailsModalOpen) {
      this.setState({ isDetailsModalOpen: true });
    }
  };

  onModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  render() {
    const { level, time, logger, message, exception, columns } = this.props;

    return (
      <TableRowButton onPress={this.onPress}>
        {columns.map((column) => {
          const { name, isVisible } = column;

          if (!isVisible) {
            return null;
          }

          if (name === 'level') {
            return (
              <TableCell key={name} className="w-5">
                <Icon
                  className={getLevelColor(level)}
                  name={getIconName(level)}
                  title={level}
                />
              </TableCell>
            );
          }

          if (name === 'time') {
            return <RelativeDateCellConnector key={name} date={time} />;
          }

          if (name === 'logger') {
            return <TableCell key={name}>{logger}</TableCell>;
          }

          if (name === 'message') {
            return <TableCell key={name}>{message}</TableCell>;
          }

          if (name === 'actions') {
            return <TableCell key={name} className="w-11" />;
          }

          return null;
        })}

        <LogsTableDetailsModal
          isOpen={this.state.isDetailsModalOpen}
          message={message}
          exception={exception}
          onModalClose={this.onModalClose}
        />
      </TableRowButton>
    );
  }
}

export default LogsTableRow;
