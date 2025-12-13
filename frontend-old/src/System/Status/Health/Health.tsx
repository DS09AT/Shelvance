import React, { Component } from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import { icons } from 'Helpers/Props';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import { FieldSet } from 'ComponentsV2/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'ComponentsV2/UI';
import { Spinner } from 'ComponentsV2/UI';
import { HealthType } from 'ComponentsV2/Feedback';

interface HealthItem {
  type: string;
  message: string;
  source: string;
  wikiUrl: string;
}

interface HealthProps {
  isFetching: boolean;
  isPopulated: boolean;
  items: HealthItem[];
  isTestingAllDownloadClients: boolean;
  isTestingAllIndexers: boolean;
  dispatchTestAllDownloadClients: () => void;
  dispatchTestAllIndexers: () => void;
}

function getInternalLink(source: string) {
  switch (source) {
    case 'IndexerRssCheck':
    case 'IndexerSearchCheck':
    case 'IndexerStatusCheck':
    case 'IndexerJackettAllCheck':
    case 'IndexerLongTermStatusCheck':
      return (
        <IconButton
          name={icons.SETTINGS}
          title={translate('Settings')}
          to="/settings/indexers"
        />
      );
    case 'DownloadClientCheck':
    case 'DownloadClientStatusCheck':
    case 'ImportMechanismCheck':
    case 'RemotePathMappingCheck':
      return (
        <IconButton
          name={icons.SETTINGS}
          title={translate('Settings')}
          to="/settings/downloadclients"
        />
      );
    case 'NotificationStatusCheck':
      return (
        <IconButton
          name={icons.SETTINGS}
          title={translate('Settings')}
          to="/settings/connect"
        />
      );
    case 'RootFolderCheck':
      return (
        <IconButton
          name={icons.AUTHOR_CONTINUING}
          title={translate('AuthorEditor')}
          to="/authoreditor"
        />
      );
    case 'UpdateCheck':
      return (
        <IconButton
          name={icons.UPDATE}
          title={translate('Updates')}
          to="/system/updates"
        />
      );
    default:
      return null;
  }
}

function getTestLink(source: string, props: HealthProps) {
  switch (source) {
    case 'IndexerStatusCheck':
    case 'IndexerLongTermStatusCheck':
      return (
        <SpinnerIconButton
          name={icons.TEST}
          title={translate('TestAll')}
          isSpinning={props.isTestingAllIndexers}
          onPress={props.dispatchTestAllIndexers}
        />
      );
    case 'DownloadClientCheck':
    case 'DownloadClientStatusCheck':
      return (
        <SpinnerIconButton
          name={icons.TEST}
          title={translate('TestAll')}
          isSpinning={props.isTestingAllDownloadClients}
          onPress={props.dispatchTestAllDownloadClients}
        />
      );
    default:
      return null;
  }
}

function getHealthKind(type: string): { kind: string; healthType: HealthType } {
  switch (type.toLowerCase()) {
    case 'error':
      return { kind: 'danger', healthType: 'error' };
    case 'warning':
      return { kind: 'warning', healthType: 'warning' };
    case 'notice':
      return { kind: 'info', healthType: 'notice' };
    default:
      return { kind: 'warning', healthType: 'warning' };
  }
}

class Health extends Component<HealthProps> {
  render() {
    const { isFetching, isPopulated, items } = this.props;

    const healthIssues = !!items.length;

    return (
      <FieldSet
        legend={
          <div className="flex items-center justify-between">
            <span>Health</span>
            {isFetching && isPopulated && (
              <Spinner size="sm" className="ml-2" />
            )}
          </div>
        }
      >
        {isFetching && !isPopulated && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {!healthIssues && (
          <div className="mb-6 text-zinc-700 dark:text-zinc-300">
            {translate('HealthNoIssues')}
          </div>
        )}

        {healthIssues && (
          <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHead className="w-10"></TableHead>
                <TableHead>{translate('Message')}</TableHead>
                <TableHead>{translate('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const internalLink = getInternalLink(item.source);
                const testLink = getTestLink(item.source, this.props);
                const { kind } = getHealthKind(item.type);

                return (
                  <TableRow key={`health${item.message}`}>
                    <TableCell>
                      <Icon
                        name={icons.DANGER}
                        kind={kind}
                        title={titleCase(item.type)}
                      />
                    </TableCell>

                    <TableCell>{item.message}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconButton
                          name={icons.WIKI}
                          to={item.wikiUrl}
                          title={translate('ReadTheWikiForMoreInformation')}
                        />
                        {internalLink}
                        {testLink}
                      </div>
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

export default Health;
