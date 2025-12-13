import React from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import DescriptionListItemDescription from 'Components/DescriptionList/DescriptionListItemDescription';
import DescriptionListItemTitle from 'Components/DescriptionList/DescriptionListItemTitle';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatAge from 'Utilities/Number/formatAge';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';

interface StatusMessage {
  title: string;
  messages: string[];
}

interface HistoryData {
  indexer?: string;
  releaseGroup?: string;
  customFormatScore?: string | number;
  nzbInfoUrl?: string;
  downloadClient?: string;
  downloadClientName?: string;
  downloadId?: string;
  age?: number;
  ageHours?: number;
  ageMinutes?: number;
  publishedDate?: string;
  message?: string;
  droppedPath?: string;
  importedPath?: string;
  sourcePath?: string;
  path?: string;
  diff?: string;
  tagsScrubbed?: string;
  statusMessages?: string;
  [key: string]: any;
}

interface HistoryDetailsProps {
  eventType: string;
  sourceTitle: string;
  data: HistoryData;
  shortDateFormat: string;
  timeFormat: string;
}

function getDetailedList(statusMessages: StatusMessage[]) {
  return (
    <div>
      {
        statusMessages.map(({ title, messages }) => {
          return (
            <div key={title}>
              {title}
              <ul>
                {
                  messages.map((message) => {
                    return (
                      <li key={message}>
                        {message}
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          );
        })
      }
    </div>
  );
}

function formatMissing(value: any) {
  if (value === undefined || value === 0 || value === '0') {
    return (<Icon name={icons.BAN} size={12} />);
  }
  return value;
}

function formatChange(oldValue: any, newValue: any) {
  return (
    <div className="flex items-center gap-1">
      {formatMissing(oldValue)}
      <Icon name={icons.ARROW_RIGHT_NO_CIRCLE} size={12} />
      {formatMissing(newValue)}
    </div>
  );
}

function HistoryDetails(props: HistoryDetailsProps) {
  const {
    eventType,
    sourceTitle,
    data,
    shortDateFormat,
    timeFormat
  } = props;

  if (eventType === 'grabbed') {
    const {
      indexer,
      releaseGroup,
      customFormatScore,
      nzbInfoUrl,
      downloadClient,
      downloadClientName,
      downloadId,
      age,
      ageHours,
      ageMinutes,
      publishedDate
    } = data;

    const downloadClientNameInfo = downloadClientName ?? downloadClient;

    return (
      <DescriptionList>
        <DescriptionListItem
          descriptionClassName="break-words"
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          !!indexer &&
            <DescriptionListItem
              title={translate('Indexer')}
              data={indexer}
            />
        }

        {
          !!releaseGroup &&
            <DescriptionListItem
              descriptionClassName="break-words"
              title={translate('ReleaseGroup')}
              data={releaseGroup}
            />
        }

        {
          customFormatScore && customFormatScore !== '0' ?
            <DescriptionListItem
              title={translate('CustomFormatScore')}
              data={formatCustomFormatScore(customFormatScore)}
            /> :
            null
        }

        {
          nzbInfoUrl ?
            <span>
              <DescriptionListItemTitle>
                Info URL
              </DescriptionListItemTitle>

              <DescriptionListItemDescription>
                <Link to={nzbInfoUrl}>{nzbInfoUrl}</Link>
              </DescriptionListItemDescription>
            </span> :
            null
        }

        {
          downloadClientNameInfo ?
            <DescriptionListItem
              title={translate('DownloadClient')}
              data={downloadClientNameInfo}
            /> :
            null
        }

        {
          !!downloadId &&
            <DescriptionListItem
              title={translate('GrabID')}
              data={downloadId}
            />
        }

        {
          !!indexer &&
            <DescriptionListItem
              title={translate('AgeWhenGrabbed')}
              data={formatAge(age, ageHours, ageMinutes)}
            />
        }

        {
          !!publishedDate &&
            <DescriptionListItem
              title={translate('PublishedDate')}
              data={formatDateTime(publishedDate, shortDateFormat, timeFormat, { includeSeconds: true })}
            />
        }
      </DescriptionList>
    );
  }

  if (eventType === 'downloadFailed') {
    const {
      message,
      indexer
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          descriptionClassName="break-words"
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          indexer ?
            <DescriptionListItem
              title={translate('Indexer')}
              data={indexer}
            /> :
            null
        }

        {
          message ?
            <DescriptionListItem
              title={translate('Message')}
              data={message}
            /> :
            null
        }
      </DescriptionList>
    );
  }

  if (eventType === 'bookFileImported') {
    const {
      customFormatScore,
      droppedPath,
      importedPath
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          descriptionClassName="break-words"
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          !!droppedPath &&
            <DescriptionListItem
              title={translate('Source')}
              data={droppedPath}
            />
        }

        {
          !!importedPath &&
            <DescriptionListItem
              title={translate('ImportedTo')}
              data={importedPath}
            />
        }

        {
          customFormatScore && customFormatScore !== '0' ?
            <DescriptionListItem
              title={translate('CustomFormatScore')}
              data={formatCustomFormatScore(customFormatScore)}
            /> :
            null
        }
      </DescriptionList>
    );
  }

  if (eventType === 'bookFileDeleted') {
    const {
      reason
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('Name')}
          data={sourceTitle}
        />

        <DescriptionListItem
          title={translate('Reason')}
          data={reason}
        />
      </DescriptionList>
    );
  }

  if (eventType === 'authorFolderImported') {
    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('Name')}
          data={sourceTitle}
        />
      </DescriptionList>
    );
  }

  if (eventType === 'bookFileRenamed') {
    const {
      sourcePath,
      path
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('SourcePath')}
          data={sourcePath}
        />

        <DescriptionListItem
          title={translate('DestinationPath')}
          data={path}
        />
      </DescriptionList>
    );
  }

  if (eventType === 'bookFileRetagged') {
    const {
      diff,
      tagsScrubbed
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('Path')}
          data={sourceTitle}
        />
        {
          JSON.parse(diff || '[]').map(({ field, oldValue, newValue }: any) => {
            return (
              <DescriptionListItem
                key={field}
                title={field}
                data={formatChange(oldValue, newValue)}
              />
            );
          })
        }
        <DescriptionListItem
          title={translate('ExistingTagsScrubbed')}
          data={tagsScrubbed === 'True' ? <Icon name={icons.CHECK} /> : <Icon name={icons.REMOVE} />}
        />
      </DescriptionList>
    );
  }

  if (eventType === 'bookImportIncomplete') {
    const {
      statusMessages
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          !!statusMessages &&
            <DescriptionListItem
              title={translate('ImportFailures')}
              data={getDetailedList(JSON.parse(statusMessages))}
            />
        }
      </DescriptionList>
    );
  }

  if (eventType === 'downloadImported') {
    const {
      indexer,
      releaseGroup,
      nzbInfoUrl,
      downloadClient,
      downloadId,
      age,
      ageHours,
      ageMinutes,
      publishedDate
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          !!indexer &&
            <DescriptionListItem
              title={translate('Indexer')}
              data={indexer}
            />
        }

        {
          !!releaseGroup &&
            <DescriptionListItem
              title={translate('ReleaseGroup')}
              data={releaseGroup}
            />
        }

        {
          !!nzbInfoUrl &&
            <span>
              <DescriptionListItemTitle>
                Info URL
              </DescriptionListItemTitle>

              <DescriptionListItemDescription>
                <Link to={nzbInfoUrl}>{nzbInfoUrl}</Link>
              </DescriptionListItemDescription>
            </span>
        }

        {
          !!downloadClient &&
            <DescriptionListItem
              title={translate('DownloadClient')}
              data={downloadClient}
            />
        }

        {
          !!downloadId &&
            <DescriptionListItem
              title={translate('GrabID')}
              data={downloadId}
            />
        }

        {
          !!indexer &&
            <DescriptionListItem
              title={translate('AgeWhenGrabbed')}
              data={formatAge(age, ageHours, ageMinutes)}
            />
        }

        {
          !!publishedDate &&
            <DescriptionListItem
              title={translate('PublishedDate')}
              data={formatDateTime(publishedDate, shortDateFormat, timeFormat, { includeSeconds: true })}
            />
        }
      </DescriptionList>
    );
  }

  if (eventType === 'downloadIgnored') {
    const {
      message
    } = data;

    return (
      <DescriptionList>
        <DescriptionListItem
          descriptionClassName="break-words"
          title={translate('Name')}
          data={sourceTitle}
        />

        {
          !!message &&
            <DescriptionListItem
              title={translate('Message')}
              data={message}
            />
        }
      </DescriptionList>
    );
  }

  return (
    <DescriptionList>
      <DescriptionListItem
        descriptionClassName="break-words"
        title={translate('Name')}
        data={sourceTitle}
      />
    </DescriptionList>
  );
}

export default HistoryDetails;
