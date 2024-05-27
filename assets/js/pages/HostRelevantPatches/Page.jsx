import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import BackButton from '@common/BackButton';

import { getHost } from '@state/selectors/host';
import { getSoftwareUpdatesPatches } from '@state/selectors/softwareUpdates';
import { fetchSoftwareUpdatesSettings } from '@state/softwareUpdatesSettings';
import { fetchSoftwareUpdates } from '@state/softwareUpdates';
import HostRelevantPatchesPage from './HostRelevantPatchesPage';

export default function Page() {
  const { hostID } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSoftwareUpdates(hostID));
    dispatch(fetchSoftwareUpdatesSettings());
  }, []);

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
      <HostRelevantPatchesPage patches={patches} hostName={hostName} />
    </>
  );
}
