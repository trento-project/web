// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';
import { uniqBy } from 'lodash';
import classNames from 'classnames';
import semver from 'semver';

import BulkScheduleModal from '@common/BulkScheduleModal';
import Button from '@common/Button';
import CleanUpButton from '@common/CleanUpButton';
import DisabledGuard from '@common/DisabledGuard';
import HealthIcon from '@common/HealthIcon';
import HostLink from '@common/HostLink';
import PageHeader from '@common/PageHeader';
import Pill from '@common/Pill';
import ProviderLabel from '@common/ProviderLabel';
import SapSystemLink from '@common/SapSystemLink';
import Table from '@common/Table';
import Tags from '@common/Tags';
import Tooltip from '@common/Tooltip';

import { post, del } from '@lib/network';
import { agentVersionWarning } from '@lib/agent';
import { createBulkOperationSchedules } from '@lib/api/operationSchedules';
import { getFromConfig } from '@lib/config';
import { HOST_REBOOT } from '@lib/operations';
import { STALE_ROW } from '@lib/tables';

import usePersistentSearchParams from '@hooks/usePersistentSearchParams';
import { scheduledNotification } from '@hooks/useScheduleOperation';

import ClusterLink from '@pages/ClusterDetails/ClusterLink';
import DeregistrationModal from '@pages/DeregistrationModal';
import HealthSummary from '@pages/HealthSummary';
import { getCounters } from '@pages/HealthSummary/summarySelection';

import { addTagToHost, removeTagFromHost, deregisterHost } from '@state/hosts';
import { getUserProfile } from '@state/selectors/user';
import { hostsListSelector } from '@state/selectors/host';
import { getInstanceID } from '@state/instances';
import { notify } from '@state/notifications';

const compareAgentVersions = (a, b) => {
  const coercedA = semver.coerce(a);
  const coercedB = semver.coerce(b);
  if (coercedA && coercedB) {
    return semver.compare(coercedA, coercedB);
  }
  return String(a).localeCompare(String(b));
};

