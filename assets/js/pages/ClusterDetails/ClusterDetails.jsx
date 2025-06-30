import React, { useState } from 'react';

import { get, noop } from 'lodash';

import classNames from 'classnames';
import {
  EOS_PLAYLIST_ADD_CHECK_FILLED,
  EOS_CLEAR_ALL,
  EOS_PLAY_CIRCLE,
} from 'eos-icons-react';

import { RUNNING_STATES } from '@state/lastExecutions';

import {
  CLUSTER_MAINTENANCE_CHANGE,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  getOperationLabel,
  getOperationForbiddenMessage,
} from '@lib/operations';

import BackButton from '@common/BackButton';
import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import OperationsButton from '@common/OperationsButton';
import PageHeader from '@common/PageHeader';
import Tooltip from '@common/Tooltip';
import {
  ClusterMaintenanceChangeModal,
  OperationForbiddenModal,
  SimpleAcceptanceOperationModal,
} from '@common/OperationModals';

import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';
import { getClusterHostOperations } from './clusterOperations';

const hostOperations = [PACEMAKER_ENABLE, PACEMAKER_DISABLE];

const operationModalState = { open: false, operation: '' };

const isOperationModalOpen = ({ open, operation }, operations) =>
  open && operations.includes(operation);

function ClusterDetails({
  clusterID,
  clusterName,
  details,
  hasSelectedChecks,
  hosts,
  lastExecution = {},
  operationsEnabled = false,
  runningOperation,
  selectedChecks,
  userAbilities,
  onStartExecution = noop,
  onRequestOperation = noop,
  onCleanForbiddenOperation = noop,
  onRequestHostOperation = noop,
  navigate = noop,
  children,
}) {
  const [operationModalOpen, setOperationModalOpen] =
    useState(operationModalState);
  const [currentOperationHost, setCurrentOperationHost] = useState(undefined);

  const openOperationModal = (operation) =>
    setOperationModalOpen((prevState) => ({
      ...prevState,
      operation,
      open: true,
    }));
  const closeOperationModal = () =>
    setOperationModalOpen((prevState) => ({ ...prevState, open: false }));

  const executionLoading = get(lastExecution, 'loading', false);
  const executionStatus = get(lastExecution, 'data.status', null);

  const startExecutionDisabled =
    executionLoading ||
    !hasSelectedChecks ||
    RUNNING_STATES.includes(executionStatus);

  const runningOperationName = get(runningOperation, 'operation', null);
  const operationForbidden = get(runningOperation, 'forbidden', false);
  const operationForbiddenErrors = get(runningOperation, 'errors', []);

  const detailComponent = children
    ? React.cloneElement(children, {
        getClusterHostOperations: getClusterHostOperations(
          clusterID,
          runningOperation,
          setCurrentOperationHost,
          setOperationModalOpen
        ),
      })
    : null;

  return (
    <div>
      {operationsEnabled && (
        <>
          <OperationForbiddenModal
            operation={getOperationLabel(runningOperationName)}
            isOpen={operationForbidden}
            onCancel={onCleanForbiddenOperation}
            errors={operationForbiddenErrors}
          >
            {getOperationForbiddenMessage(runningOperationName)}
          </OperationForbiddenModal>
          <ClusterMaintenanceChangeModal
            clusterDetails={details}
            isOpen={isOperationModalOpen(operationModalOpen, [
              CLUSTER_MAINTENANCE_CHANGE,
            ])}
            onRequest={(params) => {
              closeOperationModal();
              onRequestOperation(CLUSTER_MAINTENANCE_CHANGE, params);
            }}
            onCancel={closeOperationModal}
          />
        </>
      )}
      <BackButton url="/clusters">Back to Clusters</BackButton>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader className="whitespace-normal">
            Pacemaker Cluster Details:{' '}
            <span className="font-bold">{clusterName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            {operationsEnabled && (
              <OperationsButton
                userAbilities={userAbilities}
                operations={[
                  {
                    value: 'Cluster Maintenance',
                    running:
                      runningOperationName === CLUSTER_MAINTENANCE_CHANGE,
                    disabled: !!runningOperation,
                    permitted: ['maintenance_change:cluster'],
                    onClick: () =>
                      openOperationModal(CLUSTER_MAINTENANCE_CHANGE),
                  },
                ]}
              />
            )}
            <Button
              type="primary-white"
              className="inline-block mx-0.5 border-green-500 border"
              size="small"
              onClick={() => navigate(`/clusters/${clusterID}/settings`)}
            >
              <EOS_PLAYLIST_ADD_CHECK_FILLED className="inline-block fill-jungle-green-500" />{' '}
              Check Selection
            </Button>

            <Button
              type="primary-white"
              className="mx-0.5 border-green-500 border"
              size="small"
              onClick={() => navigate(`/clusters/${clusterID}/executions/last`)}
            >
              <EOS_CLEAR_ALL className="inline-block fill-jungle-green-500" />{' '}
              Show Results
            </Button>

            <DisabledGuard
              userAbilities={userAbilities}
              permitted={['all:cluster_checks_execution']}
            >
              <Tooltip
                isEnabled={!hasSelectedChecks}
                content="Select some Checks first!"
                place="bottom"
                wrap={false}
              >
                <Button
                  type="primary"
                  className="mx-0.5"
                  size="small"
                  onClick={() => {
                    onStartExecution(clusterID, hosts, selectedChecks);
                  }}
                  disabled={startExecutionDisabled}
                >
                  <EOS_PLAY_CIRCLE
                    className={classNames('inline-block align-sub', {
                      'fill-white': !startExecutionDisabled,
                      'fill-gray-200': startExecutionDisabled,
                    })}
                  />{' '}
                  Start Execution
                </Button>
              </Tooltip>
            </DisabledGuard>
          </div>
        </div>
      </div>
      <SimpleAcceptanceOperationModal
        operation={operationModalOpen.operation}
        descriptionResolverArgs={{
          hostName: currentOperationHost?.name,
        }}
        isOpen={isOperationModalOpen(operationModalOpen, hostOperations)}
        onRequest={() => {
          onRequestHostOperation(operationModalOpen.operation, {
            clusterID,
            hostID: currentOperationHost.id,
          });
          closeOperationModal();
        }}
        onCancel={closeOperationModal}
      />
      {detailComponent}
      <StoppedResources resources={details.stopped_resources} />
      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default ClusterDetails;
