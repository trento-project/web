import React, { useState } from 'react';

import ListView from '@components/ListView';
import Table from '@components/Table';
import PageHeader from '@components/PageHeader';
import DeregistrationModal from '@components/DeregistrationModal';

import {
  EOS_APPLICATION_OUTLINED,
  EOS_DATABASE_OUTLINED,
} from 'eos-icons-react';
import { APPLICATION_TYPE } from '@lib/model';
import {
  systemHostsTableConfiguration,
  getSystemInstancesTableConfiguration,
} from './tableConfigs';

export const renderEnsaVersion = (ensaVersion) =>
  ensaVersion === 'no_ensa' ? '-' : ensaVersion.toUpperCase();

const renderType = (t) =>
  t === APPLICATION_TYPE ? 'Application server' : 'HANA Database';

const getUniqueHosts = (hosts) =>
  Array.from(
    hosts
      .reduce((hostsMap, host) => {
        if (!hostsMap.has(host.id)) hostsMap.set(host.id, host);
        return hostsMap;
      }, new Map())
      .values()
  );

export function GenericSystemDetails({
  title,
  type,
  system,
  onInstanceCleanUp,
}) {
  if (!system) {
    return <div>Not Found</div>;
  }
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [instanceToDeregister, setInstanceToDeregister] = useState(undefined);
  const [instanceType, setInstanceType] = useState(undefined);

  const onCleanUpClick = (instance) => {
    setCleanUpModalOpen(true);
    setInstanceToDeregister(instance);
    setInstanceType(type);
  };

  return (
    <div>
      <PageHeader className="font-bold">{title}</PageHeader>
      <DeregistrationModal
        contentType={instanceType}
        instanceNumber={instanceToDeregister?.instance_number}
        sid={instanceToDeregister?.sid}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          setCleanUpModalOpen(false);
          onInstanceCleanUp(instanceToDeregister);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: system.sid },
            {
              title: 'Type',
              content: renderType(type),
            },
            ...(type === APPLICATION_TYPE
              ? [
                  {
                    title: 'ENSA version',
                    content: system.ensa_version || '-',
                    render: (content) => renderEnsaVersion(content),
                  },
                ]
              : []),
            {
              title: '',
              content: type,
              render: (content) => (
                <div className="float-right">
                  {content === APPLICATION_TYPE ? (
                    <EOS_APPLICATION_OUTLINED
                      size={25}
                      className="fill-blue-500"
                    />
                  ) : (
                    <EOS_DATABASE_OUTLINED
                      size={25}
                      className="fill-blue-500"
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <div className="mt-16">
        <div className="flex flex-direction-row">
          <h2 className="text-2xl font-bold self-center">Layout</h2>
        </div>
        <Table
          config={getSystemInstancesTableConfiguration({ onCleanUpClick })}
          data={system.instances}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Hosts</h2>
        </div>
        <Table
          config={systemHostsTableConfiguration}
          data={getUniqueHosts(system.hosts)}
        />
      </div>
    </div>
  );
}
