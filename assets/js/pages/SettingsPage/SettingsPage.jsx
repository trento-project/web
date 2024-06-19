import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import { values, isUndefined } from 'lodash';
import { format, isBefore, parseISO } from 'date-fns';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';
import { logError } from '@lib/log';
import { get, patch } from '@lib/network';
import { getFromConfig } from '@lib/config';

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

import {
  fetchSoftwareUpdatesSettings,
  saveSoftwareUpdatesSettings,
  updateSoftwareUpdatesSettings,
  setEditingSoftwareUpdatesSettings,
  clearSoftwareUpdatesSettings,
  testSoftwareUpdatesConnection,
  setSoftwareUpdatesSettingsErrors,
} from '@state/softwareUpdatesSettings';
import {
  getSoftwareUpdatesSettings,
  getSoftwareUpdatesSettingsErrors,
} from '@state/selectors/softwareUpdatesSettings';

import { dismissNotification } from '@state/notifications';
import { API_KEY_EXPIRATION_NOTIFICATION_ID } from '@state/sagas/settings';

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

  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [apiKeyExpiration, setApiKeyExpiration] = useState(null);
  const [apiKeySettingModalOpen, setApiKeySettingsModalOpen] = useState(false);
  const [clearingSoftwareUpdatesSettings, setClearingSoftwareUpdatesSettings] =
    useState(false);

  const fetchApiKeySettings = () =>
    get('/settings/api_key')
      .then(
        ({ data: { generated_api_key: newApiKey, expire_at: expireAt } }) => {
          setApiKey(newApiKey);
          setApiKeyExpiration(expireAt);
        }
      )
      .catch((error) => {
        logError(error);
      })
      .finally(() => {
        setLoading(false);
      });

  const saveApiKeySettings = (expiration) => {
    setLoading(true);
    patch('/settings/api_key', { expire_at: expiration })
      .then(
        ({ data: { generated_api_key: newApiKey, expire_at: expireAt } }) => {
          setApiKey(newApiKey);
          setApiKeyExpiration(expireAt);
          dispatch(dismissNotification(API_KEY_EXPIRATION_NOTIFICATION_ID));
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchApiKeySettings();
    dispatch(fetchSoftwareUpdatesSettings());
  }, []);

  const {
    settings,
    loading: softwareUpdatesSettingsLoading,
    editing: editingSoftwareUpdatesSettings,
    networkError: softwareUpdatesSettingsNetworkError,
    testingConnection: testingSoftwareUpdatesConnection,
  } = useSelector(getSoftwareUpdatesSettings);

  const suseManagerValidationErrors = useSelector(
    getSoftwareUpdatesSettingsErrors
  );

  const hasSoftwareUpdatesSettings = values(settings).every(
    (value) => !isUndefined(value)
  );

  const hasApiKey = Boolean(apiKey);

  return (
    <section>
      <PageHeader className="font-bold">Settings</PageHeader>
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
              <Transition
                show={Boolean(apiKey)}
                enter="transition duration-100 ease-out"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
              >
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
              </Transition>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-8">
            <div className="!ml-auto w-1/4">
              <Button
                onClick={() => setApiKeySettingsModalOpen(true)}
                type="primary-white"
              >
                Generate Key
              </Button>
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
                    Keep an eagle eye on the target SAP Landscape and don&apos;t
                    miss important updates.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ApiKeySettingsModal
        open={apiKeySettingModalOpen}
        loading={loading}
        generatedApiKey={apiKey}
        generatedApiKeyExpiration={apiKeyExpiration}
        onClose={() => setApiKeySettingsModalOpen(false)}
        onGenerate={({ apiKeyExpiration: generatedApiKeyExpiration }) =>
          saveApiKeySettings(generatedApiKeyExpiration)
        }
      />
      {getFromConfig('suseManagerEnabled') && (
        <div className="py-4">
          <SettingsLoader
            sectionName="SUSE Manager"
            status={calculateSettingsLoaderStatus(
              softwareUpdatesSettingsLoading,
              softwareUpdatesSettingsNetworkError
            )}
            onRetry={() => dispatch(fetchSoftwareUpdatesSettings())}
          >
            <SuseManagerConfig
              url={settings.url}
              username={settings.username}
              certUploadDate={settings.ca_uploaded_at}
              onEditClick={() =>
                dispatch(setEditingSoftwareUpdatesSettings(true))
              }
              clearSettingsDialogOpen={clearingSoftwareUpdatesSettings}
              onClearClick={() => setClearingSoftwareUpdatesSettings(true)}
              onClearSettings={() => {
                setClearingSoftwareUpdatesSettings(false);
                dispatch(clearSoftwareUpdatesSettings());
              }}
              testConnectionEnabled={
                hasSoftwareUpdatesSettings && !testingSoftwareUpdatesConnection
              }
              onTestConnection={() => {
                dispatch(testSoftwareUpdatesConnection());
              }}
              onCancel={() => setClearingSoftwareUpdatesSettings(false)}
            />
          </SettingsLoader>
          <SuseManagerSettingsModal
            key={`${settings.url}-${settings.username}-${settings.ca_uploaded_at}-${editingSoftwareUpdatesSettings}`}
            open={editingSoftwareUpdatesSettings}
            errors={suseManagerValidationErrors}
            loading={softwareUpdatesSettingsLoading}
            initialUsername={settings.username}
            initialUrl={settings.url}
            certUploadDate={settings.ca_uploaded_at}
            onSave={(payload) => {
              if (
                settings.username ||
                settings.url ||
                settings.ca_uploaded_at
              ) {
                dispatch(updateSoftwareUpdatesSettings(payload));
              } else {
                dispatch(saveSoftwareUpdatesSettings(payload));
              }
            }}
            onCancel={() => {
              dispatch(setSoftwareUpdatesSettingsErrors([]));
              dispatch(setEditingSoftwareUpdatesSettings(false));
            }}
          />
        </div>
      )}
    </section>
  );
}

export default SettingsPage;
