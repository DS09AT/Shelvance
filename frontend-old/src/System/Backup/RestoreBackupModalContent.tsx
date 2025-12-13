import React, { Component } from 'react';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function getErrorMessage(error: any) {
  if (!error || !error.responseJSON || !error.responseJSON.message) {
    return 'Error restoring backup';
  }

  return error.responseJSON.message;
}

function getStepIconProps(isExecuting: boolean, hasExecuted: boolean, error?: any) {
  if (isExecuting) {
    return {
      name: icons.SPINNER,
      isSpinning: true,
    };
  }

  if (hasExecuted) {
    return {
      name: icons.CHECK,
      kind: kinds.SUCCESS,
    };
  }

  if (error) {
    return {
      name: icons.FATAL,
      kinds: kinds.DANGER,
      title: getErrorMessage(error),
    };
  }

  return {
    name: icons.PENDING,
  };
}

interface RestoreBackupModalContentProps {
  id?: number;
  name?: string;
  path?: string;
  isRestoring: boolean;
  restoreError?: any;
  isRestarting: boolean;
  dispatchRestart: () => void;
  onRestorePress: (data: { id?: number; file: File | null }) => void;
  onModalClose: () => void;
}

interface RestoreBackupModalContentState {
  file: File | null;
  path: string;
  isRestored: boolean;
  isRestarted: boolean;
  isReloading: boolean;
}

class RestoreBackupModalContent extends Component<
  RestoreBackupModalContentProps,
  RestoreBackupModalContentState
> {
  constructor(props: RestoreBackupModalContentProps) {
    super(props);

    this.state = {
      file: null,
      path: '',
      isRestored: false,
      isRestarted: false,
      isReloading: false,
    };
  }

  componentDidUpdate(prevProps: RestoreBackupModalContentProps) {
    const { isRestoring, restoreError, isRestarting, dispatchRestart } = this.props;

    if (prevProps.isRestoring && !isRestoring && !restoreError) {
      this.setState({ isRestored: true }, () => {
        dispatchRestart();
      });
    }

    if (prevProps.isRestarting && !isRestarting) {
      this.setState(
        {
          isRestarted: true,
          isReloading: true,
        },
        () => {
          location.reload();
        }
      );
    }
  }

  onPathChange = ({ value, files }: { value: string; files: FileList }) => {
    this.setState({
      file: files[0],
      path: value,
    });
  };

  onRestorePress = () => {
    const { id, onRestorePress } = this.props;

    onRestorePress({
      id,
      file: this.state.file,
    });
  };

  render() {
    const { id, name, isRestoring, restoreError, isRestarting, onModalClose } = this.props;

    const { path, isRestored, isRestarted, isReloading } = this.state;

    const isRestoreDisabled = (!id && !path) || isRestoring || isRestarting || isReloading;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>Restore Backup</ModalHeader>

        <ModalBody>
          {!!id && translate('WouldYouLikeToRestoreBackup', { name })}

          {!id && (
            <TextInput type="file" name="path" value={path} onChange={this.onPathChange} />
          )}

          <div className="mt-5 space-y-3">
            <div className="flex items-center text-base leading-5">
              <div className="mr-2">
                <Icon size={20} {...getStepIconProps(isRestoring, isRestored, restoreError)} />
              </div>
              <div>{translate('Restore')}</div>
            </div>

            <div className="flex items-center text-base leading-5">
              <div className="mr-2">
                <Icon size={20} {...getStepIconProps(isRestarting, isRestarted)} />
              </div>
              <div>{translate('Restart')}</div>
            </div>

            <div className="flex items-center text-base leading-5">
              <div className="mr-2">
                <Icon size={20} {...getStepIconProps(isReloading, false)} />
              </div>
              <div>{translate('Reload')}</div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex-grow text-zinc-500 dark:text-zinc-400">
            {translate('RestartReloadNote')}
          </div>

          <Button onPress={onModalClose}>Cancel</Button>

          <SpinnerButton
            kind={kinds.WARNING}
            isDisabled={isRestoreDisabled}
            isSpinning={isRestoring}
            onPress={this.onRestorePress}
          >
            Restore
          </SpinnerButton>
        </ModalFooter>
      </ModalContent>
    );
  }
}

export default RestoreBackupModalContent;
