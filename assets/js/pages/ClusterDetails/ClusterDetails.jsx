import React, { useState } from 'react';

import { get, noop, startCase } from 'lodash';

import classNames from 'classnames';
import {
  EOS_PLAYLIST_ADD_CHECK_FILLED,
  EOS_CLEAR_ALL,
  EOS_PLAY_CIRCLE,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import { RUNNING_STATES } from '@state/lastExecutions';

import { isSomeHostOnline } from '@lib/model/clusters';

import {
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_HOST_START,
  CLUSTER_HOST_STOP,
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
  OperationForbiddenModal,
  SimpleAcceptanceOperationModal,
} from '@common/OperationModals';
import Pill from '@common/Pill';

import Resources from './Resources';
import SBDDetails from './SBDDetails';
import {
  getClusterOperations,
  getClusterHostOperations,
  getResourceOperations,
} from './clusterOperations';

const operationModalState = { open: false, operation: '' };

const getStateIcon = (state) => {
  switch (state) {
    case 'idle':
      return (
        <EOS_LENS_FILLED size="base" className="fill-jungle-green-500 mx-1" />
      );
    case 'transition_engine':
      return <EOS_LENS_FILLED size="base" className="fill-red-500 mx-1" />;
    case 'unknown':
    case 'stopped':
      return <EOS_LENS_FILLED size="base" className="fill-gray-500 mx-1" />;
    default:
      return <EOS_LENS_FILLED size="base" className="fill-yellow-500 mx-1" />;
  }
};

function ClusterDetails({
  clusterID,
  clusterName,
  details,
  hasSelectedChecks,
  hosts,
  state,
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
  const [operationParams, setOperationParams] = useState(undefined);

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

  const someHostOnline = isSomeHostOnline(hosts);

  const clusterState = state || 'unknown';

  const clusterOperations = getClusterOperations(
    clusterID,
    runningOperation,
    setOperationParams,
    setOperationModalOpen,
    details,
    someHostOnline
  );

  const curriedGetResourceOperations = getResourceOperations(
    clusterID,
    runningOperation,
    setOperationParams,
    setOperationModalOpen,
    someHostOnline
  );

  const getOperationModalDescriptionArgs = (operation) => {
    switch (operation) {
      case PACEMAKER_ENABLE:
      case PACEMAKER_DISABLE:
      case CLUSTER_HOST_START:
      case CLUSTER_HOST_STOP:
        return {
          hostName: currentOperationHost?.name,
        };
      case CLUSTER_MAINTENANCE_CHANGE:
      case CLUSTER_RESOURCE_REFRESH:
        return operationParams;
      default:
        return {};
    }
  };

  const requestOperation = (operation) => {
    switch (operation) {
      case PACEMAKER_ENABLE:
      case PACEMAKER_DISABLE:
      case CLUSTER_HOST_START:
      case CLUSTER_HOST_STOP:
        onRequestHostOperation(operation, {
          clusterID,
          hostID: currentOperationHost.id,
        });
        break;
      case CLUSTER_MAINTENANCE_CHANGE:
      case CLUSTER_RESOURCE_REFRESH:
        onRequestOperation(operation, operationParams);
        break;
      default:
        noop();
    }
  };

  const detailComponent = children
    ? React.cloneElement(children, {
        getClusterHostOperations: getClusterHostOperations(
          clusterID,
          runningOperation,
          setCurrentOperationHost,
          setOperationParams,
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
          <SimpleAcceptanceOperationModal
            operation={operationModalOpen.operation}
            descriptionResolverArgs={getOperationModalDescriptionArgs(
              operationModalOpen.operation
            )}
            isOpen={operationModalOpen.open}
            onRequest={() => {
              requestOperation(operationModalOpen.operation);
              closeOperationModal();
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
                operations={clusterOperations}
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
        <div className="pb-3">
          <Pill className="self-center items-center shadow bg-gray-200 text-gray-500">
            State:
            {getStateIcon(clusterState)}
            {startCase(clusterState)}
          </Pill>
        </div>
      </div>
      {detailComponent}
      <Resources
        resources={details?.resources}
        hosts={hosts}
        userAbilities={userAbilities}
        getResourceOperations={curriedGetResourceOperations}
      />
      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default ClusterDetails;
