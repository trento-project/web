import React from 'react';
import classNames from 'classnames';
import { capitalize, map, flatMap, flow, groupBy } from 'lodash';

import Table from '@common/Table';

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

const resourceTableConfig = {
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
      render: (content) => content !== null && capitalize(`${content}`),
    },
    {
      title: 'Type',
      key: 'type',
    },
  ],
  wrapCollapsedRowInCell: false,
  collapsibleDetailRenderer: (
    resource,
    { columns, rowExpanded, renderCells }
  ) =>
    resource.children
      ? resource.children.map((child) => (
          <tr
            key={`${child.node}_${child.id}`}
            hidden={!rowExpanded}
            className="bg-gray-50 border-b border-gray-200"
          >
            <td aria-label="collapsible-cell" />
            {renderCells(addInheritedBgColor(columns), child)}
          </tr>
        ))
      : null,
};

function Resources({ resources, hosts }) {
  const groupedResources = groupResources(resources, hosts);

  return (
    <>
      <h2 className="mt-8 mb-2 text-2xl font-bold">Resources</h2>
      <div className="mt-2">
        <Table config={resourceTableConfig} data={groupedResources} />
      </div>
    </>
  );
}

export default Resources;
