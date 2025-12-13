import React, { Component } from 'react';
import Link from 'Components/Link/Link';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import { TableRow, TableCell } from 'ComponentsV2/UI';

interface LogFilesTableRowProps {
  filename: string;
  lastWriteTime: string;
  downloadUrl: string;
}

class LogFilesTableRow extends Component<LogFilesTableRowProps> {
  render() {
    const { filename, lastWriteTime, downloadUrl } = this.props;

    return (
      <TableRow>
        <TableCell>{filename}</TableCell>

        <RelativeDateCellConnector date={lastWriteTime} />

        <TableCell className="w-24">
          <Link to={downloadUrl} target="_blank" noRouter={true}>
            Download
          </Link>
        </TableCell>
      </TableRow>
    );
  }
}

export default LogFilesTableRow;
