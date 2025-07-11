import React from 'react';
import classNames from 'classnames';

import Markdown from '@common/Markdown';
import Accordion from '@common/Accordion';
import TargetIcon from '@common/TargetIcon';

function CheckItem({ checkID, targetType, description, remediation }) {
  const hasTargetType = !!targetType;

  return (
    <li>
      <Accordion
        withHandle={false}
        withTransition
        rounded={false}
        headerClassnames="hover:bg-gray-100"
        header={
          <div className="check-row flex">
            {hasTargetType && (
              <div className="pl-6 inline-flex">
                <TargetIcon
                  targetType={targetType}
                  containerClassName="inline-flex bg-jungle-green-500 p-1 rounded-full self-center"
                  className="fill-white"
                />
              </div>
            )}
            <div
              className={classNames('py-4', {
                'px-3': hasTargetType,
                'px-6': !hasTargetType,
              })}
            >
              <div className="flex items-center">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {checkID}
                </p>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <Markdown className="text-sm">{description}</Markdown>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="check-panel px-6 py-4 border-none">
          <div className="px-4 py-4 sm:px-4 bg-slate-100 rounded">
            <Markdown>{remediation}</Markdown>
          </div>
        </div>
      </Accordion>
    </li>
  );
}

export default CheckItem;
