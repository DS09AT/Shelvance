import React from 'react';
import { useSelector } from 'react-redux';
import { CommandBody } from 'Commands/Command';
import createMultiAuthorsSelector from 'Store/Selectors/createMultiAuthorsSelector';
import translate from 'Utilities/String/translate';
import { TableCell } from 'ComponentsV2/UI';

function formatTitles(titles: string[]) {
  if (!titles) {
    return null;
  }

  if (titles.length > 11) {
    return (
      <span title={titles.join(', ')}>
        {titles.slice(0, 10).join(', ')}, {titles.length - 10} more
      </span>
    );
  }

  return <span>{titles.join(', ')}</span>;
}

export interface QueuedTaskRowNameCellProps {
  commandName: string;
  body: CommandBody;
  clientUserAgent?: string;
}

export default function QueuedTaskRowNameCell(
  props: QueuedTaskRowNameCellProps
) {
  const { commandName, body, clientUserAgent } = props;
  const movieIds = [...(body.authorIds ?? [])];

  if (body.authorId) {
    movieIds.push(body.authorId);
  }

  const authors = useSelector(createMultiAuthorsSelector(movieIds));
  const sortedAuthors = authors.sort((a, b) =>
    a.sortName.localeCompare(b.sortName)
  );

  return (
    <TableCell>
      <div className="inline-block min-w-[220px] text-zinc-900 dark:text-zinc-100">
        {commandName}
        {sortedAuthors.length ? (
          <span> - {formatTitles(sortedAuthors.map((a) => a.authorName))}</span>
        ) : null}
      </div>

      {clientUserAgent ? (
        <div
          className="text-sm text-zinc-400 dark:text-zinc-500"
          title={translate('TaskUserAgentTooltip')}
        >
          {translate('From')}: {clientUserAgent}
        </div>
      ) : null}
    </TableCell>
  );
}
