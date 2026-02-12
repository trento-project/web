import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';

import { getAdvisoryErrata } from '@lib/api/softwareUpdates';
import * as history from '@lib/history';
import BackButton from '@common/BackButton';
import GenericError from '@common/GenericError';
import { useAssistantContext } from '@common/AssistantChat/useAssistantContext';
import AdvisoryDetails from './AdvisoryDetails';

function AdvisoryDetailsPage() {
  const navigate = useNavigate();
  const [advisoryErrata, setAdvisoryErrata] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { hostID, advisoryID } = useParams();

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

  // Provide context for AI assistant
  const aiContext = useMemo(
    () => ({
      hostID,
      advisoryID,
      advisory: advisoryErrata,
      loading: isLoading,
      error,
    }),
    [hostID, advisoryID, advisoryErrata, isLoading, error]
  );
  useAssistantContext(`Advisory Details: Details for advisory ${advisoryID} on host ${hostID}.`, aiContext);

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
        <AdvisoryDetails advisoryName={advisoryID} errata={advisoryErrata} />
      )}
      {!isLoading && error && <GenericError message={error} />}
    </>
  );
}

export default AdvisoryDetailsPage;
