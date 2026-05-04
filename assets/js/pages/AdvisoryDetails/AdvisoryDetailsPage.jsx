import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import { getAdvisoryErrata } from '@lib/api/softwareUpdates';
import * as history from '@lib/history';
import BackButton from '@common/BackButton';
import GenericError from '@common/GenericError';
import { getUserProfile } from '@state/selectors/user';
import AdvisoryDetails from './AdvisoryDetails';

function AdvisoryDetailsPage() {
  const navigate = useNavigate();
  const [advisoryErrata, setAdvisoryErrata] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { hostID, advisoryID } = useParams();
  const { timezone } = useSelector(getUserProfile);

  useEffect(() => {
    getAdvisoryErrata(advisoryID)
      .then((errata) => {
        setAdvisoryErrata(errata.data);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <BackButton
        onClick={() =>
          history.length() < 3
            ? navigate(`/hosts/${hostID}/patches`)
            : navigate(-1)
        }
      >
        Back
      </BackButton>
      {!isLoading && !error && (
        <AdvisoryDetails
          advisoryName={advisoryID}
          errata={advisoryErrata}
          timezone={timezone}
        />
      )}
      {!isLoading && error && <GenericError message={error} />}
    </>
  );
}

export default AdvisoryDetailsPage;
