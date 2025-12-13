import React, { Component } from 'react';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { FieldSet } from 'ComponentsV2/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'ComponentsV2/UI';
import { ProgressBar } from 'ComponentsV2/UI';
import { Spinner } from 'ComponentsV2/UI';

interface DiskSpaceItem {
  path: string;
  label?: string;
  freeSpace: number;
  totalSpace: number;
}

interface DiskSpaceProps {
  isFetching: boolean;
  items: DiskSpaceItem[];
}

class DiskSpace extends Component<DiskSpaceProps> {
  render() {
    const { isFetching, items } = this.props;

    return (
      <FieldSet legend={translate('DiskSpace')}>
        {isFetching && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {!isFetching && (
          <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHead>{translate('Location')}</TableHead>
                <TableHead align="right">{translate('FreeSpace')}</TableHead>
                <TableHead align="right">{translate('TotalSpace')}</TableHead>
                <TableHead>{translate('Usage')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const { path, label, freeSpace, totalSpace } = item;
                const diskUsage = Math.round(100 - (freeSpace / totalSpace) * 100);
                
                let variant: 'primary' | 'warning' | 'danger' = 'primary';
                if (diskUsage > 90) {
                  variant = 'danger';
                } else if (diskUsage > 80) {
                  variant = 'warning';
                }

                return (
                  <TableRow key={path} isHoverable={false}>
                    <TableCell>
                      {path}
                      {label && ` (${label})`}
                    </TableCell>

                    <TableCell align="right" className="w-36">
                      {formatBytes(freeSpace)}
                    </TableCell>

                    <TableCell align="right" className="w-36">
                      {formatBytes(totalSpace)}
                    </TableCell>

                    <TableCell className="w-64">
                      <ProgressBar
                        value={diskUsage}
                        variant={variant}
                        size="md"
                        showLabel={diskUsage >= 12}
                        label={`${diskUsage}%`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </FieldSet>
    );
  }
}

export default DiskSpace;
