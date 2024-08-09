import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import { format, isBefore, parseISO } from 'date-fns';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';
import { getFromConfig } from '@lib/config';

import DisabledGuard from '@common/DisabledGuard';
import PageHeader from '@common/PageHeader';
import Button from '@common/Button';
import SuseManagerConfig from '@common/SuseManagerConfig';
import SuseManagerSettingsModal from '@common/SuseManagerSettingsDialog';
import ApiKeySettingsModal from '@common/ApiKeySettingsModal';
import ApiKeyBox from '@common/ApiKeyBox';
import CopyButton from '@common/CopyButton';
import SettingsLoader, {
  calculateStatus as calculateSettingsLoaderStatus,
} from '@common/SettingsLoader';

import { getUserProfile } from '@state/selectors/user';

import ActivityLogsConfig from '@common/ActivityLogsConfig';
import ActivityLogsSettingsModal from '@common/ActivityLogsSettingsModal';
import {
  fetchActivityLogsSettings,
  updateActivityLogsSettings,
  setEditingActivityLogsSettings,
  setActivityLogsSettingsErrors,
} from '@state/activityLogsSettings';
import {
  getActivityLogsSettings,
  getActivityLogsSettingsErrors,
} from '@state/selectors/activityLogsSettings';

import {
  useApiKeySettings,
  useSuseManagerSettings,
} from '@pages/SettingsPage/hooks';

const apiKeySettingsPermittedFor = ['all:api_key_settings'];

function ApiKeyExpireInfo({ apiKeyExpiration }) {
  const expirationLabel = () => {
    if (!apiKeyExpiration) {
      return 'Key will never expire';
    }

    const expireDate = parseISO(apiKeyExpiration);
    if (apiKeyExpiration && isBefore(new Date(), expireDate)) {
      return `Key will expire ${format(expireDate, 'd LLL yyyy')}`;
    }

    return 'Key expired';
  };

  return (
    <div className="flex space-x-2 my-4">
      <EOS_INFO_OUTLINED size="20" className="mt-2" />
      <div className="mt-1 text-gray-600 text-sm">{expirationLabel()}</div>
    </div>
  );
}

