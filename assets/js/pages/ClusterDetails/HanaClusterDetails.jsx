import React from 'react';
import { get, capitalize, sortBy, noop } from 'lodash';

import ListView from '@common/ListView';
import ProviderLabel from '@common/ProviderLabel';
import ClusterTypeLabel from '@common/ClusterTypeLabel';
import SapSystemLink from '@common/SapSystemLink';

import CheckResultsOverview from '@pages/CheckResultsOverview';

import HanaClusterSite from './HanaClusterSite';

export const enrichNodes = (clusterNodes, hosts, resources) =>
  clusterNodes?.map((node) => ({
    ...node,
    ...hosts.find(({ hostname }) => hostname === node.name),
    resources: resources.filter(({ node: nodename }) => nodename === node.name),
  }));

function HanaClusterDetails({
  clusterID,
  hosts,
  clusterType,
  cibLastWritten,
  provider,
  sapSystems,
  clusterSids,
  details,
  catalog,
  lastExecution,
  userAbilities,
  navigate = noop,
  getClusterHostOperations = noop,
}) {
  const enrichedNodes = enrichNodes(details?.nodes, hosts, details?.resources);
  const enrichedSapSystems = clusterSids.map((sidItem) => ({
    sid: sidItem,
    ...sapSystems.find(({ sid: currentSid }) => currentSid === sidItem),
  }));

  const unsitedNodes = enrichedNodes.filter(({ site }) => site === null);

  const {
    data: executionData,
    loading: executionLoading,
    error: executionError,
  } = lastExecution || { loading: true };

  const catalogData = get(catalog, 'data');
  const catalogLoading = get(catalog, 'loading');
  const catalogError = get(catalog, 'error');

  return (
    <>
      <div className="flex xl:flex-row flex-col">
        <div className="tn-cluster-details mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-3/4 w-full mr-4">
          <ListView
            className="grid-rows-3"
            titleClassName="text-lg"
            orientation="vertical"
            data={[
              {
                title: 'Provider',
                content: provider || 'Not defined',
                render: (content) => <ProviderLabel provider={content} />,
              },
              {
                title: 'SID',
                content: enrichedSapSystems,
                render: (content) => (
                  <div>
                    {content.map(({ id, sid: sapSystemSid }) => (
                      <span key={sapSystemSid}>
                        <SapSystemLink sapSystemId={id} systemType="databases">
                          {sapSystemSid}
                        </SapSystemLink>{' '}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Fencing type',
                content: details && details.fencing_type,
              },
              {
                title: 'Cluster type',
                content: clusterType,
                render: (content) => (
                  <ClusterTypeLabel
                    clusterType={content}
                    clusterScenario={details.hana_scenario}
                    architectureType={details.architecture_type}
                  />
                ),
              },
              {
                title: 'Cluster maintenance',
                content: capitalize(get(details, 'maintenance_mode', 'false')),
              },
              {
                title: 'CIB last written',
                content: cibLastWritten || '-',
              },
              {
                title: 'HANA log replication mode',
                content: details && details.system_replication_mode,
              },
              {
                title: 'HANA secondary sync state',
                content: details && details.secondary_sync_state,
              },
              {
                title: 'HANA log operation mode',
                content: details && details.system_replication_operation_mode,
              },
            ]}
          />
        </div>
        <div className="tn-cluster-checks-overview mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4 w-full">
          <CheckResultsOverview
            data={executionData}
            catalogDataEmpty={catalogData?.length === 0}
            loading={catalogLoading || executionLoading}
            error={catalogError || executionError}
            onCheckClick={(health) =>
              navigate(
                `/clusters/${clusterID}/executions/last?health=${health}`
              )
            }
          />
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-bold">Site details</h2>
      <div className="mt-2 tn-site-details">
        {sortBy(details.sites, 'name').map(
          ({ name: siteName, state, sr_health_state: srHealthState }) => (
            <HanaClusterSite
              key={siteName}
              name={siteName}
              nodes={enrichedNodes.filter(({ site }) => site === siteName)}
              state={state}
              srHealthState={srHealthState}
              userAbilities={userAbilities}
              getClusterHostOperations={getClusterHostOperations}
            />
          )
        )}
      </div>

      {unsitedNodes.length > 0 && (
        <HanaClusterSite
          name="Other"
          nodes={unsitedNodes}
          userAbilities={userAbilities}
          getClusterHostOperations={getClusterHostOperations}
        />
      )}
    </>
  );
}

export default HanaClusterDetails;
