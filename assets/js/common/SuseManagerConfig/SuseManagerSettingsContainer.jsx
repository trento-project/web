import React from 'react';

import ConnectionErrorAntenna from '@static/connection-error-antenna.svg';

import LoadingBox from '@common/LoadingBox';
import NotificationBox from '@common/NotificationBox';

function SuseManagerSettingsContainer({ error, loading, children, onRetry }) {
  if (loading) {
    return (
      <LoadingBox
        className="shadow-none rounded-lg"
        text="Loading Settings..."
      />
    );
  }

  if (error) {
    return (
      <NotificationBox
        icon={
          <img
            src={ConnectionErrorAntenna}
            className="m-auto w-48"
            alt="Connection error"
          />
        }
        title="Connection Error"
        text="Unable to load SUSE Manager configuration. Please try reloading this section."
        buttonText="Reload"
        buttonOnClick={onRetry}
      />
    );
  }

  return children;
}

export default SuseManagerSettingsContainer;
