import React from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const TriggerChecksExecutionRequest = ({
  clusterId,
  cssClasses,
  children,
  ...props
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <button
      className={classNames(
        'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow',
        cssClasses
      )}
      onClick={() => {
        dispatch({
          type: 'REQUEST_CHECKS_EXECUTION',
          payload: {
            clusterID: clusterId,
          },
        });
        navigate(`/clusters/${clusterId}/checks/results`);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default TriggerChecksExecutionRequest;
