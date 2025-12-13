import React, { useState } from 'react';
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
import RetagPreviewRow from './RetagPreviewRow';

interface RetagItem {
  bookFileId: number;
  path: string;
  changes: Array<{
    field: string;
    oldValue: string | number;
    newValue: string | number;
  }>;
}

interface SelectedState {
  [key: number]: boolean;
}

interface RetagPreviewModalContentProps {
  isFetching: boolean;
  isPopulated: boolean;
  error?: object;
  items: RetagItem[];
  path: string;
  onRetagPress: (ids: number[], updateCovers: boolean, embedMetadata: boolean) => void;
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

function RetagPreviewModalContent(props: RetagPreviewModalContentProps) {
  const {
    isFetching,
    isPopulated,
    error,
    items,
    onModalClose
  } = props;

  const [state, setState] = useState<SelectionState>({
    allSelected: false,
    allUnselected: false,
    lastToggled: null,
    selectedState: {}
  });

  const [updateCovers, setUpdateCovers] = useState(false);
  const [embedMetadata, setEmbedMetadata] = useState(false);

  const { allSelected, allUnselected, selectedState } = state;
  const selectAllValue = getValue(allSelected, allUnselected);

  const handleSelectAllChange = (value: boolean) => {
    setState(selectAll(selectedState, value));
  };

  const handleSelectedChange = ({ id, value, shiftKey = false }: { id: number; value: boolean; shiftKey?: boolean }) => {
    setState((prevState) => toggleSelected(prevState, items, id, value, shiftKey));
  };

  const handleRetagPress = () => {
    const selectedIds = getSelectedIds(selectedState);
    props.onRetagPress(selectedIds, updateCovers, embedMetadata);
  };

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        Write Metadata Tags
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
            {translate('SuccessMyWorkIsDoneNoFilesToRetag')}
          </div>
        )}

        {!isFetching && isPopulated && !!items.length && (
          <div className="mt-2.5">
            {items.map((item) => (
              <RetagPreviewRow
                key={item.bookFileId}
                id={item.bookFileId}
                path={item.path}
                changes={item.changes}
                isSelected={selectedState[item.bookFileId]}
                onSelectedChange={handleSelectedChange}
              />
            ))}
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center gap-4">
        {isPopulated && !!items.length && (
          <div className="mr-auto">
            <Checkbox
              name="selectAll"
              checked={selectAllValue === true}
              indeterminate={selectAllValue === null}
              onChange={handleSelectAllChange}
            />
          </div>
        )}

        <label className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-normal">
            Update Covers
          </span>
          <Checkbox
            name="updateCovers"
            checked={updateCovers}
            onChange={setUpdateCovers}
          />
        </label>

        <label className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-normal">
            Embed Metadata
          </span>
          <Checkbox
            name="embedMetadata"
            checked={embedMetadata}
            onChange={setEmbedMetadata}
          />
        </label>

        <Button
          variant="secondary"
          onClick={onModalClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleRetagPress}
        >
          Retag
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default RetagPreviewModalContent;
