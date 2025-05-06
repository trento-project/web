import React, { useState, useEffect } from 'react';
import { capitalize, get } from 'lodash';

import { getEnsaVersionLabel } from '@lib/model/sapSystems';

import BackButton from '@common/BackButton';
import DottedPagination from '@common/DottedPagination';
import ListView from '@common/ListView';
import ProviderLabel from '@common/ProviderLabel';
import SapSystemLink from '@common/SapSystemLink';
import Table from '@common/Table';

import ClusterNodeName from '@pages/ClusterDetails/ClusterNodeName';
import CheckResultsOverview from '@pages/CheckResultsOverview';

import AttributesDetails from './AttributesDetails';
import ClusterDetailsHeader from './ClusterDetailsHeader';
import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';
import { enrichNodes } from './HanaClusterDetails';

const nodeDetailsConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: '',
      render: (_, { id, name, status, resources }) => (
        <ClusterNodeName hostId={id} status={status} resources={resources}>
          {name}
        </ClusterNodeName>
      ),
    },
    {
      title: 'Role',
      key: 'roles',
      render: (content) =>
        content?.map((role) => role.toUpperCase()).join(', '),
    },
    {
      title: 'Virtual IP',
      key: 'virtual_ips',
      className: 'table-col-m',
      render: (content) => content?.join(', '),
    },
    {
      title: 'Filesystem',
      key: 'filesystems',
      className: 'table-col-m',
      render: (content) => content?.join(', '),
    },
    {
      title: '',
      key: '',
      className: 'table-col-xs',
      render: (_, item) => {
        const { attributes, resources } = item;
        return (
          <AttributesDetails
            title="Node Details"
            attributes={attributes}
            resources={resources}
          />
        );
      },
    },
  ],
};

function AscsErsClusterDetails({
  clusterID,
  clusterName,
  selectedChecks,
  hasSelectedChecks,
  cibLastWritten,
  provider,
  hosts,
  sapSystems,
  details,
  catalog,
  userAbilities,
  lastExecution,
  onStartExecution = () => {},
  navigate = () => {},
}) {
  const [enrichedSapSystems, setEnrichedSapSystems] = useState([]);
  const [currentSapSystem, setCurrentSapSystem] = useState(null);

  useEffect(() => {
    const systems = details?.sap_systems.map((system) => ({
      ...system,
      ...sapSystems.find(({ sid }) => sid === system.sid),
      nodes: enrichNodes(system?.nodes, hosts),
    }));

    setEnrichedSapSystems(systems);
    setCurrentSapSystem(systems[0]);
  }, [hosts, sapSystems, details]);

  const catalogData = get(catalog, 'data');
  const catalogLoading = get(catalog, 'loading');
  const catalogError = get(catalog, 'error');

  const executionData = get(lastExecution, 'data');
  const executionLoading = get(lastExecution, 'loading', true);
  const executionError = get(lastExecution, 'error');

  return (
    <div>
      <BackButton url="/clusters">Back to Clusters</BackButton>
      <ClusterDetailsHeader
        clusterID={clusterID}
        clusterName={clusterName}
        executionLoading={executionLoading}
        executionStatus={executionData?.status}
        hasSelectedChecks={hasSelectedChecks}
        hosts={hosts}
        selectedChecks={selectedChecks}
        userAbilities={userAbilities}
        onStartExecution={onStartExecution}
        navigate={navigate}
      />
      <div className="flex xl:flex-row flex-col">
        <div className="mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-2/5 mr-4">
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
                title: 'Fencing type',
                content: details && details.fencing_type,
              },
              {
                title: 'Cluster maintenance',
                content: capitalize(get(details, 'maintenance_mode', 'false')),
              },
              {
                title: 'Cluster type',
                content: 'ASCS/ERS',
              },

              {
                title: 'CIB last written',
                content: cibLastWritten || '-',
              },
            ]}
          />
        </div>
        <div className="flex flex-col mt-4 bg-white shadow rounded-lg pt-8 px-8 xl:w-2/5 mr-4">
          <ListView
            className="grid-rows-2"
            titleClassName="text-lg"
            orientation="vertical"
            data={[
              {
                title: 'SID',
                content: currentSapSystem,
                render: (content) => (
                  <SapSystemLink
                    sapSystemId={content?.id}
                    systemType="sap_systems"
                  >
                    {content?.sid}
                  </SapSystemLink>
                ),
              },
              {
                title: 'ASCS/ERS distributed',
                content: currentSapSystem?.distributed ? 'Yes' : 'No',
              },
              {
                title: 'ENSA version',
                content: currentSapSystem?.ensa_version || '-',
                render: (content) => getEnsaVersionLabel(content),
              },
              {
                title: 'Filesystem resource based',
                content: currentSapSystem?.filesystem_resource_based
                  ? 'Yes'
                  : 'No',
              },
            ]}
          />
          <div className="flex justify-center mt-auto pt-8 mb-2">
            <DottedPagination
              pages={enrichedSapSystems}
              onChange={setCurrentSapSystem}
            />
          </div>
        </div>
        <div className="mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4">
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

      <div className="mt-2">
        <Table config={nodeDetailsConfig} data={currentSapSystem?.nodes} />
      </div>

      <StoppedResources resources={details.stopped_resources} />

      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default AscsErsClusterDetails;
