import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import { AppDispatch } from 'Store/types';
import * as commandNames from 'Commands/commandNames';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchGeneralSettings } from 'Store/Actions/settingsActions';
import { fetchUpdates } from 'Store/Actions/systemActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import { UpdateMechanism } from 'typings/Settings/General';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import translate from 'Utilities/String/translate';
import { Badge } from 'ComponentsV2/UI';
import { Spinner } from 'ComponentsV2/UI';
import UpdateChanges from './UpdateChanges';

const VERSION_REGEX = /\d+\.\d+\.\d+\.\d+/i;

function createUpdatesSelector() {
  return createSelector(
    (state: AppState) => state.system.updates,
    (state: AppState) => state.settings.general,
    (updates, generalSettings) => {
      const { error: updatesError, items } = updates;

      const isFetching = updates.isFetching || generalSettings.isFetching;
      const isPopulated = updates.isPopulated && generalSettings.isPopulated;

      return {
        isFetching,
        isPopulated,
        updatesError,
        generalSettingsError: generalSettings.error,
        items,
        updateMechanism: generalSettings.item.updateMechanism,
      };
    }
  );
}

function Updates() {
  const currentVersion = useSelector((state: AppState) => state.app.version);
  const { packageUpdateMechanismMessage } = useSelector(
    createSystemStatusSelector()
  );
  const { shortDateFormat, longDateFormat, timeFormat } = useSelector(
    createUISettingsSelector()
  );
  const isInstallingUpdate = useSelector(
    createCommandExecutingSelector(commandNames.APPLICATION_UPDATE)
  );

  const {
    isFetching,
    isPopulated,
    updatesError,
    generalSettingsError,
    items,
    updateMechanism,
  } = useSelector(createUpdatesSelector());

  const dispatch = useDispatch<AppDispatch>();
  const [isMajorUpdateModalOpen, setIsMajorUpdateModalOpen] = useState(false);
  const hasError = !!(updatesError || generalSettingsError);
  const hasUpdates = isPopulated && !hasError && items.length > 0;
  const noUpdates = isPopulated && !hasError && !items.length;

  const externalUpdaterPrefix = translate('UpdateAppDirectlyLoadError');
  const externalUpdaterMessages: Partial<Record<UpdateMechanism, string>> = {
    external: translate('ExternalUpdater'),
    apt: translate('AptUpdater'),
    docker: translate('DockerUpdater'),
  };

  const { isMajorUpdate, hasUpdateToInstall } = useMemo(() => {
    const majorVersion = parseInt(
      currentVersion.match(VERSION_REGEX)?.[0] ?? '0'
    );

    const latestVersion = items[0]?.version;
    const latestMajorVersion = parseInt(
      latestVersion?.match(VERSION_REGEX)?.[0] ?? '0'
    );

    return {
      isMajorUpdate: latestMajorVersion > majorVersion,
      hasUpdateToInstall: items.some(
        (update) => update.installable && update.latest
      ),
    };
  }, [currentVersion, items]);

  const noUpdateToInstall = hasUpdates && !hasUpdateToInstall;

  const handleInstallLatestPress = useCallback(() => {
    if (isMajorUpdate) {
      setIsMajorUpdateModalOpen(true);
    } else {
      dispatch(executeCommand({ name: commandNames.APPLICATION_UPDATE }));
    }
  }, [isMajorUpdate, setIsMajorUpdateModalOpen, dispatch]);

  const handleInstallLatestMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);

    dispatch(
      executeCommand({
        name: commandNames.APPLICATION_UPDATE,
        installMajorUpdate: true,
      })
    );
  }, [setIsMajorUpdateModalOpen, dispatch]);

  const handleCancelMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);
  }, [setIsMajorUpdateModalOpen]);

  useEffect(() => {
    dispatch(fetchUpdates());
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return (
    <PageContent title={translate('Updates')}>
      <PageContentBody>
        {isPopulated || hasError ? null : <LoadingIndicator />}

        {noUpdates ? (
          <Alert kind={kinds.INFO}>{translate('NoUpdatesAreAvailable')}</Alert>
        ) : null}

        {hasUpdateToInstall ? (
          <div className="mb-5 flex items-center gap-3">
            {updateMechanism === 'builtIn' || updateMechanism === 'script' ? (
              <SpinnerButton
                kind={kinds.PRIMARY}
                isSpinning={isInstallingUpdate}
                onPress={handleInstallLatestPress}
              >
                {translate('InstallLatest')}
              </SpinnerButton>
            ) : (
              <>
                <Icon name={icons.WARNING} kind={kinds.WARNING} size={30} />

                <div className="pl-1 text-lg leading-[30px] text-zinc-700 dark:text-zinc-300">
                  {externalUpdaterPrefix}{' '}
                  <InlineMarkdown
                    data={
                      packageUpdateMechanismMessage ||
                      externalUpdaterMessages[updateMechanism] ||
                      externalUpdaterMessages.external
                    }
                  />
                </div>
              </>
            )}

            {isFetching ? (
              <Spinner size="sm" className="ml-auto mt-1" />
            ) : null}
          </div>
        ) : null}

        {noUpdateToInstall && (
          <div className="mb-5 flex items-center gap-3">
            <Icon
              className="text-emerald-500"
              name={icons.CHECK_CIRCLE}
              size={30}
            />
            <div className="pl-1 text-lg leading-[30px] text-zinc-700 dark:text-zinc-300">
              {translate('OnLatestVersion')}
            </div>

            {isFetching && (
              <Spinner size="sm" className="ml-auto mt-1" />
            )}
          </div>
        )}

        {hasUpdates && (
          <div className="space-y-5">
            {items.map((update) => {
              return (
                <div key={update.version} className="mt-5">
                  <div className="mb-2 flex items-center gap-2 border-b border-zinc-200 pb-1 dark:border-zinc-800">
                    <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {update.version}
                    </div>
                    <div className="px-1 text-zinc-500 dark:text-zinc-400">&mdash;</div>
                    <div
                      className="text-base text-zinc-600 dark:text-zinc-400"
                      title={formatDateTime(
                        update.releaseDate,
                        longDateFormat,
                        timeFormat
                      )}
                    >
                      {formatDate(update.releaseDate, shortDateFormat)}
                    </div>

                    {update.branch === 'master' ? null : (
                      <Badge variant="neutral" size="sm" className="ml-2">
                        {update.branch}
                      </Badge>
                    )}

                    {update.version === currentVersion ? (
                      <Badge
                        variant="success"
                        size="sm"
                        className="ml-2"
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('CurrentlyInstalled')}
                      </Badge>
                    ) : null}

                    {update.version !== currentVersion && update.installedOn ? (
                      <Badge
                        variant="neutral"
                        size="sm"
                        className="ml-2"
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('PreviouslyInstalled')}
                      </Badge>
                    ) : null}
                  </div>

                  {update.changes ? (
                    <div>
                      <UpdateChanges
                        title={translate('New')}
                        changes={update.changes.new}
                      />

                      <UpdateChanges
                        title={translate('Fixed')}
                        changes={update.changes.fixed}
                      />
                    </div>
                  ) : (
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {translate('MaintenanceRelease')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {updatesError ? (
          <Alert kind={kinds.WARNING}>
            {translate('FailedToFetchUpdates')}
          </Alert>
        ) : null}

        {generalSettingsError ? (
          <Alert kind={kinds.DANGER}>
            {translate('FailedToFetchSettings')}
          </Alert>
        ) : null}

        <ConfirmModal
          isOpen={isMajorUpdateModalOpen}
          kind={kinds.WARNING}
          title={translate('InstallMajorVersionUpdate')}
          message={
            <div>
              <div>{translate('InstallMajorVersionUpdateMessage')}</div>
              <div>
                <InlineMarkdown
                  data={translate('InstallMajorVersionUpdateMessageLink', {
                    domain: 'readarr.com',
                    url: 'https://readarr.com/#downloads',
                  })}
                />
              </div>
            </div>
          }
          confirmLabel={translate('Install')}
          onConfirm={handleInstallLatestMajorVersionPress}
          onCancel={handleCancelMajorVersionPress}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default Updates;
