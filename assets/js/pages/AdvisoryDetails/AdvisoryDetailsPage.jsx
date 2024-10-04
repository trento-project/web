import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getAdvisoryErrata } from '@lib/api/softwareUpdates';
import { logError } from '@lib/log';
import { historyLength } from '@lib/history';
import BackButton from '@common/BackButton';
import AdvisoryDetails from './AdvisoryDetails';

function AdvisoryDetailsPage() {
  const navigate = useNavigate();
  const [advisoryErrata, setAdvisoryErrata] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { hostID, advisoryID } = useParams();

  useEffect(() => {
    getAdvisoryErrata(advisoryID)
      .then((errata) => {
        setAdvisoryErrata(errata.data);
        setIsLoading(false);
      })
      .catch((e) => logError(e));
  }, []);

  return (
    <>
      <BackButton
        onClick={() => {
          if (historyLength() < 3) {
            navigate(`/hosts/${hostID}/patches`);
          } else {
            navigate(-1);
          }
        }}
      >
        Back
      </BackButton>
      {!isLoading && (
        <AdvisoryDetails advisoryName={advisoryID} errata={advisoryErrata} />
      )}
    </>
  );
}

export default AdvisoryDetailsPage;
