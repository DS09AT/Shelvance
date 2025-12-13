import React, { useState } from 'react';
import { Alert } from 'ComponentsV2/Feedback/Alert';
import { Checkbox } from 'ComponentsV2/Forms/Checkbox';
import { Button } from 'ComponentsV2/UI/Button';
import { Spinner } from 'ComponentsV2/UI/Spinner';
import ModalBody from 'Components/Modal/ModalBody';
import { ModalContent, ModalFooter } from 'ComponentsV2/Feedback/Modal';
import ModalHeader from 'Components/Modal/ModalHeader';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import OrganizePreviewRow from './OrganizePreviewRow';

interface OrganizeItem {
  bookFileId: number;
  existingPath: string;
  newPath: string;
}

interface SelectedState {
  [key: number]: boolean;
}

interface OrganizePreviewModalContentProps {
  isFetching: boolean;
  isPopulated: boolean;
  error?: object;
  items: OrganizeItem[];
  path: string;
  trackFormat?: string;
  onOrganizePress: (ids: number[]) => void;
  onModalClose: () => void;
}

interface SelectionState {
  allSelected: boolean;
  allUnselected: boolean;
  lastToggled: number | null;
  selectedState: SelectedState;
}

function getValue(allSelected: boolean, allUnselected: boolean): boolean | null {
  if (allSelected) {
    return true;
  } else if (allUnselected) {
    return false;
  }
  return null;
}

function OrganizePreviewModalContent(props: OrganizePreviewModalContentProps) {
  const {
    isFetching,
    isPopulated,
    error,
    items,
    trackFormat,
    onModalClose
  } = props;

  const [state, setState] = useState<SelectionState>({
    allSelected: false,
    allUnselected: false,
    lastToggled: null,
    selectedState: {}
  });

  const { allSelected, allUnselected, selectedState } = state;
  const selectAllValue = getValue(allSelected, allUnselected);

  const handleSelectAllChange = (value: boolean) => {
    setState(selectAll(selectedState, value));
  };

  const handleSelectedChange = ({ id, value, shiftKey = false }: { id: number; value: boolean; shiftKey?: boolean }) => {
    setState((prevState) => toggleSelected(prevState, items, id, value, shiftKey));
  };

  const handleOrganizePress = () => {
    const selectedIds = getSelectedIds(selectedState);
    props.onOrganizePress(selectedIds);
  };

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        Organize & Rename
      </ModalHeader>

      <ModalBody>
        {isFetching && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {!isFetching && error && (
          <div className="text-zinc-600 dark:text-zinc-400">
            {translate('ErrorLoadingPreviews')}
          </div>
        )}

        {!isFetching && isPopulated && !items.length && (
          <div className="text-zinc-600 dark:text-zinc-400">
            {translate('SuccessMyWorkIsDoneNoFilesToRename')}
          </div>
        )}

        {!isFetching && isPopulated && !!items.length && (
          <div>
            <Alert type="info" className="mb-4">
              <div className="flex items-center gap-1.5">
                <span>Naming pattern:</span>
                <span className="font-mono font-semibold">
                  {trackFormat}
                </span>
              </div>
            </Alert>

            <div className="mt-2.5">
              {items.map((item) => (
                <OrganizePreviewRow
                  key={item.bookFileId}
                  id={item.bookFileId}
                  existingPath={item.existingPath}
                  newPath={item.newPath}
                  isSelected={selectedState[item.bookFileId]}
                  onSelectedChange={handleSelectedChange}
                />
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center gap-2">
        {isPopulated && !!items.length && (
          <div className="mr-auto flex items-center">
            <Checkbox
              name="selectAll"
              checked={selectAllValue === true}
              indeterminate={selectAllValue === null}
              onChange={handleSelectAllChange}
            />
          </div>
        )}

        <Button
          variant="secondary"
          onClick={onModalClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleOrganizePress}
        >
          Organize
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default OrganizePreviewModalContent;
