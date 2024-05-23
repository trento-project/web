import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import BackButton from '@common/BackButton';

import { getHost } from '@state/selectors/host';
import { getSoftwareUpdatesPatches } from '@state/selectors/softwareUpdates';
import HostRelevantPatches from './HostRelevantPatches';

export default function Page() {
  const { hostID } = useParams();

  const host = useSelector(getHost(hostID));
  const patches = useSelector((state) =>
    getSoftwareUpdatesPatches(state, hostID)
  );

  if (!host || !patches) {
    return <div>Retrieving data</div>;
  }

  const { hostname: hostName } = host;

  // TODO(janvhs): Handle navigation
  return (
    <>
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <HostRelevantPatches patches={patches} hostName={hostName} />
    </>
  );
}
