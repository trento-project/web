import React from 'react';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import BackButton from '@components/BackButton';

function BackToTargetDetails({ targetType, targetID }) {
  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <BackButton url={`/clusters/${targetID}`}>
          Back to Cluster Details
        </BackButton>
      );
    case TARGET_HOST:
      return (
        <BackButton url={`/hosts/${targetID}`}>Back to Host Details</BackButton>
      );
    default:
      return null;
  }
}

export default BackToTargetDetails;
