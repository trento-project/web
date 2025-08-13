import { curry, every, get, find, flow } from 'lodash';

import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  SAP_SYSTEM_START,
  SAP_SYSTEM_STOP,
} from '@lib/operations';

import {
  isOperationRunning,
  getLocalOrTargetParams,
} from '@state/selectors/runningOperations';

const matchesInstanceNumber =
  (instanceNumber) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) =>
        get(params, 'instance_number', metadata?.instanceNumber) ===
        instanceNumber
    )(metadata);

export const getSapInstanceOperations = curry(
  (
    runningOperations,
    setOperationModelOpen,
    setCurrentOperationInstance,
    instance
  ) => {
    const disabled = find(
      runningOperations,
      ({ groupID }) =>
        groupID === instance.sap_system_id || groupID === instance.host_id
    );

    return [
      {
        value: 'Start instance',
        running: isOperationRunning(
          runningOperations,
          instance.host_id,
          SAP_INSTANCE_START,
          matchesInstanceNumber(instance.instance_number)
        ),
        disabled: disabled || instance.health === 'passing',
        permitted: ['start:application_instance'],
        onClick: () => {
          setCurrentOperationInstance(instance);
          setOperationModelOpen({ open: true, operation: SAP_INSTANCE_START });
        },
      },
      {
        value: 'Stop instance',
        running: isOperationRunning(
          runningOperations,
          instance.host_id,
          SAP_INSTANCE_STOP,
          matchesInstanceNumber(instance.instance_number)
        ),
        disabled: disabled || instance.health === 'unknown',
        permitted: ['stop:application_instance'],
        onClick: () => {
          setCurrentOperationInstance(instance);
          setOperationModelOpen({ open: true, operation: SAP_INSTANCE_STOP });
        },
      },
    ];
  }
);

export const getSapSystemOperations = (
  sapSystem,
  runningOperations,
  disabled,
  setOperationModelOpen
) => [
  {
    value: 'Start system',
    running: isOperationRunning(
      runningOperations,
      sapSystem.id,
      SAP_SYSTEM_START
    ),
    disabled: disabled || every(sapSystem.instances, { health: 'passing' }),
    permitted: ['start:sap_system'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: SAP_SYSTEM_START });
    },
  },
  {
    value: 'Stop system',
    running: isOperationRunning(
      runningOperations,
      sapSystem.id,
      SAP_SYSTEM_STOP
    ),
    disabled: disabled || every(sapSystem.instances, { health: 'unknown' }),
    permitted: ['stop:sap_system'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: SAP_SYSTEM_STOP });
    },
  },
];
