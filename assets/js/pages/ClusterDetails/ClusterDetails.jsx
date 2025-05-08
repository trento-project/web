import React from 'react';

import { get } from 'lodash';

import classNames from 'classnames';
import {
  EOS_PLAYLIST_ADD_CHECK_FILLED,
  EOS_CLEAR_ALL,
  EOS_PLAY_CIRCLE,
} from 'eos-icons-react';

import { RUNNING_STATES } from '@state/lastExecutions';

import BackButton from '@common/BackButton';
import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import PageHeader from '@common/PageHeader';
import Tooltip from '@common/Tooltip';

import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';

function ClusterDetails({
  clusterDetails,
  clusterID,
  clusterName,
  hasSelectedChecks,
  hosts,
  lastExecution = {},
  selectedChecks,
  userAbilities,
  onStartExecution = () => {},
  navigate = () => {},
  children,
}) {
  const executionLoading = get(lastExecution, 'loading', false);
  const executionStatus = get(lastExecution, 'data.status', null);

  const startExecutionDisabled =
    executionLoading ||
    !hasSelectedChecks ||
    RUNNING_STATES.includes(executionStatus);

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
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
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
      {children}
      <StoppedResources resources={clusterDetails.stopped_resources} />
      <SBDDetails sbdDevices={clusterDetails.sbd_devices} />
    </div>
  );
}

export default ClusterDetails;
