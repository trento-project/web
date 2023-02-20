import React from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

function TriggerChecksExecutionRequest({
  clusterId,
  cssClasses,
  children,
  hosts = [],
  checks = [],
  onStartExecution = () => {},
  cssOverride = null,
  ...props
}) {
  const navigate = useNavigate();
  const baseStyle =
    'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow';

  return (
    <button
      className={cssOverride || classNames(baseStyle, cssClasses)}
      type="button"
      onClick={() => {
        onStartExecution(clusterId, hosts, checks, navigate);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default TriggerChecksExecutionRequest;
