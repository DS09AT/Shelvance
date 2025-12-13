import React, { useEffect } from 'react';
import { Checkbox } from 'ComponentsV2/Forms/Checkbox';
import Icon from 'Components/Icon';
import { icons, kinds } from 'Helpers/Props';

interface OrganizePreviewRowProps {
  id: number;
  existingPath: string;
  newPath: string;
  isSelected?: boolean;
  onSelectedChange: (event: { id: number; value: boolean; shiftKey?: boolean }) => void;
}

function OrganizePreviewRow(props: OrganizePreviewRowProps) {
  const {
    id,
    existingPath,
    newPath,
    isSelected = false,
    onSelectedChange
  } = props;

  useEffect(() => {
    onSelectedChange({ id, value: true });
  }, [id, onSelectedChange]);

  const handleSelectedChange = (checked: boolean, event?: React.ChangeEvent<HTMLInputElement>) => {
    onSelectedChange({ 
      id, 
      value: checked, 
      shiftKey: event?.nativeEvent?.shiftKey 
    });
  };

  return (
    <div className="flex mb-1.5 py-1.5 border-b border-zinc-200 dark:border-zinc-800 last:mb-0 last:pb-0 last:border-b-0">
      <div className="mr-7.5">
        <Checkbox
          name={id.toString()}
          checked={isSelected}
          onChange={handleSelectedChange}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center mb-1">
          <Icon
            name={icons.SUBTRACT}
            kind={kinds.DANGER}
          />
          <span className="ml-2.5 font-mono text-sm">
            {existingPath}
          </span>
        </div>

        <div className="flex items-center">
          <Icon
            name={icons.ADD}
            kind={kinds.SUCCESS}
          />
          <span className="ml-2.5 font-mono text-sm">
            {newPath}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrganizePreviewRow;
