import React from 'react';

import ConnectionErrorAntenna from '@static/connection-error-antenna.svg';

import LoadingBox from '@common/LoadingBox';
import NotificationBox from '@common/NotificationBox';

export const Status = {
  READY: 'ready',
  ERROR: 'error',
  LOADING: 'loading',
};

/**
 * Helper functions that combines two flags to determine the status of the component
 * Useful as per the intended usage of the component into our pages
 *
 * | isLoading | isError ||                |
 * |–––––––––––|–––––––––||––––------------|
 * | true      | true    || Status.LOADING |
 * | true      | false   || Status.LOADING |
 * | false     | true    || Status.ERROR   |
 * | false     | false   || Status.READY   |
 *
 * @param isLoading
 * @param isError
 * @returns
 */
export const calculateStatus = (isLoading, isError) => {
  if (isLoading) {
    return Status.LOADING;
  }
  if (isError) {
    return Status.ERROR;
  }
  return Status.READY;
};

/**
 * Wrap a section of the settings page and show a placeholder
 * until data is available.
 *
 * @param props.sectionName (optional) Name of the section, default: empty string
 * @param props.status Whether the section is LOADING, ERROR or READY,
 * which means that the children of the component are shown instead of the SettingsLoader
 * @param props.onRetry When on ERROR, the handler of the button for manual retry
 *
 * @returns Either the placeholder or the children
 */
function SettingsLoader({
  sectionName = '',
  status = Status.READY,
  children,
  onRetry,
}) {
  const title = [sectionName, 'Settings'].join(' ');
  const LoadingView = (
    <LoadingBox
      className="shadow-none rounded-lg"
      text={`Loading ${title}...`}
    />
  );
  const ErrorView = (
    <NotificationBox
      icon={
        <img
          src={ConnectionErrorAntenna}
          className="m-auto w-48"
          alt="Connection error"
        />
      }
      title="Connection Error"
      text={`Unable to load ${title}. Please try reloading this section.`}
      buttonText="Reload"
      buttonOnClick={onRetry}
    />
  );
  const ReadyView = children;

  switch (status) {
    case Status.LOADING:
      return LoadingView;
    case Status.ERROR:
      return ErrorView;
    case Status.READY:
    default:
      return ReadyView;
  }
}

export default SettingsLoader;
