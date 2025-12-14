import clsx from 'clsx';
import { Tag as TagType } from '@/features/settings/types';
import { Tag } from '@/shared/components/ui/Tag';

interface TagSelectProps {
  label?: string;
  allTags: TagType[];
  selectedTagIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
}

export function TagSelect({ label, allTags, selectedTagIds, onChange, disabled }: TagSelectProps) {
  const toggleTag = (id: number) => {
    if (disabled) return;
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter(tagId => tagId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
        {allTags.length === 0 && (
          <span className="text-sm text-zinc-500 italic">No tags available.</span>
        )}
        {allTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              disabled={disabled}
              className="focus:outline-hidden"
            >
              <Tag
                variant="medium"
                color={isSelected ? 'primary' : 'zinc'}
                className={clsx(
                  "cursor-pointer transition",
                  isSelected ? "ring-2 ring-primary-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                {tag.label}
              </Tag>
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-zinc-500">Selected tags will be added/set.</p>
    </div>
  );
}
