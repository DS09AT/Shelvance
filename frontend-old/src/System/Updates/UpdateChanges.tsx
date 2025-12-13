import React from 'react';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';

interface UpdateChangesProps {
  title: string;
  changes: string[];
}

function UpdateChanges(props: UpdateChangesProps) {
  const { title, changes } = props;

  if (changes.length === 0) {
    return null;
  }

  const uniqueChanges = [...new Set(changes)];

  return (
    <div>
      <div className="mt-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </div>
      <ul className="ml-5 list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
        {uniqueChanges.map((change, index) => {
          const checkChange = change.replace(
            /#\d{4,5}\b/g,
            (match) =>
              `[${match}](https://github.com/Readarr/Readarr/issues/${match.substring(
                1
              )})`
          );

          return (
            <li key={index}>
              <InlineMarkdown data={checkChange} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UpdateChanges;