const addTag = (tag, hostId) => {
  post(`/hosts/${hostId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, hostId) => {
  del(`/hosts/${hostId}/tags/${tag}`);
};

function HostsList() {
  const hostsData = useSelector(hostsListSelector);
  const { abilities, timezone } = useSelector(getUserProfile);

  const [searchParams, setSearchParams] = usePersistentSearchParams('hosts');
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [hostToDeregister, setHostToDeregister] = useState(undefined);
  const [selectedHostIDs, setSelectedHostIDs] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const operationsEnabled = getFromConfig('operationsEnabled');

  const dispatch = useDispatch();

  const openDeregistrationModal = (host) => {
    setHostToDeregister(host);
    setCleanUpModalOpen(true);
  };

  const cleanUpHost = ({ id, hostname }) => {
    setCleanUpModalOpen(false);
    dispatch(deregisterHost({ id, hostname }));
  };

  const toggleHostSelection = (hostID) =>
    setSelectedHostIDs((selected) =>
      selected.includes(hostID)
        ? selected.filter((id) => id !== hostID)
        : [...selected, hostID]
    );

  const scheduleReboot = (schedule) => {
    setBulkModalOpen(false);
    createBulkOperationSchedules({
      target_type: 'host',
      target_ids: selectedHostIDs,
      operation: HOST_REBOOT,
      params: {},
      ...schedule,
    })
      .then(({ data }) => {
        dispatch(
          scheduledNotification(
            `Reboot scheduled on ${data.schedules.length} hosts`,
            data.schedules.flatMap(({ warnings = [] }) => warnings)
          )
        );
        setSelectedHostIDs([]);
      })
      .catch(() =>
        dispatch(notify({ text: 'Unable to schedule the reboot', icon: '❌' }))
      );
  };

  const counters = getCounters(hostsData || []);

  const selectionColumns = operationsEnabled
    ? [
        {
          title: '',
          key: 'id',
          className: 'w-8',
          render: (id, { hostname }) => (
            <input
              type="checkbox"
              aria-label={`Select ${hostname}`}
              checked={selectedHostIDs.includes(id)}
              onChange={() => toggleHostSelection(id)}
            />
          ),
        },
      ]
    : [];

  const config = {
    pagination: true,
    usePadding: false,
    rowClassName: ({ staleAt }) =>
      classNames({
        [STALE_ROW]: !!staleAt,
      }),
    columns: [
      {
        title: 'Health',
        key: 'health',
        filter: true,
        filterFromParams: true,
        render: (health, { staleAt }) => (
          <HealthIcon
            health={health}
            staleAt={staleAt}
            timezone={timezone}
            centered
          />
        ),
      },
      {
        title: 'Hostname',
        key: 'hostname',
        className: 'w-40',
        filter: true,
        filterFromParams: true,
        render: (content, { id }) => <HostLink hostId={id}>{content}</HostLink>,
      },
      {
        title: 'IP',
        key: 'ip',
        render: (content) =>
          content.map((ip) => (
            <div key={ip} className="text-sm">
              {ip}
            </div>
          )),
      },
      {
        title: 'Provider',
        key: 'provider',
        render: (content) => {
          if (content) {
            return <ProviderLabel provider={content} />;
          }
          return '';
        },
      },
      {
        title: 'Cluster',
        key: 'cluster',
        className: 'w-40',
        render: (cluster) => <ClusterLink cluster={cluster} />,
      },
      {
        title: 'SID',
        key: 'sid',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((sid) => filter.includes(sid)),
        render: (_sids, { sap_systems }) => {
          const instances = uniqBy(sap_systems, getInstanceID);
          return instances.map((instance) => {
            const sapSystemId = getInstanceID(instance);
            return (
              <span key={sapSystemId}>
                <SapSystemLink
                  systemType={instance?.type}
                  sapSystemId={sapSystemId}
                >
                  {instance?.sid}
                </SapSystemLink>{' '}
              </span>
            );
          });
        },
      },
      {
        title: 'Agent version',
        key: 'agent_version',
        filter: true,
        filterFromParams: true,
        filterOptionsSorter: compareAgentVersions,
        render: (content) => {
          const warning = agentVersionWarning(content);
          if (warning) {
            return (
              <Tooltip className="w-52" content={warning} place="bottom">
                <Pill
                  size="xs"
                  className="bg-yellow-100 text-yellow-800 group flex items-center relative"
                >
                  <EOS_WARNING_OUTLINED
                    size="base"
                    className="centered fill-yellow-800"
                  />
                  <span className="ml-1 truncate max-w-[100px]">{content}</span>
                </Pill>
              </Tooltip>
            );
          }
          return (
            <Pill
              size="xs"
              display="inline-block"
              className="bg-green-100 text-green-800 truncate max-w-[112px]"
            >
              {content}
            </Pill>
          );
        },
      },
      {
        title: 'Tags',
        key: 'tags',
        className: 'w-80',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((tag) => filter.includes(tag)),
        render: (content, item) => (
          <Tags
            userAbilities={abilities}
            tagAdditionPermittedFor={['all:host_tags']}
            tagDeletionPermittedFor={['all:host_tags']}
            tags={content}
            resourceId={item.id}
            onChange={() => {}}
            onAdd={(tag) => {
              addTag(tag, item.id);
              dispatch(addTagToHost({ tags: [{ value: tag }], id: item.id }));
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(
                removeTagFromHost({ tags: [{ value: tag }], id: item.id })
              );
            }}
          />
        ),
      },
      {
        title: '',
        key: 'deregisterable',
        className: 'w-48',
        render: (content, item) =>
          content && (
            <CleanUpButton
              cleaning={item.deregistering}
              size="fit"
              type="transparent"
              className="border-none shadow-none"
              userAbilities={abilities}
              permittedFor={['cleanup:host']}
              onClick={() => {
                openDeregistrationModal(item);
              }}
            />
          ),
      },
      ...selectionColumns,
    ],
  };

  return (
    <>
      <PageHeader className="font-bold">Hosts</PageHeader>
      <DeregistrationModal
        hostname={hostToDeregister?.hostname}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          cleanUpHost(hostToDeregister);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      {operationsEnabled && (
        <>
          <BulkScheduleModal
            isOpen={bulkModalOpen}
            operationLabel="Reboot host"
            targetsLabel={`${selectedHostIDs.length} hosts`}
            timezone={timezone}
            onSchedule={scheduleReboot}
            onCancel={() => setBulkModalOpen(false)}
          />
          <div className="flex justify-end pb-2">
            <DisabledGuard
              userAbilities={abilities}
              permitted={['reboot:host']}
            >
              <Button
                type="primary-white"
                size="small"
                disabled={selectedHostIDs.length === 0}
                onClick={() => setBulkModalOpen(true)}
              >
                Schedule Reboot
              </Button>
            </DisabledGuard>
          </div>
        </>
      )}
      <div className="bg-white rounded-lg shadow">
        <HealthSummary {...counters} className="px-4 py-2" />
        <Table
          config={config}
          data={hostsData}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
    </>
  );
}

export default HostsList;
