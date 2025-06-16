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
import { getRunningOperation } from '@state/selectors/runningOperations';

import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';
import { updateCatalog } from '@state/catalog';
import {
  updateLastExecution,
  hostExecutionRequested,
} from '@state/lastExecutions';
import {
  operationRequested,
  updateRunningOperation,
  removeRunningOperation,
} from '@state/runningOperations';

import { deregisterHost } from '@state/hosts';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';

import {
  getSoftwareUpdatesErrorMessage,
  getSoftwareUpdatesErrorTooltip,
} from './suseManagerMessaging';
import HostDetails from './HostDetails';

const chartsEnabled = getFromConfig('chartsEnabled');
const operationsEnabled = getFromConfig('operationsEnabled');

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

  const runningOperation = useSelector(getRunningOperation(hostID));

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
    operationsEnabled && dispatch(updateRunningOperation(hostID));
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
      relevantPatches={numRelevantPatches}
      upgradablePackages={numUpgradablePackages}
      softwareUpdatesSettingsSaved={settingsConfigured}
      softwareUpdatesLoading={softwareUpdatesLoading}
      softwareUpdatesErrorMessage={softwareUpdatesErrorMessage}
      softwareUpdatesTooltip={softwareUpdatesTooltip}
      userAbilities={abilities}
      operationsEnabled={operationsEnabled}
      runningOperation={runningOperation}
      cleanUpHost={() => {
        dispatch(deregisterHost({ id: hostID, hostname: host.hostname }));
      }}
      requestHostChecksExecution={() => {
        dispatch(hostExecutionRequested(host, hostSelectedChecks, navigate));
      }}
      requestOperation={(operation, params) =>
        dispatch(
          operationRequested({
            groupID: hostID,
            operation,
            requestParams: { hostID, params },
          })
        )
      }
      cleanForbiddenOperation={() =>
        dispatch(removeRunningOperation({ groupID: hostID }))
      }
      navigate={navigate}
    />
  );
}

export default HostDetailsPage;
