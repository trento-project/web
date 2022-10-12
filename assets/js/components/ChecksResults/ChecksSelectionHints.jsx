import React from 'react';
import { useNavigate } from 'react-router-dom';

import { EOS_SETTINGS, EOS_PLAY_CIRCLE } from 'eos-icons-react';

import Button from '@components/Button';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';

import TrentoLogo from '../../../static/trento-icon.png';

const ChecksSelectionHints = ({ clusterId, selectedChecks }) => {
  const navigate = useNavigate();

  const hasSelectedChecks = selectedChecks.length > 0;

  return (
    <div className="flex items-center justify-center py-5">
      <div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg px-5 pt-5 pb-10 text-gray-800 dark:text-gray-50">
        <div className="w-full pt-8 text-center pb-5 -mt-16 mx-auto">
          <img
            alt="profil"
            src={TrentoLogo}
            className="mx-auto object-cover h-20 w-20 "
          />
        </div>
        <div className="w-full mb-10">
          <p className="ttext-gray-600 dark:text-gray-100 text-center px-5">
            {!hasSelectedChecks &&
              'It looks like you have not configured any checks for the current cluster. Select your desired checks to be executed.'}
            {hasSelectedChecks &&
              'It looks like there is no recent execution for current cluster. Run your Check selection now!'}
          </p>
        </div>
        <div className="w-full text-center">
          {!hasSelectedChecks && (
            <Button
              className="bg-waterhole-blue mx-auto px-2 py-2 w-1/4 xs:w-full"
              onClick={() => {
                navigate(`/clusters/${clusterId}/settings`);
              }}
            >
              <EOS_SETTINGS className="inline-block fill-white mr-1" />
              Select Checks now!
            </Button>
          )}
          {hasSelectedChecks && (
            <TriggerChecksExecutionRequest
              cssClasses="rounded relative w-1/4 ml-0.5 bg-waterhole-blue mx-auto px-2 py-2 w-1/4 xs:w-full text-base"
              clusterId={clusterId}
            >
              <EOS_PLAY_CIRCLE className="inline-block fill-white" /> Start
              Execution now
            </TriggerChecksExecutionRequest>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecksSelectionHints;
