import React from 'react';
import { capitalize } from 'lodash';

import HealthIcon from '@common/HealthIcon';
import Table from '@common/Table';

import OperationsButton from '@common/OperationsButton';
import ClusterNodeName from '@pages/ClusterDetails/ClusterNodeName';

import AttributesDetails from './AttributesDetails';
import ReplicationStatusPill from './ReplicationStatusPill';

const getSiteHealth = (srHealthStatus) => {
  switch (srHealthStatus) {
    case '4':
      return 'passing';
    case '1':
      return 'critical';
    default:
      return 'unknown';
  }
};

const siteDetailsConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: '',
      className: 'table-col-m',
      render: (_, { id, name, status, resources }) => (
        <ClusterNodeName hostId={id} status={status} resources={resources}>
          {name}
        </ClusterNodeName>
      ),
    },
    {
      title: 'Nameserver',
      key: 'nameserver_actual_role',
      className: 'table-col-m',
      render: (content) => capitalize(content),
    },
    {
      title: 'Indexserver',
      key: 'indexserver_actual_role',
      className: 'table-col-m',
      render: (content) => capitalize(content),
    },
    {
      title: 'IP',
      key: 'ip_addresses',
      className: 'table-col-m',
      render: (content) => content?.join(', '),
    },
    {
      title: 'Virtual IP',
      key: 'virtual_ip',
      className: 'table-col-m',
    },
    {
      title: '',
      key: '',
      className: 'table-col-xs',
      render: (_, item) => {
        const { attributes, resources } = item;

        const ops = [
          {
            value: 'Enable pacemaker',
            running: false,
            disabled: false,
            permitted: ['all:all'],
            onClick: () => {
              console.log(
                `Enable pacemaker operation clicked host: ${item.id} cluster: ${item.cluster_id}`
              );
            },
          },
          {
            value: 'Disable pacemaker',
            running: false,
            disabled: false,
            permitted: ['all:all'],
            onClick: () => {
              console.log(
                `Disable pacemaker operation clicked host: ${item.id} cluster: ${item.cluster_id}`
              );
            },
          },
        ];
        return (
          <>
            {/* <div className="flex items-center justify-center"> */}
            <OperationsButton
              className="absolute"
              text=""
              userAbilities={[{ name: 'all', resource: 'all' }]}
              menuPosition="bottom"
              transparent
              operations={ops}
            />
            {/* </div> */}
            <AttributesDetails
              title="Node Details"
              attributes={attributes}
              resources={resources}
            />
          </>
        );
      },
    },
  ],
};

function HanaClusterSite({ name, nodes, state = null, srHealthState = null }) {
  return (
    <div
      key={name}
      className={`tn-site-details-${name} mt-4 bg-white rounded-lg`}
    >
      <Table
        className="tn-site-table"
        config={siteDetailsConfig}
        data={nodes}
        header={
          <div className="flex space-x-2 p-4">
            {state && (
              <span className="text-left">
                <HealthIcon health={getSiteHealth(srHealthState)} centered />
              </span>
            )}
            <h3 className="text-l font-bold tn-site-name">{name}</h3>
            {srHealthState && <ReplicationStatusPill status={state} />}
          </div>
        }
      />
    </div>
  );
}

export default HanaClusterSite;
