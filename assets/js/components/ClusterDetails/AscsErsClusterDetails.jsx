import React, { useState, useEffect } from 'react';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';

import ListView from '@components/ListView';
import ProviderLabel from '@components/ProviderLabel';
import DottedPagination from '@components/DottedPagination';

import ChecksComingSoon from '@static/checks-coming-soon.svg';

import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';

function AscsErsClusterDetails({
  clusterName,
  cibLastWritten,
  provider,
  details,
}) {
  const [sapSystems, setSapSystems] = useState([]);
  const [currentSapSystem, setSapSystem] = useState(null);

  useEffect(() => {
    setSapSystems(details?.sap_systems);
    setSapSystem(details?.sap_systems[0]);
  }, [details]);

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
        <div className="mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-2/5 mr-4">
          <ListView
            className="grid-rows-2 mb-10"
            titleClassName="text-lg"
            orientation="vertical"
            data={[
              {
                title: 'SID',
                content: currentSapSystem?.sid,
              },
              {
                title: 'ASCS/ERS distributed',
                content: currentSapSystem?.distributed ? 'Yes' : 'No',
              },
              {
                title: 'ENSA type',
                content: '_',
              },
              {
                title: 'Filesystem resource based',
                content: currentSapSystem?.filesystem_resource_based
                  ? 'Yes'
                  : 'No',
              },
            ]}
          />
          <div className="flex justify-center">
            <DottedPagination pages={sapSystems} onChange={setSapSystem} />
          </div>
        </div>
        <div className="mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4">
          <div className="flex flex-col items-center">
            <h1 className="text-center text-2xl font-bold">Check Results</h1>
            <h6 className="opacity-60 text-xs">Coming soon for ASCS/ERS</h6>
            <img
              className="w-full"
              alt="checks coming soon"
              src={ChecksComingSoon}
            />
          </div>
        </div>
      </div>

      {details && details.stopped_resources.length > 0 && (
        <StoppedResources resources={details.stopped_resources} />
      )}

      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default AscsErsClusterDetails;
