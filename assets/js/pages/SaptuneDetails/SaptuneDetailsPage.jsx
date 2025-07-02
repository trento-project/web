import React from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

import { isVersionSupported } from '@lib/saptune';
import { getHost } from '@state/selectors/host';

import SaptuneDetails from './SaptuneDetails';

function SaptuneDetailsPage() {
  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));

  if (!host) {
    return <div>Not Found</div>;
  }

  const { hostname, saptune_status: saptuneStatus } = host;

  if (!saptuneStatus || !isVersionSupported(saptuneStatus.package_version)) {
    return <div>Saptune Details Not Found</div>;
  }
  return (
    <SaptuneDetails
      appliedNotes={saptuneStatus.applied_notes}
      appliedSolution={saptuneStatus.applied_solution}
      enabledNotes={saptuneStatus.enabled_notes}
      enabledSolution={saptuneStatus.enabled_solution}
      hostname={hostname}
      packageVersion={saptuneStatus.package_version}
      configuredVersion={saptuneStatus.configured_version}
      services={saptuneStatus.services}
      staging={saptuneStatus.staging}
      tuningState={saptuneStatus.tuning_state}
    />
  );
}

export default SaptuneDetailsPage;
