import React from 'react';
import classNames from 'classnames';
import { capitalize, map, flatMap, flow, groupBy, noop } from 'lodash';

import Table from '@common/Table';
import OperationsButton from '@common/OperationsButton';

import ClusterNodeLink from './ClusterNodeLink';

// groupResources groups resources with the same parent.
// If a resources doesn't have a parent, it is grouped alone.
// Once they are grouped, if they have a parent, the resources
// are set as children.
// The hostID is added to make the node link possible.
const groupResources = (clusterResources, hosts) =>
  flow(
    (resources) =>
      map(resources, (resource) => ({
        ...resource,
        hostID: hosts.find(({ hostname }) => hostname === resource.node)?.id,
      })),
    (resources) =>
      groupBy(resources, (resource) => resource.parent?.id || resource.id),
    (resources) =>
      flatMap(resources, (groupedResources) => {
        const firstResource = groupedResources[0];
        const { parent } = firstResource;
        if (parent) {
          const type =
            parent.multi_state == null ? 'Group' : firstResource.type;
          return { ...parent, type, children: groupedResources };
        }

        return groupedResources;
      })
  )(clusterResources);

const addInheritedBgColor = (columns) =>
  columns.map((column) => ({
    ...column,
    className: classNames(column?.className, '!bg-inherit'),
  }));

const getResourceTableConfig = (
  userAbilities = [],
  getResourceOperations = noop
) => ({
  usePadding: false,
  columns: [
    {
      title: 'Fail count',
      key: 'fail_count',
    },
    {
      title: 'ID',
      key: 'id',
    },
    {
      title: 'Location',
      key: 'node',
      render: (content, item) =>
        content && (
          <ClusterNodeLink hostId={item.hostID}>{content}</ClusterNodeLink>
        ),
    },
    {
      title: 'Role',
      key: 'role',
    },
    {
      title: 'Status',
      key: 'status',
    },
    {
      title: 'Managed',
      key: 'managed',
      render: (content) => capitalize(`${content}`),
    },
    {
      title: 'Type',
      key: 'type',
    },
    {
      title: '',
      key: 'operations',
      className: 'w-6',
      render: (_, item) => (
        <div className="flex w-fit whitespace-nowrap">
          <OperationsButton
            text=""
            userAbilities={userAbilities}
            menuPosition="bottom end"
            transparent
            operations={getResourceOperations(item)}
          />
        </div>
      ),
    },
  ],
  wrapCollapsedRowInCell: false,
  collapsibleDetailRenderer: (
    resource,
    { columns, rowExpanded, renderCells }
  ) =>
    resource.children
      ? resource.children.map((child, idx) => (
          <tr
            key={`${idx}_${child.node}_${child.id}`} // eslint-disable-line react/no-array-index-key
            hidden={!rowExpanded}
            className="bg-gray-50 border-b border-gray-200"
          >
            <td aria-label="collapsible-cell" />
            {renderCells(addInheritedBgColor(columns), child)}
          </tr>
        ))
      : null,
});

function Resources({
  resources,
  hosts,
  userAbilities = [],
  getResourceOperations = noop,
}) {
  const groupedResources = groupResources(resources, hosts);

  return (
    <>
      <h2 className="mt-8 mb-2 text-2xl font-bold">Resources</h2>
      <div className="mt-2">
        <Table
          config={getResourceTableConfig(userAbilities, getResourceOperations)}
          data={groupedResources}
          rowKey={(resource) => resource?.id}
        />
      </div>
    </>
  );
}

export default Resources;
