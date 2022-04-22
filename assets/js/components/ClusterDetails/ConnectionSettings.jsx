import { EOS_CANCEL, EOS_ERROR, EOS_LOADING_ANIMATED } from 'eos-icons-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingBox from '../LoadingBox';
import NotificationBox from '../NotificationBox';
import Table from '@components/Table';
import { Switch } from '@headlessui/react';

import classNames from 'classnames';

export const ConnectionSettings = ({ clusterId, cluster }) => {
  const { loading, saving, error, settings, savingError } = useSelector(
    (state) => state.clusterConnectionSettings
  );
  const [localSettings, setLocalSettings] = useState([]);
  const [localSavingError, setLocalSavingError] = useState(null);

  const dispatch = useDispatch();

  const loadConnectionSettings = () => {
    dispatch({
      type: 'LOAD_CLUSTER_CONNECTION_SETTINGS',
      payload: { cluster: clusterId },
    });
  };

  useEffect(loadConnectionSettings, [dispatch]);
  useEffect(
    () =>
      setLocalSettings(
        settings.map((hostSettings) => ({
          ...hostSettings,
          isDefaultUser:
            hostSettings.user === hostSettings.default_user ||
            !hostSettings.user,
        }))
      ),
    [settings]
  );
  useEffect(() => {
    setLocalSavingError(savingError);
  }, [savingError]);

  if (loading) {
    return <LoadingBox text="Loading Cluster Connection Settings..." />;
  }

  if (error) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={error}
        buttonText="Try again"
        buttonOnClick={loadConnectionSettings}
      />
    );
  }

  const setHostConnectionUser = (hostId, connectionUser) => {
    setLocalSettings(
      localSettings.map((hostSettings) => {
        if (hostSettings.host_id === hostId) {
          const user = connectionUser.trim() !== '' ? connectionUser : null;
          return {
            ...hostSettings,
            user,
            isDefaultUser: user === hostSettings.default_user,
          };
        }
        return hostSettings;
      })
    );
  };

  const toggleUseDefaultConnectionUser = (hostId) => {
    setLocalSettings(
      localSettings.map((hostSettings) => {
        if (hostSettings.host_id === hostId && hostSettings.user) {
          return {
            ...hostSettings,
            isDefaultUser: !hostSettings.isDefaultUser,
          };
        }
        return hostSettings;
      })
    );
  };

  const connectionSettingsTableConfig = {
    usePadding: false,
    columns: [
      { title: 'Hostname', key: 'hostname' },
      {
        title: 'Connection User',
        key: 'user',
        render: (content, item) => {
          return (
            <input
              type="text"
              id={item.host_id}
              className="rounded-lg border-transparent flex-1 appearance-none border border-gray-100 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:focus:border-transparent"
              placeholder="Provide a user if different from the default one"
              value={content || ''}
              onChange={({ target: { value } }) =>
                setHostConnectionUser(item.host_id, value)
              }
            />
          );
        },
      },
      {
        title: 'Default User',
        key: 'default_user',
        render: (content, item) => {
          return (
            <Switch.Group as="div" className="flex items-center">
              <Switch.Label className="mr-4">{content}</Switch.Label>
              <Switch
                checked={item.isDefaultUser}
                className={classNames(
                  item.isDefaultUser ? 'bg-jungle-green-500' : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200'
                )}
                onChange={() => toggleUseDefaultConnectionUser(item.host_id)}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    item.isDefaultUser ? 'translate-x-5' : 'translate-x-0',
                    'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  )}
                />
              </Switch>
            </Switch.Group>
          );
        },
      },
    ],
  };

  return (
    <div>
      <Table config={connectionSettingsTableConfig} data={localSettings} />
      <div className="place-items-end flex">
        <button
          disabled={saving}
          className="flex justify-center items-center bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            const ls = localSettings.map((hostSettings) => {
              if (hostSettings.isDefaultUser) {
                return { ...hostSettings, user: null };
              }
              return hostSettings;
            });

            dispatch({
              type: 'SAVE_CLUSTER_CONNECTION_SETTINGS',
              payload: {
                cluster: cluster?.id,
                settings: ls,
              },
            });
            // dispatch({
            //     type: 'CHECKS_SELECTED',
            //     payload: { checks: selectedChecks, clusterID: clusterID },
            // });
            // navigate(`/clusters/${clusterID}/checks/results`);
          }}
        >
          {saving ? (
            <span className="px-20">
              <EOS_LOADING_ANIMATED color="green" size={25} />
            </span>
          ) : (
            'Save Connection Settings'
          )}
        </button>
        {localSavingError && (
          <div
            className="rounded relative bg-red-200 border-red-600 text-red-600 border-l-4 p-2 ml-2 pr-10"
            role="alert"
          >
            <p>{savingError}</p>
            <button
              className="absolute top-0 bottom-0 right-0 pr-2"
              onClick={() => setLocalSavingError(null)}
            >
              <EOS_CANCEL size={14} className="fill-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
