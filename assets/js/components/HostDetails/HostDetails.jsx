import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { EOS_CLEAR_ALL, EOS_PLAY_CIRCLE, EOS_SETTINGS } from 'eos-icons-react';

import { networkClient } from '@lib/network';
import { agentVersionWarning } from '@lib/agent';

import Button from '@components/Button';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';
import ListView from '@components/ListView';
import Table from '@components/Table';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import ClusterLink from '@components/ClusterLink';
import WarningBanner from '@components/Banners/WarningBanner';
import CleanUpButton from '@components/CleanUpButton';
import DeregistrationModal from '@components/DeregistrationModal';
import SuseLogo from '@static/suse_logo.svg';
import { getInstancesOnHost, getClusterByHost } from '@state/selectors';

import { getHost } from '@state/selectors/host';

import { deregisterHost } from '@state/hosts';
import StatusPill from './StatusPill';
import ProviderDetails from './ProviderDetails';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

function HostDetails() {
  const { hostID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const host = useSelector(getHost(hostID));
  const cluster = useSelector(getClusterByHost(hostID));
  const sapSystems = useSelector(getInstancesOnHost(hostID));

  // eslint-disable-next-line no-undef
  const { grafanaPublicUrl } = config;

  const [exportersStatus, setExportersStatus] = useState([]);
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);

  const cleanUpHost = ({ id, hostname }) => {
    setCleanUpModalOpen(false);
    dispatch(deregisterHost({ id, hostname, navigate }));
  };

  const getExportersStatus = async () => {
    const { data } = await networkClient.get(
      `/hosts/${hostID}/exporters_status`
    );
    setExportersStatus(data);
  };

  useEffect(() => {
    getExportersStatus();
  }, []);

  if (!host) {
    return <div>Not Found</div>;
  }

  const versionWarningMessage = agentVersionWarning(host.agent_version);

  const renderedExporters = Object.entries(exportersStatus).map(
    ([exporterName, exporterStatus]) => (
      <StatusPill
        key={exporterName}
        className="self-center ml-4 shadow"
        heartbeat={exporterStatus}
      >
        {exporterName}
      </StatusPill>
    )
  );

  return (
    <>
      <DeregistrationModal
        hostname={host.hostname}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          cleanUpHost(host);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <div>
        <BackButton url="/hosts">Back to Hosts</BackButton>
        <div className="flex flex-wrap">
          <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
            <PageHeader>
              Host Details: <span className="font-bold">{host.hostname}</span>
            </PageHeader>
          </div>
          <div className="flex w-1/2 justify-end">
            <div className="flex w-fit whitespace-nowrap">
              {host.deregisterable && (
                <CleanUpButton
                  cleaning={host.deregistering}
                  onClick={() => {
                    setCleanUpModalOpen(true);
                  }}
                />
              )}
              <Button
                type="primary-white"
                className="inline-block mx-0.5 border-green-500 border"
                size="small"
                onClick={() => navigate(`/hosts/${hostID}/settings`)}
              >
                <EOS_SETTINGS className="inline-block fill-jungle-green-500" />{' '}
                Check Selection
              </Button>

              <Button
                type="primary-white"
                className="mx-0.5 border-green-500 border disabled:bg-slate-50 disabled:text-slate-500 disabled:border-gray-400"
                size="small"
                onClick={() => navigate(`/hosts/${hostID}/executions/last`)}
                disabled
              >
                <EOS_CLEAR_ALL
                  className={classNames('inline-block ', {
                    'fill-jungle-green-500': false,
                    'fill-slate-500': true,
                  })}
                />{' '}
                <span>Show Results</span>
              </Button>

              <TriggerChecksExecutionRequest
                cssClasses="flex rounded relative ml-0.5 disabled:bg-gray-400 disabled:text-gray-200 disabled:border-gray-400"
                disabled
              >
                <EOS_PLAY_CIRCLE
                  className={classNames('inline-block mr-1', {
                    'fill-jungle-green-500': false,
                    'fill-gray-200': true,
                  })}
                />{' '}
                <span>Start Execution</span>
              </TriggerChecksExecutionRequest>
            </div>
          </div>
          <div className="pb-3">
            <StatusPill
              className="self-center shadow"
              heartbeat={host.heartbeat}
            >
              Agent
            </StatusPill>
            {renderedExporters}
          </div>
        </div>
        {versionWarningMessage && (
          <WarningBanner>{versionWarningMessage}</WarningBanner>
        )}
        <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
          <ListView
            orientation="vertical"
            data={[
              { title: 'Name', content: host.hostname },
              {
                title: 'Cluster',
                content: <ClusterLink cluster={cluster} />,
              },
              { title: 'Agent version', content: host.agent_version },
            ]}
          />
        </div>
        <div className="mt-8 bg-white shadow rounded-lg py-4 px-8">
          <iframe
            title="node-exporter chart"
            src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=77&var-agentID=${host.id}`}
            width="100%"
            height="200"
            frameBorder="0"
          />
        </div>
        <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
          <iframe
            title="node-exporter chart trento"
            src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=78&var-agentID=${host.id}`}
            width="100%"
            height="200"
            frameBorder="0"
          />
        </div>

        <div className="mt-16">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Provider details</h2>
          </div>
          <ProviderDetails
            provider={host.provider}
            provider_data={host.provider_data}
          />
        </div>

        <div className="mt-8">
          <div>
            <h2 className="text-2xl font-bold">SAP instances</h2>
          </div>
          <Table config={sapInstancesTableConfiguration} data={sapSystems} />
        </div>

        <div className="mt-16">
          <div className="flex flex-direction-row">
            <img src={SuseLogo} className="h-12" alt="suse company logo" />
            <h2 className="ml-2 text-2xl font-bold self-center">
              SLES subscription details
            </h2>
          </div>
          <Table
            config={subscriptionsTableConfiguration}
            data={host.sles_subscriptions}
          />
        </div>
      </div>
    </>
  );
}

export default HostDetails;
