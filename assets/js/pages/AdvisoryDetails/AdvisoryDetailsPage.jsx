import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { getAvirosyErrata } from '@lib/api/softwareUpdates';
import BackButton from '@common/BackButton';
import AdvisoryDetails from './AdvisoryDetails';

function AdvisoryDetailsPage() {
  const [advisoryErrata, setAdvisoryErrata] = useState(undefined);
  const { hostID, advisoryID } = useParams();

  useEffect(() => {
    try {
      setAdvisoryErrata(getAvirosyErrata(advisoryID));
    } catch (e) {
      /* eslint-disable no-console */
      console.error(e);
    }
  }, []);

  return (
    <>
      <BackButton url={`/hosts/${hostID}`}>Back</BackButton>
      <AdvisoryDetails
        name={advisoryErrata.id}
        status={advisoryErrata.advisory_status}
        type={advisoryErrata.type}
        synopsis={advisoryErrata.synopsis}
        description={advisoryErrata.description}
        issueDate={advisoryErrata.issue_date}
        updateDate={advisoryErrata.update_date}
        rebootRequired={advisoryErrata.reboot_suggested}
        affectsPackageMaintanaceStack={undefined}
        fixes={undefined}
        cves={undefined}
        packages={undefined}
      />
    </>
  );
}

export default AdvisoryDetailsPage;
