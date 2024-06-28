import React from 'react';
import { EOS_PLAY_CIRCLE } from 'eos-icons-react';
import classNames from 'classnames';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';
import DisabledGuard from '@common/DisabledGuard';

import { canStartExecution } from '@pages/ChecksSelection';

function ChecksSelectionHeader({
  targetID,
  targetName,
  backTo,
  pageHeader,
  isSavingSelection,
  savedSelection,
  selection,
  userAbilities,
  checkSelectionPermittedFor,
  checkExecutionPermettidedFor,
  onSaveSelection = () => {},
  onStartExecution = () => {},
}) {
  const isAbleToStartExecution = canStartExecution(
    savedSelection,
    isSavingSelection
  );
  return (
    <div className="w-full px-2 sm:px-0">
      {backTo}
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          {pageHeader}
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            <DisabledGuard
              userAbilities={userAbilities}
              permitted={checkSelectionPermittedFor}
            >
              <Button
                type="primary-white"
                className="mx-1 border-green-500 border"
                onClick={() => onSaveSelection(selection, targetID, targetName)}
                disabled={isSavingSelection}
              >
                Save Checks Selection
              </Button>
            </DisabledGuard>
            <Tooltip
              className="w-56"
              content="Click Start Execution or wait for Trento to periodically run checks."
              visible={isAbleToStartExecution}
              wrap={false}
            >
              <DisabledGuard
                userAbilities={userAbilities}
                permitted={checkExecutionPermettidedFor}
              >
                <Button
                  type="primary"
                  className="mx-1"
                  onClick={onStartExecution}
                  disabled={!isAbleToStartExecution}
                >
                  <EOS_PLAY_CIRCLE
                    className={classNames('inline-block align-sub', {
                      'fill-white': isAbleToStartExecution,
                      'fill-gray-200': !isAbleToStartExecution,
                    })}
                  />{' '}
                  Start Execution
                </Button>
              </DisabledGuard>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChecksSelectionHeader;
