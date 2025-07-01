import React, { useState } from 'react';
import { concat, flatMap, flow, get, has, map, noop, uniqBy } from 'lodash';
import Label from '@common/Label';
import Select from '@common/Select';
import Switch from '@common/Switch';

import OperationModal from './OperationModal';

const NOT_SELECTED_LABEL = 'Select a cluster resource';
const CLUSTER_LABEL = 'Cluster (full maintenance)';
const NODE_MAINTENANCE_STATE = 'Maintenance';
const CLUSTER_SCOPE = 'cluster';
const NODE_SCOPE = 'node';
const RESOURCE_SCOPE = 'resource';

const NOT_SELECTED_OPTION = {
  value: {
    id: NOT_SELECTED_LABEL,
    maintenance: false,
  },
  key: 'not_selected',
};

const renderOption = ({ value: { id } }) => id;

function ClusterMaintenanceChangeModal({
  clusterDetails,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);
  const [resource, setResource] = useState(NOT_SELECTED_OPTION.value);
  const [maintenanceState, setMaintenanceState] = useState(false);

  const clusterMaintenance = get(clusterDetails, 'maintenance_mode', false);

  // in ASCS/ERS clusters the nodes are within SAP systems
  const clusterNodes = has(clusterDetails, 'sap_systems')
    ? flatMap(get(clusterDetails, 'sap_systems'), ({ nodes }) => nodes)
    : get(clusterDetails, 'nodes', []);

  const clusterOption = {
    value: {
      id: CLUSTER_LABEL,
      maintenance: clusterMaintenance,
      scope: CLUSTER_SCOPE,
    },
    key: 'cluster',
  };

  const nodeOptions = map(clusterNodes, ({ name, status }) => ({
    value: {
      id: name,
      maintenance: status === NODE_MAINTENANCE_STATE,
      scope: NODE_SCOPE,
    },
    key: name,
  }));

  // flatMap all resources and parents from all nodes
  // and concat stopped resources
  const resourceOptions = flow([
    (resources) =>
      flatMap(resources, (res) => (res.parent ? [res.parent, res] : [res])),
    (resources) => uniqBy(resources, 'id'),
    (resources) =>
      map(resources, ({ id, managed }) => ({
        value: { id, maintenance: !managed, scope: RESOURCE_SCOPE },
        key: id,
      })),
  ])(clusterDetails?.resources);

  const allOptions = concat(
    NOT_SELECTED_OPTION,
    clusterOption,
    nodeOptions,
    resourceOptions
  );

  return (
    <OperationModal
      title="Cluster Maintenance"
      description="Update cluster, node or resource maintenance state"
      operationText="Maintenance"
      applyDisabled={!checked || resource.maintenance === maintenanceState}
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() =>
        // send node_id or resource_id only if the option is of that type
        onRequest({
          maintenance: maintenanceState,
          ...(resource.scope === NODE_SCOPE && { node_id: resource.id }),
          ...(resource.scope === RESOURCE_SCOPE && {
            resource_id: resource.id,
          }),
        })
      }
      onCancel={() => {
        onCancel();
        setResource(NOT_SELECTED_OPTION.value);
        setMaintenanceState(false);
        setChecked(false);
      }}
    >
      <div className="grid grid-cols-3 gap-6">
        <Label className="col-start-1 col-span-1">Resource</Label>
        <div className="col-start-2 col-span-2">
          <Select
            optionsName="resources"
            options={allOptions}
            value={resource}
            renderOption={renderOption}
            onChange={(selectedValue) => {
              setResource(selectedValue);
              setMaintenanceState(selectedValue.maintenance);
            }}
            disabled={!checked}
          />
        </div>
        <Label className="col-start-1 col-span-1">Maintenance state</Label>
        <div className="col-start-2 col-span-2">
          <Switch
            selected={maintenanceState}
            onChange={(value) => setMaintenanceState(value)}
            disabled={!checked || resource === NOT_SELECTED_OPTION.value}
          />
        </div>
      </div>
    </OperationModal>
  );
}

export default ClusterMaintenanceChangeModal;
