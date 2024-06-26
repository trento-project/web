import React from 'react';
import classNames from 'classnames';

function TriggerChecksExecutionRequest({
  targetID,
  cssClasses,
  children,
  hosts = [],
  checks = [],
  onStartExecution = () => {},
  cssOverride = null,
  ...props
}) {
  const baseStyle =
    'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow';

  return (
    <button
      className={cssOverride || classNames(baseStyle, cssClasses)}
      type="button"
      onClick={() => {
        onStartExecution(targetID, hosts, checks);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default TriggerChecksExecutionRequest;
