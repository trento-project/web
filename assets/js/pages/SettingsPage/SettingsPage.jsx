import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';

import { logError } from '@lib/log';
import { get } from '@lib/network';

import LoadingBox from '@common/LoadingBox';
import PageHeader from '@common/PageHeader';
import Button from '@common/Button';
import SuseManagerSettingsModal from '@common/SuseManagerSettingsDialog';

import {
  fetchSoftwareUpdatesSettings,
  saveSoftwareUpdatesSettings,
  updateSoftwareUpdatesSettings,
  setEditingSoftwareUpdatesSettings,
  clearSoftwareUpdatesSettings,
} from '@state/softwareUpdatesSettings';
import {
  getSoftwareUpdatesSettings,
  getSoftwareUpdatesSettingsErrors,
} from '@state/selectors/softwareUpdatesSettings';

import SuseManagerConfig from '@common/SuseManagerConfig';

function SettingsPage() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [clearingSoftwareUpdatesSettings, setClearingSoftwareUpdatesSettings] =
    useState(false);

  useEffect(() => {
    setLoading(true);
    get('/installation/api-key')
      .then(({ data: { api_key: newApiKey } }) => {
        apiKey !== undefined && setApiKey(newApiKey);
        setLoading(false);
      })
      .catch((error) => {
        logError(error);
        setLoading(false);
      });
    dispatch(fetchSoftwareUpdatesSettings());
  }, []);

  const {
    settings,
    loading: softwareUpdatesSettingsLoading,
    editing: editingSoftwareUpdatesSettings,
  } = useSelector(getSoftwareUpdatesSettings);

  const suseManagerValidationErrors = useSelector(
    getSoftwareUpdatesSettingsErrors
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
              <div className="w-full md:w-1/3 mb-8">
                <Button
                  type="primary"
                  size="big"
                  disabled={loading}
                  onClick={() => setShowApiKey(true)}
                >
                  Get your key now!
                </Button>
              </div>
              <Transition
                show={showApiKey}
                enter="transition duration-100 ease-out"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
              >
                <div
                  className={classNames(
                    'w-full break-words bg-gray-100 p-4 rounded-lg',
                    {
                      'bg-gray-100': hasApiKey,
                      'bg-red-100': !hasApiKey,
                    }
                  )}
                >
                  <code>
                    {hasApiKey ? (
                      apiKey
                    ) : (
                      <span>
                        We were unable to provide you the API key you need 😱
                        <br />
                        Contact support for help!
                      </span>
                    )}
                  </code>
                </div>
              </Transition>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-8">
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
      <div className="py-4">
        {softwareUpdatesSettingsLoading ? (
          <LoadingBox
            className="shadow-none rounded-lg"
            text="Loading Settings..."
          />
        ) : (
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
            onCancel={() => setClearingSoftwareUpdatesSettings(false)}
          />
        )}
        <SuseManagerSettingsModal
          key={`${settings.url}-${settings.username}-${settings.ca_uploaded_at}-${editingSoftwareUpdatesSettings}`}
          open={editingSoftwareUpdatesSettings}
          errors={suseManagerValidationErrors}
          loading={softwareUpdatesSettingsLoading}
          initialUsername={settings.username}
          initialUrl={settings.url}
          certUploadDate={settings.ca_uploaded_at}
          onSave={(payload) => {
            if (settings.username || settings.url || settings.ca_uploaded_at) {
              dispatch(updateSoftwareUpdatesSettings(payload));
            } else {
              dispatch(saveSoftwareUpdatesSettings(payload));
            }
          }}
          onCancel={() => dispatch(setEditingSoftwareUpdatesSettings(false))}
        />
      </div>
    </section>
  );
}

export default SettingsPage;
