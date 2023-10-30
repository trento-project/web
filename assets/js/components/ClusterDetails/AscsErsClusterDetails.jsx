import React, { useState, useEffect } from 'react';
import { get } from 'lodash';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import Table from '@components/Table';
import ListView from '@components/ListView';
import ProviderLabel from '@components/ProviderLabel';
import DottedPagination from '@components/DottedPagination';
import ClusterNodeLink from '@components/ClusterDetails/ClusterNodeLink';
import SapSystemLink from '@components/SapSystemLink';
import { renderEnsaVersion } from '@components/SapSystemDetails';

import CheckResultsOverview from '@components/CheckResultsOverview';

import SBDDetails from './SBDDetails';
import AttributesDetails from './AttributesDetails';
import StoppedResources from './StoppedResources';
import { enrichNodes } from './HanaClusterDetails';

const nodeDetailsConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: '',
      render: (_, { id, name }) => (
        <ClusterNodeLink hostId={id}>{name}</ClusterNodeLink>
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
  clusterName,
  cibLastWritten,
  provider,
  hosts,
  sapSystems,
  details,
  catalog,
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

  return (
    <div>
      <BackButton url="/clusters">Back to Clusters</BackButton>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader className="whitespace-normal">
            Pacemaker Cluster Details:{' '}
            <span className="font-bold">{clusterName}</span>
          </PageHeader>
        </div>
      </div>
      <div className="flex xl:flex-row flex-col">
        <div className="mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-2/5 mr-4">
          <ListView
            className="grid-rows-2"
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
                render: (content) => renderEnsaVersion(content),
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
            catalogDataEmpty={catalogData?.length === 0}
            loading={catalogLoading}
            error={catalogError}
            onCheckClick={() => {}}
          />
        </div>
      </div>

      {details && details.stopped_resources.length > 0 && (
        <StoppedResources resources={details.stopped_resources} />
      )}

      <div className="mt-2">
        <Table config={nodeDetailsConfig} data={currentSapSystem?.nodes} />
      </div>

      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default AscsErsClusterDetails;