function SettingsPage() {
  const dispatch = useDispatch();
  const { saveApiKeySettings, apiKey, apiKeyExpiration, apiKeyLoading } =
    useApiKeySettings();
  const {
    fetchSuseManagerSettings,
    saveSuseManagerSettings,
    updateSuseManagerSettings,
    testSuseManagerSettings,
    deleteSuseManagerSettings,
    suseManagerSettingsLoading,
    suseManagerSettings,
    suseManagerSettingsEntityErrors,
    suseManagerSettingsfetchError,
    suseManagerSettingsTesting,
    clearSuseManagerEntityErrors,
  } = useSuseManagerSettings();

  const [suseManagerSettingsModalOpen, setSuseManagerSettingsModalOpen] =
    useState(false);

  const [apiKeySettingModalOpen, setApiKeySettingsModalOpen] = useState(false);
  const [clearingSoftwareUpdatesSettings, setClearingSoftwareUpdatesSettings] =
    useState(false);

  useEffect(() => {
    dispatch(fetchActivityLogsSettings());
  }, []);

  useEffect(() => {
    setSuseManagerSettingsModalOpen(false);
  }, [suseManagerSettings]);

  const hasSoftwareUpdatesSettings =
    Object.keys(suseManagerSettings).length > 0;

  const { abilities } = useSelector(getUserProfile);

  const {
    settings: activityLogsSettings = {},
    loading: activityLogsSettingsLoading,
    editing: editingActivityLogsSettings,
    networkError: activityLogsSettingsNetworkError,
  } = useSelector(getActivityLogsSettings);

  const activityLogsValidationErrors = useSelector(
    getActivityLogsSettingsErrors
  );

  const hasApiKey = Boolean(apiKey);

  return (
    <>
      <PageHeader className="font-bold">Settings</PageHeader>
      <section>
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex flex-wrap -mx-8">
            <div className="w-full lg:w-1/2 px-8">
              <div className="mb-12 lg:mb-0 pb-12 lg:pb-0 border-b lg:border-b-0">
                <h2 className="mb-4 text-3xl lg:text-4xl font-bold font-heading dark:text-white">
                  API Key
                </h2>
                <p className="mb-6 text-gray-500 dark:text-gray-300">
                  Trento API key is necessary for Trento Agents to communicate
                  with the control plane.
                  <br />
                  <br />
                  Get your key here 👇 and use it to register your first agents,
                  or to add new ones.
                </p>
                <Transition show={Boolean(apiKey)}>
                  <div className="transition duration-100 ease-out data-[closed]:opacity-0">
                    {hasApiKey ? (
                      <div className="flex">
                        <ApiKeyBox apiKey={apiKey} className="!w-11/12" />
                        <CopyButton content={apiKey} />
                      </div>
                    ) : (
                      <span>
                        We were unable to provide you the API key you need 😱
                        <br />
                        Contact support for help!
                      </span>
                    )}

                    {apiKey && (
                      <ApiKeyExpireInfo apiKeyExpiration={apiKeyExpiration} />
                    )}
                  </div>
                </Transition>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-8">
              <div className="!ml-auto w-1/4">
                <DisabledGuard
                  userAbilities={abilities}
                  permitted={apiKeySettingsPermittedFor}
                >
                  <Button
                    onClick={() => setApiKeySettingsModalOpen(true)}
                    type="primary-white"
                  >
                    Generate Key
                  </Button>
                </DisabledGuard>
              </div>
              <ul className="space-y-12">
                <li className="flex -mx-4">
                  <div className="px-4">
                    <span className="flex w-16 h-16 mx-auto items-center justify-center text-2xl font-bold font-heading rounded-full bg-jungle-green-100 text-jungle-green-500">
                      1
                    </span>
                  </div>
                  <div className="px-4">
                    <h3 className="my-4 text-xl font-semibold dark:text-white">
                      Get your API key
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 leading-loose">
                      Click on the button on the left to get your API key.
                    </p>
                  </div>
                </li>
                <li className="flex -mx-4">
                  <div className="px-4">
                    <span className="flex w-16 h-16 mx-auto items-center justify-center text-2xl font-bold font-heading rounded-full bg-jungle-green-100 text-jungle-green-500">
                      2
                    </span>
                  </div>
                  <div className="px-4">
                    <h3 className="my-4 text-xl font-semibold dark:text-white">
                      Register Trento Agents
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 leading-loose">
                      Register your first{' '}
                      <a
                        className="text-jungle-green-500 hover:opacity-75"
                        href="https://github.com/trento-project/agent"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Trento Agents
                      </a>{' '}
                      or add new ones to the target SAP Landscape.
                    </p>
                  </div>
                </li>
                <li className="flex -mx-4">
                  <div className="px-4">
                    <span className="flex w-16 h-16 mx-auto items-center justify-center text-2xl font-bold font-heading rounded-full bg-jungle-green-100 text-jungle-green-500">
                      3
                    </span>
                  </div>
                  <div className="px-4">
                    <h3 className="my-4 text-xl font-semibold dark:text-white">
                      Observe and monitor
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 leading-loose">
                      Keep an eagle eye on the target SAP Landscape and
                      don&apos;t miss important updates.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <ApiKeySettingsModal
          open={apiKeySettingModalOpen}
          loading={apiKeyLoading}
          generatedApiKey={apiKey}
          generatedApiKeyExpiration={apiKeyExpiration}
          onClose={() => setApiKeySettingsModalOpen(false)}
          onGenerate={({ apiKeyExpiration: generatedApiKeyExpiration }) =>
            saveApiKeySettings(generatedApiKeyExpiration)
          }
        />
      </section>

      {getFromConfig('suseManagerEnabled') && (
        <section>
          <div className="py-4">
            <SettingsLoader
              sectionName="SUSE Manager"
              status={calculateSettingsLoaderStatus(
                suseManagerSettingsLoading,
                suseManagerSettingsfetchError
              )}
              onRetry={() => fetchSuseManagerSettings()}
            >
              <SuseManagerConfig
                userAbilities={abilities}
                url={suseManagerSettings.url}
                username={suseManagerSettings.username}
                certUploadDate={suseManagerSettings.ca_uploaded_at}
                onEditClick={() => {
                  clearSuseManagerEntityErrors();
                  setSuseManagerSettingsModalOpen(true);
                }}
                clearSettingsDialogOpen={clearingSoftwareUpdatesSettings}
                onClearClick={() => setClearingSoftwareUpdatesSettings(true)}
                onClearSettings={() => {
                  deleteSuseManagerSettings();
                  setClearingSoftwareUpdatesSettings(false);
                }}
                testConnectionEnabled={
                  hasSoftwareUpdatesSettings && !suseManagerSettingsTesting
                }
                onTestConnection={() => testSuseManagerSettings()}
                onCancel={() => {
                  setClearingSoftwareUpdatesSettings(false);
                }}
              />
            </SettingsLoader>
            <SuseManagerSettingsModal
              key={`${suseManagerSettings.url}-${suseManagerSettings.username}-${suseManagerSettings.ca_uploaded_at}-${suseManagerSettingsModalOpen}`}
              open={suseManagerSettingsModalOpen}
              errors={suseManagerSettingsEntityErrors}
              loading={suseManagerSettingsLoading}
              initialUsername={suseManagerSettings.username}
              initialUrl={suseManagerSettings.url}
              certUploadDate={suseManagerSettings.ca_uploaded_at}
              onSave={(payload) => {
                if (
                  suseManagerSettings.username ||
                  suseManagerSettings.url ||
                  suseManagerSettings.ca_uploaded_at
                ) {
                  updateSuseManagerSettings(payload);
                } else {
                  saveSuseManagerSettings(payload);
                }
              }}
              onCancel={() => setSuseManagerSettingsModalOpen(false)}
            />
          </div>
        </section>
      )}
      <section>
        <SettingsLoader
          sectionName="Activity Logs"
          status={calculateSettingsLoaderStatus(
            activityLogsSettingsLoading,
            activityLogsSettingsNetworkError
          )}
          onRetry={() => dispatch(fetchActivityLogsSettings())}
        >
          <ActivityLogsConfig
            userAbilities={abilities}
            retentionTime={activityLogsSettings.retention_time}
            onEditClick={() => dispatch(setEditingActivityLogsSettings(true))}
          />
        </SettingsLoader>
        <ActivityLogsSettingsModal
          key={`${JSON.stringify(
            activityLogsSettings
          )}-${editingActivityLogsSettings}`}
          open={editingActivityLogsSettings}
          errors={activityLogsValidationErrors}
          loading={activityLogsSettingsLoading}
          initialRetentionTime={activityLogsSettings.retention_time}
          onSave={(payload) => {
            dispatch(updateActivityLogsSettings(payload));
          }}
          onCancel={() => {
            dispatch(setActivityLogsSettingsErrors([]));
            dispatch(setEditingActivityLogsSettings(false));
          }}
        />
      </section>
    </>
  );
}

export default SettingsPage;
