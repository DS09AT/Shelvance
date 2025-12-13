import React, { Component } from 'react';
import moment from 'moment';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import { FieldSet } from 'ComponentsV2/Layout';
import { DescriptionList, DescriptionListItem } from 'ComponentsV2/UI';

interface StartTimeProps {
  startTime: string;
  timeFormat: string;
  longDateFormat: string;
}

interface StartTimeState {
  uptime: string;
  startTime: string;
}

function getUptime(startTime: string): string {
  return formatTimeSpan(moment().diff(startTime));
}

class StartTime extends Component<StartTimeProps, StartTimeState> {
  private _timeoutId: NodeJS.Timeout | null = null;

  constructor(props: StartTimeProps) {
    super(props);

    const { startTime, timeFormat, longDateFormat } = props;

    this.state = {
      uptime: getUptime(startTime),
      startTime: formatDateTime(startTime, longDateFormat, timeFormat, { includeSeconds: true }),
    };
  }

  componentDidMount() {
    this._timeoutId = setTimeout(this.onTimeout, 1000);
  }

  componentDidUpdate(prevProps: StartTimeProps) {
    const { startTime, timeFormat, longDateFormat } = this.props;

    if (
      startTime !== prevProps.startTime ||
      timeFormat !== prevProps.timeFormat ||
      longDateFormat !== prevProps.longDateFormat
    ) {
      this.setState({
        uptime: getUptime(startTime),
        startTime: formatDateTime(startTime, longDateFormat, timeFormat, { includeSeconds: true }),
      });
    }
  }

  componentWillUnmount() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  onTimeout = () => {
    this.setState({ uptime: getUptime(this.props.startTime) });
    this._timeoutId = setTimeout(this.onTimeout, 1000);
  };

  render() {
    const { uptime, startTime } = this.state;

    return <span title={startTime}>{uptime}</span>;
  }
}

interface AboutProps {
  version: string;
  packageVersion?: string;
  packageAuthor?: string;
  isNetCore: boolean;
  runtimeVersion: string;
  isDocker: boolean;
  databaseType: string;
  databaseVersion: string;
  migrationVersion: number;
  appData: string;
  startupPath: string;
  mode: string;
  startTime: string;
  timeFormat: string;
  longDateFormat: string;
}

class About extends Component<AboutProps> {
  render() {
    const {
      version,
      packageVersion,
      packageAuthor,
      isNetCore,
      isDocker,
      runtimeVersion,
      databaseVersion,
      databaseType,
      migrationVersion,
      appData,
      startupPath,
      mode,
      startTime,
      timeFormat,
      longDateFormat,
    } = this.props;

    const items: DescriptionListItem[] = [
      {
        term: translate('Version'),
        description: version,
      },
    ];

    if (packageVersion) {
      items.push({
        term: translate('PackageVersion'),
        description: packageAuthor ? (
          <span>
            {packageVersion} {' by '} <InlineMarkdown data={packageAuthor} />
          </span>
        ) : (
          packageVersion
        ),
      });
    }

    if (isNetCore) {
      items.push({
        term: translate('NETCore'),
        description: `Yes (${runtimeVersion})`,
      });
    }

    if (isDocker) {
      items.push({
        term: translate('Docker'),
        description: 'Yes',
      });
    }

    items.push(
      {
        term: translate('Database'),
        description: `${titleCase(databaseType)} ${databaseVersion}`,
      },
      {
        term: translate('DatabaseMigration'),
        description: migrationVersion.toString(),
      },
      {
        term: translate('AppDataDirectory'),
        description: appData,
      },
      {
        term: translate('StartupDirectory'),
        description: startupPath,
      },
      {
        term: translate('Mode'),
        description: titleCase(mode),
      },
      {
        term: translate('Uptime'),
        description: (
          <StartTime
            startTime={startTime}
            timeFormat={timeFormat}
            longDateFormat={longDateFormat}
          />
        ),
      }
    );

    return (
      <FieldSet legend={translate('About')}>
        <DescriptionList items={items} orientation="horizontal" size="md" className="mb-2" />
      </FieldSet>
    );
  }
}

export default About;
