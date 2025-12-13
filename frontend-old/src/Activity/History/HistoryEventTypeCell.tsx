import React from 'react';
import Icon from 'Components/Icon';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds } from 'Helpers/Props';

interface HistoryData {
  indexer?: string;
  downloadClient?: string;
}

interface HistoryEventTypeCellProps {
  eventType: string;
  data?: HistoryData;
}

function getIconName(eventType: string) {
  switch (eventType) {
    case 'grabbed':
      return icons.DOWNLOADING;
    case 'authorFolderImported':
      return icons.DRIVE;
    case 'bookFileImported':
      return icons.DOWNLOADED;
    case 'downloadFailed':
      return icons.DOWNLOADING;
    case 'bookFileDeleted':
      return icons.DELETE;
    case 'bookFileRenamed':
      return icons.ORGANIZE;
    case 'bookFileRetagged':
      return icons.RETAG;
    case 'bookImportIncomplete':
      return icons.DOWNLOADED;
    case 'downloadIgnored':
      return icons.IGNORE;
    default:
      return icons.UNKNOWN;
  }
}

function getIconKind(eventType: string) {
  switch (eventType) {
    case 'downloadFailed':
      return kinds.DANGER;
    case 'bookImportIncomplete':
      return kinds.WARNING;
    default:
      return kinds.DEFAULT;
  }
}

function getTooltip(eventType: string, data: HistoryData = {}) {
  switch (eventType) {
    case 'grabbed':
      return `Book grabbed from ${data.indexer} and sent to ${data.downloadClient}`;
    case 'authorFolderImported':
      return 'Book imported from author folder';
    case 'bookFileImported':
      return 'Book downloaded successfully and picked up from download client';
    case 'downloadFailed':
      return 'Book download failed';
    case 'bookFileDeleted':
      return 'Book file deleted';
    case 'bookFileRenamed':
      return 'Book file renamed';
    case 'bookFileRetagged':
      return 'Book file tags updated';
    case 'bookImportIncomplete':
      return 'Files downloaded but not all could be imported';
    case 'downloadIgnored':
      return 'Book Download Ignored';
    default:
      return 'Unknown event';
  }
}

function HistoryEventTypeCell({ eventType, data = {} }: HistoryEventTypeCellProps) {
  const iconName = getIconName(eventType);
  const iconKind = getIconKind(eventType);
  const tooltip = getTooltip(eventType, data);

  return (
    <TableRowCell
      className="w-[35px] text-center"
      title={tooltip}
    >
      <Icon
        name={iconName}
        kind={iconKind}
      />
    </TableRowCell>
  );
}

export default HistoryEventTypeCell;
