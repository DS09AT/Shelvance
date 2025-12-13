import React, { Component } from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import { icons, kinds } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { TableRow, TableCell } from 'ComponentsV2/UI';
import RestoreBackupModalConnector from './RestoreBackupModalConnector';

interface BackupRowProps {
  id: number;
  type: string;
  name: string;
  path: string;
  size: number;
  time: string;
  onDeleteBackupPress: (id: number) => void;
}

interface BackupRowState {
  isRestoreModalOpen: boolean;
  isConfirmDeleteModalOpen: boolean;
}

class BackupRow extends Component<BackupRowProps, BackupRowState> {
  constructor(props: BackupRowProps) {
    super(props);

    this.state = {
      isRestoreModalOpen: false,
      isConfirmDeleteModalOpen: false,
    };
  }

  onRestorePress = () => {
    this.setState({ isRestoreModalOpen: true });
  };

  onRestoreModalClose = () => {
    this.setState({ isRestoreModalOpen: false });
  };

  onDeletePress = () => {
    this.setState({ isConfirmDeleteModalOpen: true });
  };

  onConfirmDeleteModalClose = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
  };

  onConfirmDeletePress = () => {
    const { id, onDeleteBackupPress } = this.props;

    this.setState({ isConfirmDeleteModalOpen: false }, () => {
      onDeleteBackupPress(id);
    });
  };

  render() {
    const { id, type, name, path, size, time } = this.props;

    const { isRestoreModalOpen, isConfirmDeleteModalOpen } = this.state;

    let iconClassName = icons.SCHEDULED;
    let iconTooltip = translate('IconTooltip');

    if (type === 'manual') {
      iconClassName = icons.INTERACTIVE;
      iconTooltip = 'Manual';
    } else if (type === 'update') {
      iconClassName = icons.UPDATE;
      iconTooltip = 'Before update';
    }

    return (
      <TableRow key={id}>
        <TableCell className="w-5 text-center">
          <Icon name={iconClassName} title={iconTooltip} />
        </TableCell>

        <TableCell>
          <Link to={`${window.Readarr.urlBase}${path}`} noRouter={true}>
            {name}
          </Link>
        </TableCell>

        <TableCell>{formatBytes(size)}</TableCell>

        <RelativeDateCellConnector date={time} />

        <TableCell className="w-16">
          <div className="flex items-center gap-2">
            <IconButton name={icons.RESTORE} onPress={this.onRestorePress} />

            <IconButton
              title={translate('DeleteBackup')}
              name={icons.DELETE}
              onPress={this.onDeletePress}
            />
          </div>
        </TableCell>

        <RestoreBackupModalConnector
          isOpen={isRestoreModalOpen}
          id={id}
          name={name}
          onModalClose={this.onRestoreModalClose}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteBackup')}
          message={translate('DeleteBackupMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeletePress}
          onCancel={this.onConfirmDeleteModalClose}
        />
      </TableRow>
    );
  }
}

export default BackupRow;
