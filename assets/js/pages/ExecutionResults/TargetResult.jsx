import React from 'react';
import { EOS_KEYBOARD_ARROW_RIGHT } from 'eos-icons-react';
import classNames from 'classnames';
import TargetIcon from '@common/TargetIcon';

function TargetResult({
  targetType,
  targetName,
  expectationsSummary,
  isAgentCheckError = false,
  onClick = () => {},
}) {
  return (
    <div
      role="button"
      aria-hidden="true"
      className="table-row border-b cursor-pointer"
      onClick={onClick}
      data-testid="target-result"
    >
      <div className="table-cell p-2">
        <div className="flex p-1">
          <TargetIcon
            targetType={targetType}
            containerClassName="inline-flex bg-jungle-green-500 p-1 rounded-full self-center"
            className="fill-white"
          />
          <span className="ml-3 inline-flex self-center">{targetName}</span>
        </div>
      </div>
      <div className="table-cell p-2 align-middle">
        <div className="flex p-1 justify-between">
          <span className={classNames({ 'text-red-500': isAgentCheckError })}>
            {expectationsSummary}
          </span>
          <span>
            <EOS_KEYBOARD_ARROW_RIGHT className="fill-gray-500" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default TargetResult;
