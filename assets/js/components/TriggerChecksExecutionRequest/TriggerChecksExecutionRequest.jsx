import React, { useContext } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

import { ChecksExecutionContext } from '@components/ChecksExecutionContext';

function TriggerChecksExecutionRequest({
  clusterId,
  cssClasses,
  children,
  hosts = [],
  checks = [],
  ...props
}) {
  const navigate = useNavigate();

  const startExecution = useContext(ChecksExecutionContext);

  return (
    <button
      className={classNames(
        'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow',
        cssClasses
      )}
      type="button"
      onClick={() => {
        startExecution(clusterId, hosts, checks);
        navigate(`/clusters/${clusterId}/executions/last`);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default TriggerChecksExecutionRequest;
