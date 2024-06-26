import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { getAdvirosyErrata } from '@lib/api/softwareUpdates';
import { logError } from '@lib/log';
import BackButton from '@common/BackButton';
import AdvisoryDetails from './AdvisoryDetails';

function AdvisoryDetailsPage() {
  const [advisoryErrata, setAdvisoryErrata] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { hostID, advisoryID } = useParams();

  useEffect(() => {
    getAdvirosyErrata(advisoryID)
      .then((errata) => {
	setAdvisoryErrata(errata.data)
	setIsLoading(false)
      })
      .catch((e) => logError(e))
  }, []);

  return (
    <>
      <BackButton url={`/hosts/${hostID}`}>Back</BackButton>
      { !isLoading ? <AdvisoryDetails errata={advisoryErrata} /> : null}
    </>
  );
}

export default AdvisoryDetailsPage;
