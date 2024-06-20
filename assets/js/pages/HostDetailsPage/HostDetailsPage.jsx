import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

import { getFromConfig } from '@lib/config';
import { networkClient } from '@lib/network';

import { TARGET_HOST } from '@lib/model';

import { getClusterByHost } from '@state/selectors/cluster';
import { getInstancesOnHost } from '@state/selectors/sapSystem';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import {
  getSoftwareUpdatesSettingsLoading,
  getSoftwareUpdatesSettingsSaved,
} from '@state/selectors/softwareUpdatesSettings';
import {
  getSoftwareUpdatesLoading,
  getSoftwareUpdatesStats,
} from '@state/selectors/softwareUpdates';

import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';
import { updateCatalog } from '@state/catalog';
import {
  updateLastExecution,
  hostExecutionRequested,
} from '@state/lastExecutions';

import { deregisterHost } from '@state/hosts';
import { fetchSoftwareUpdatesSettings } from '@state/softwareUpdatesSettings';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';
import HostDetails from './HostDetails';

const chartsEnabled = getFromConfig('chartsEnabled');
const suseManagerEnabled = getFromConfig('suseManagerEnabled');

function HostDetailsPage() {
  const { hostID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const host = useSelector(getHost(hostID));
  const cluster = useSelector((state) => getClusterByHost(state, hostID));
  const sapInstances = useSelector((state) =>
    getInstancesOnHost(state, hostID)
  );

  const lastExecution = useSelector(getLastExecution(hostID));
  const catalog = useSelector(getCatalog());

  const hostSelectedChecks = useSelector((state) =>
    getHostSelectedChecks(state, hostID)
  );
  const saving = useSelector(isSaving(TARGET_HOST, hostID));

  const [exportersStatus, setExportersStatus] = useState([]);

  const softwareUpdatesSettingsLoading = useSelector((state) =>
    getSoftwareUpdatesSettingsLoading(state)
  );
  const softwareUpdatesConnectionSaved = useSelector((state) =>
    getSoftwareUpdatesSettingsSaved(state)
  );
  const { numRelevantPatches, numUpgradablePackages } = useSelector((state) =>
    getSoftwareUpdatesStats(state, hostID)
  );

  const softwareUpdatesLoading = useSelector((state) =>
    getSoftwareUpdatesLoading(state, hostID)
  );

  const getExportersStatus = async () => {
    const { data } = await networkClient.get(
      `/hosts/${hostID}/exporters_status`
    );
    setExportersStatus(data);
  };

  const refreshCatalog = () =>
    dispatch(
      updateCatalog({
        provider: host?.provider,
        target_type: TARGET_HOST,
      })
    );

  useEffect(() => {
    getExportersStatus();
    refreshCatalog();
    dispatch(updateLastExecution(hostID));
    dispatch(fetchSoftwareUpdates(hostID));
    dispatch(fetchSoftwareUpdatesSettings());
  }, []);

  if (!host) {
    return <div>Not Found</div>;
  }

  return (
    <HostDetails
      agentVersion={host.agent_version}
      chartsEnabled={chartsEnabled}
      cluster={cluster}
      deregisterable={host.deregisterable}
      deregistering={host.deregistering}
      exportersStatus={exportersStatus}
      heartbeat={host.heartbeat}
      hostID={host.id}
      hostname={host.hostname}
      ipAddresses={host.ip_addresses_netmasks}
      provider={host.provider}
      providerData={host.provider_data}
      sapInstances={sapInstances}
      saptuneStatus={get(host, 'saptune_status')}
      savingChecks={saving}
      selectedChecks={hostSelectedChecks}
      slesSubscriptions={host.sles_subscriptions}
      catalog={catalog}
      lastExecution={lastExecution}
      suseManagerEnabled={suseManagerEnabled}
      relevantPatches={numRelevantPatches}
      upgradablePackages={numUpgradablePackages}
      softwareUpdatesSettingsSaved={softwareUpdatesConnectionSaved}
      softwareUpdatesSettingsLoading={softwareUpdatesSettingsLoading}
      softwareUpdatesLoading={softwareUpdatesLoading}
      softwareUpdatesTooltip={
        numRelevantPatches === undefined && numUpgradablePackages === undefined
          ? 'Trento was not able to retrieve the requested data'
          : undefined
      }
      cleanUpHost={() => {
        dispatch(
          deregisterHost({ id: hostID, hostname: host.hostname, navigate })
        );
      }}
      requestHostChecksExecution={() => {
        dispatch(hostExecutionRequested(host, hostSelectedChecks, navigate));
      }}
      navigate={navigate}
    />
  );
}

export default HostDetailsPage;
