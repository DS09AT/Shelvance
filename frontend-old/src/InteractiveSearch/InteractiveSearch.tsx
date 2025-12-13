import React from 'react';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds, sortDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import InteractiveSearchRow, { InteractiveSearchRowProps } from './InteractiveSearchRow';

type TableColumn = {
  name: string;
  label: React.ReactNode;
  isSortable?: boolean;
  fixedSortDirection?: string;
  isVisible?: boolean;
};

const columns: TableColumn[] = [
  {
    name: 'protocol',
    label: 'Source',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'age',
    label: 'Age',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'title',
    label: 'Title',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'indexer',
    label: 'Indexer',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'size',
    label: 'Size',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'peers',
    label: 'Peers',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'qualityWeight',
    label: 'Quality',
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'customFormatScore',
    label: (
      <Icon
        name={icons.SCORE}
        title={() => translate('CustomFormatScore')}
      />
    ),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'indexerFlags',
    label: (
      <Icon
        name={icons.FLAG}
        title={() => translate('IndexerFlags')}
      />
    ),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'rejections',
    label: (
      <Icon
        name={icons.DANGER}
        title="Rejections"
      />
    ),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
  {
    name: 'releaseWeight',
    label: <Icon name={icons.DOWNLOAD} />,
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
];

interface InteractiveSearchProps {
  searchPayload: Record<string, unknown>;
  isFetching: boolean;
  isPopulated: boolean;
  error?: Record<string, unknown> | null;
  totalReleasesCount: number;
  items: InteractiveSearchRowProps[];
  sortKey?: string;
  sortDirection?: string;
  type: string;
  longDateFormat: string;
  timeFormat: string;
  onSortPress: (name: string, fixedSortDirection?: string) => void;
  onGrabPress: (payload: Record<string, unknown>) => void;
}

function InteractiveSearch({
  searchPayload,
  isFetching,
  isPopulated,
  error,
  totalReleasesCount,
  items,
  sortKey,
  sortDirection,
  longDateFormat,
  timeFormat,
  onSortPress,
  onGrabPress,
}: InteractiveSearchProps) {
  return (
    <div className="space-y-3">
      {isFetching ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <div className="pl-8 pt-2.5 pb-2.5">
          Unable to load results for this book search. Try again later
        </div>
      ) : null}

      {!isFetching && isPopulated && !totalReleasesCount ? (
        <Alert kind={kinds.INFO}>
          {translate('NoResultsFound')}
        </Alert>
      ) : null}

      {!!totalReleasesCount && isPopulated && !items.length ? (
        <Alert kind={kinds.WARNING}>
          {translate('AllResultsAreHiddenByTheAppliedFilter')}
        </Alert>
      ) : null}

      {isPopulated && !!items.length ? (
        <Table columns={columns} sortKey={sortKey} sortDirection={sortDirection} onSortPress={onSortPress}>
          <TableBody>
            {items.map((item) => (
              <InteractiveSearchRow
                key={`${item.indexerId}-${item.guid}`}
                {...item}
                searchPayload={searchPayload}
                longDateFormat={longDateFormat}
                timeFormat={timeFormat}
                onGrabPress={onGrabPress}
              />
            ))}
          </TableBody>
        </Table>
      ) : null}

      {totalReleasesCount !== items.length && !!items.length ? (
        <div className="mt-2.5">
          {translate('SomeResultsAreHiddenByTheAppliedFilter')}
        </div>
      ) : null}
    </div>
  );
}

export default InteractiveSearch;
