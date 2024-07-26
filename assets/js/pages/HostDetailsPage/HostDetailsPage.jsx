import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

import { getFromConfig } from '@lib/config';
import { networkClient } from '@lib/network';

import { TARGET_HOST } from '@lib/model';

import { getUserProfile } from '@state/selectors/user';
import { getClusterByHost } from '@state/selectors/cluster';
import { getInstancesOnHost } from '@state/selectors/sapSystem';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import {
  getSoftwareUpdatesSettingsConfigured,
  getSoftwareUpdatesLoading,
  getSoftwareUpdatesStats,
  getSoftwareUpdatesErrors,
} from '@state/selectors/softwareUpdates';

import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';
import { updateCatalog } from '@state/catalog';
import {
  updateLastExecution,
  hostExecutionRequested,
} from '@state/lastExecutions';

import { deregisterHost } from '@state/hosts';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';
import HostDetails from './HostDetails';

const chartsEnabled = getFromConfig('chartsEnabled');
const suseManagerEnabled = getFromConfig('suseManagerEnabled');

const getSoftwareUpdatesErrorMessage = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail === 'No system ID was found on SUSE Manager for this host.'
  );

  if (hostNotFoundInSUMA) {
    return 'Host not found in SUSE manager';
  }

  if (errors.length) {
    return 'Connection to SUMA not working';
  }

  return 'Unknown';
};

const getSoftwareUpdatesErrorTooltip = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail === 'No system ID was found on SUSE Manager for this host.'
  );

  if (hostNotFoundInSUMA) {
    return 'Contact your SUSE Manager admin to ensure the host is managed by SUSE Manager';
  }

  if (errors.length) {
    return 'Please review SUSE Manager settings';
  }

  return undefined;
};

function HostDetailsPage() {
  const { hostID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const host = useSelector(getHost(hostID));
  const cluster = useSelector((state) => getClusterByHost(state, hostID));
  const sapInstances = useSelector((state) =>
    getInstancesOnHost(state, hostID)
  );
  const { abilities } = useSelector(getUserProfile);

  const lastExecution = useSelector(getLastExecution(hostID));
  const catalog = useSelector(getCatalog());

  const hostSelectedChecks = useSelector((state) =>
    getHostSelectedChecks(state, hostID)
  );
  const saving = useSelector(isSaving(TARGET_HOST, hostID));

  const [exportersStatus, setExportersStatus] = useState([]);

  const settingsConfigured = useSelector((state) =>
    getSoftwareUpdatesSettingsConfigured(state)
  );

  const { numRelevantPatches, numUpgradablePackages } = useSelector((state) =>
    getSoftwareUpdatesStats(state, hostID)
  );

  const softwareUpdatesLoading = useSelector((state) =>
    getSoftwareUpdatesLoading(state, hostID)
  );

  const softwareUpdatesErrors = useSelector((state) =>
    getSoftwareUpdatesErrors(state, hostID)
  );

  const softwareUpdatesErrorMessage = getSoftwareUpdatesErrorMessage(
    softwareUpdatesErrors
  );
  const softwareUpdatesTooltip = getSoftwareUpdatesErrorTooltip(
    softwareUpdatesErrors
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
    dispatch(fetchSoftwareUpdates(hostID));
    getExportersStatus();
    refreshCatalog();
    dispatch(updateLastExecution(hostID));
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
      ipAddresses={host.ip_addresses}
      netmasks={host.netmasks}
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
      softwareUpdatesSettingsSaved={settingsConfigured}
      softwareUpdatesLoading={softwareUpdatesLoading}
      softwareUpdatesErrorMessage={softwareUpdatesErrorMessage}
      softwareUpdatesTooltip={softwareUpdatesTooltip}
      userAbilities={abilities}
      cleanUpHost={() => {
        dispatch(deregisterHost({ id: hostID, hostname: host.hostname }));
      }}
      requestHostChecksExecution={() => {
        dispatch(hostExecutionRequested(host, hostSelectedChecks, navigate));
      }}
      navigate={navigate}
    />
  );
}

export default HostDetailsPage;
