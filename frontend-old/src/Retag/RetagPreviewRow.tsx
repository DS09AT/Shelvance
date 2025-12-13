import React, { useEffect } from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import { Checkbox } from 'ComponentsV2/Forms/Checkbox';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';

interface Change {
  field: string;
  oldValue: string | number;
  newValue: string | number;
}

interface RetagPreviewRowProps {
  id: number;
  path: string;
  changes: Change[];
  isSelected?: boolean;
  onSelectedChange: (event: { id: number; value: boolean; shiftKey?: boolean }) => void;
}

function formatValue(field: string, value: string | number | undefined): React.ReactNode {
  if (value === undefined || value === 0 || value === '0' || value === '') {
    return <Icon name={icons.BAN} size={12} />;
  }
  if (field === 'Image Size') {
    return formatBytes(Number(value));
  }
  return value;
}

function formatChange(field: string, oldValue: string | number, newValue: string | number): React.ReactNode {
  return (
    <div className="flex items-center gap-2">
      {formatValue(field, oldValue)}
      <Icon name={icons.ARROW_RIGHT_NO_CIRCLE} size={12} />
      {formatValue(field, newValue)}
    </div>
  );
}

function RetagPreviewRow(props: RetagPreviewRowProps) {
  const {
    id,
    path,
    changes,
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

      <div className="flex flex-col flex-1">
        <span className="ml-2.5 font-bold text-sm mb-2">
          {path}
        </span>

        <DescriptionList>
          {changes.map(({ field, oldValue, newValue }) => (
            <DescriptionListItem
              key={field}
              title={field}
              data={formatChange(field, oldValue, newValue)}
            />
          ))}
        </DescriptionList>
      </div>
    </div>
  );
}

export default RetagPreviewRow;
