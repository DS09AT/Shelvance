import React, { useMemo, useState } from 'react';
import ProtocolLabel from 'Activity/Queue/ProtocolLabel';
import BookFormats from 'Book/BookFormats';
import BookQuality from 'Book/BookQuality';
import IndexerFlags from 'Book/IndexerFlags';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatAge from 'Utilities/Number/formatAge';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';
import Peers from './Peers';

type Rejection = string | { reason?: string } | null | undefined;

export interface InteractiveSearchRowProps {
  guid: string;
  protocol: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  publishDate: string;
  title: string;
  infoUrl: string;
  indexer: string;
  indexerId: number;
  size: number;
  seeders?: number;
  leechers?: number;
  quality: Record<string, unknown>;
  customFormats: Array<Record<string, unknown>>;
  customFormatScore: number;
  indexerFlags?: number;
  rejections?: Rejection[];
  downloadAllowed: boolean;
  isGrabbing?: boolean;
  isGrabbed?: boolean;
  grabError?: string;
  longDateFormat: string;
  timeFormat: string;
  searchPayload: Record<string, unknown>;
  onGrabPress: (payload: Record<string, unknown>) => void;
}

const baseCellClass =
  'border-t border-[var(--borderColor)] px-3 py-2 leading-[1.53] align-middle';

function getDownloadIcon(isGrabbing?: boolean, isGrabbed?: boolean, grabError?: string) {
  if (isGrabbing) {
    return icons.SPINNER;
  } else if (isGrabbed) {
    return icons.DOWNLOADING;
  } else if (grabError) {
    return icons.DOWNLOADING;
  }

  return icons.DOWNLOAD;
}

function getDownloadKind(isGrabbed?: boolean, grabError?: string, downloadAllowed?: boolean) {
  if (isGrabbed) {
    return kinds.SUCCESS;
  }

  if (grabError || !downloadAllowed) {
    return kinds.DANGER;
  }

  return kinds.DEFAULT;
}

function getDownloadTooltip(isGrabbing?: boolean, isGrabbed?: boolean, grabError?: string) {
  if (isGrabbing) {
    return '';
  } else if (isGrabbed) {
    return 'Added to downloaded queue';
  } else if (grabError) {
    return grabError;
  }

  return 'Add to downloaded queue';
}

function InteractiveSearchRow({
  guid,
  protocol,
  age,
  ageHours,
  ageMinutes,
  publishDate,
  title,
  infoUrl,
  indexer,
  indexerId,
  size,
  seeders,
  leechers,
  quality,
  customFormats = [],
  customFormatScore,
  indexerFlags = 0,
  rejections = [],
  downloadAllowed,
  isGrabbing = false,
  isGrabbed = false,
  longDateFormat,
  timeFormat,
  grabError,
  searchPayload,
  onGrabPress,
}: InteractiveSearchRowProps) {
  const [isConfirmGrabModalOpen, setIsConfirmGrabModalOpen] = useState(false);

  const formattedCustomFormatScore = useMemo(
    () => formatCustomFormatScore(customFormatScore, customFormats.length),
    [customFormatScore, customFormats]
  );

  const handleGrabPress = () => {
    onGrabPress({ guid, indexerId });
  };

  const handleConfirmGrabPress = () => {
    setIsConfirmGrabModalOpen(true);
  };

  const handleGrabConfirm = () => {
    setIsConfirmGrabModalOpen(false);
    onGrabPress({
      guid,
      indexerId,
      ...searchPayload,
    });
  };

  const handleGrabCancel = () => {
    setIsConfirmGrabModalOpen(false);
  };

  return (
    <TableRow className="transition-colors duration-300 hover:bg-[var(--tableRowHoverBackgroundColor)]">
      <TableRowCell className={`${baseCellClass} w-20 whitespace-nowrap`}>
        <ProtocolLabel protocol={protocol} />
      </TableRowCell>

      <TableRowCell
        className={`${baseCellClass} whitespace-nowrap`}
        title={formatDateTime(publishDate, longDateFormat, timeFormat, { includeSeconds: true })}
      >
        {formatAge(age, ageHours, ageMinutes)}
      </TableRowCell>

      <TableRowCell className={baseCellClass}>
        <div className="flex items-center justify-between break-all">
          <Link to={infoUrl}>{title}</Link>
        </div>
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} w-[85px] whitespace-nowrap`}>
        {indexer}
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} whitespace-nowrap`}>
        {formatBytes(size)}
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} w-[75px]`}>
        {protocol === 'torrent' && <Peers seeders={seeders} leechers={leechers} />}
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} whitespace-nowrap text-center`}>
        <BookQuality quality={quality} showRevision />
      </TableRowCell>

      <TableRowCell
        className={`${baseCellClass} w-[55px] cursor-default text-center font-semibold`}
      >
        <Tooltip
          anchor={formattedCustomFormatScore}
          tooltip={<BookFormats formats={customFormats} />}
          position={tooltipPositions.LEFT}
        />
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} w-[50px] text-center`}>
        {indexerFlags ? (
          <Popover
            anchor={<Icon name={icons.FLAG} kind={kinds.PRIMARY} />}
            title={translate('IndexerFlags')}
            body={<IndexerFlags indexerFlags={indexerFlags} />}
            position={tooltipPositions.LEFT}
          />
        ) : null}
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} w-[50px] text-center`}>
        {!!rejections.length && (
          <Popover
            anchor={<Icon name={icons.DANGER} kind={kinds.DANGER} />}
            title={translate('ReleaseRejected')}
            body={
              <ul className="space-y-1 text-left">
                {rejections.map((rejection, index) => {
                  const text =
                    typeof rejection === 'string'
                      ? rejection
                      : (rejection && rejection.reason) || '';
                  return (
                    <li key={index}>
                      {text}
                    </li>
                  );
                })}
              </ul>
            }
            position={tooltipPositions.LEFT}
          />
        )}
      </TableRowCell>

      <TableRowCell className={`${baseCellClass} w-[50px] text-center`}>
        <SpinnerIconButton
          name={getDownloadIcon(isGrabbing, isGrabbed, grabError)}
          kind={getDownloadKind(isGrabbed, grabError, downloadAllowed)}
          title={getDownloadTooltip(isGrabbing, isGrabbed, grabError)}
          isSpinning={isGrabbing}
          onPress={downloadAllowed ? handleGrabPress : handleConfirmGrabPress}
        />
      </TableRowCell>

      <ConfirmModal
        isOpen={isConfirmGrabModalOpen}
        kind={kinds.WARNING}
        title={translate('GrabRelease')}
        message={translate('GrabReleaseMessageText', [title])}
        confirmLabel={translate('Grab')}
        onConfirm={handleGrabConfirm}
        onCancel={handleGrabCancel}
      />
    </TableRow>
  );
}

export default InteractiveSearchRow;
