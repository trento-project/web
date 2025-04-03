import React, { useEffect, useState } from 'react';
import {
  addDays,
  addMonths,
  addYears,
  format,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { noop } from 'lodash';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';
import Button from '@common/Button';
import Modal from '@common/Modal';
import { InputNumber } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import Switch from '@common/Switch';
import CopyButton from '@common/CopyButton';
import ApiKeyBox from '@common/ApiKeyBox';
import Banner from '../Banners/Banner';

const normalizeExpiration = (expiration) =>
  setMinutes(setHours(expiration, 0), 0);

const availableTimeOptions = [
  {
    type: 'months',
    timeGenerator: (quantity) => addMonths(new Date(), quantity),
  },
  {
    type: 'days',
    timeGenerator: (quantity) => addDays(new Date(), quantity),
  },
  {
    type: 'years',
    timeGenerator: (quantity) => addYears(new Date(), quantity),
  },
];

function ApiKeySettingsModal({
  open = false,
  loading = false,
  onGenerate = noop,
  onClose = noop,
  generatedApiKey,
  generatedApiKeyExpiration,
}) {
  const timeOptions = availableTimeOptions.map((o) => o.type);
  const [timeQuantity, setTimeQuantity] = useState(0);
  const [timeQuantityType, setTimeQuantityType] = useState(timeOptions[0]);
  const [keyGenerated, setKeyGenerated] = useState(false);

  const [quantityError, setQuantityError] = useState(false);
  const [apiKeyNeverExpires, setApiKeyNeverExpires] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const generateApiKeyExpiration = () => {
    if (apiKeyNeverExpires) {
      onGenerate({ apiKeyExpiration: null });
      setKeyGenerated(true);
      setShowConfirmation(false);
      return;
    }
    const timeQuantitySettings = availableTimeOptions.find(
      (q) => q.type === timeQuantityType
    );
    const apiKeyExpiration = timeQuantitySettings.timeGenerator(timeQuantity);

    onGenerate({ apiKeyExpiration: normalizeExpiration(apiKeyExpiration) });
    setKeyGenerated(true);
    setShowConfirmation(false);
  };

  const validateApiKeySettingsRequest = () => {
    if (!apiKeyNeverExpires && (timeQuantity === 0 || !timeQuantity)) {
      setQuantityError(true);
      return;
    }
    setShowConfirmation(true);
  };

  useEffect(() => {
    setApiKeyNeverExpires(false);
    setQuantityError(false);
    setTimeQuantityType(timeOptions[0]);
    setTimeQuantity(0);
    setKeyGenerated(false);
    setShowConfirmation(false);
  }, [open]);

  return (
    <Modal
      title={showConfirmation ? 'Generate API Key' : 'API Key Settings'}
      className="!w-3/4 !max-w-3xl"
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col my-2">
        {showConfirmation ? (
          <>
            <Banner type="warning">
              <span className="text-sm">
                Generating a new API Key forces an update of the agent
                configuration on all the registered hosts. <br />
                This action cannot be undone.
              </span>
            </Banner>
            <span className="my-1 mb-4 text-gray-500">
              Are you sure you want to generate a new API key?
            </span>
          </>
        ) : (
          <>
            <span className="my-1 mb-4 text-gray-500">
              {' '}
              By generating a new key, you will need to replace the API key on
              all hosts.{' '}
            </span>

            <div className="flex space-x-1">
              <div className="w-1/5">
                <Label>Never Expires</Label>
              </div>

              <Switch
                selected={apiKeyNeverExpires}
                onChange={() => {
                  setApiKeyNeverExpires((enabled) => !enabled);
                  setQuantityError(false);
                }}
              />
            </div>
            <div className="flex items-center my-1 space-x-2">
              <div className="w-1/3">
                <Label>Key Expiration</Label>
              </div>

              <div className="w-2/4">
                <InputNumber
                  value={timeQuantity}
                  className="!h-8"
                  type="number"
                  min="0"
                  disabled={apiKeyNeverExpires}
                  error={quantityError}
                  onChange={(value) => {
                    setTimeQuantity(parseInt(value, 10));
                    setQuantityError(false);
                  }}
                />
              </div>
              <div className="w-2/4 pt-4">
                <Select
                  className="pb-4 min-w-24 max-w-fit"
                  optionsName=""
                  options={timeOptions}
                  disabled={apiKeyNeverExpires}
                  value={timeQuantityType}
                  onChange={(value) => setTimeQuantityType(value)}
                />
              </div>
              <div className="w-1/6 h-4/5">
                <Button
                  className="generate-api-key"
                  onClick={() => validateApiKeySettingsRequest()}
                  disabled={quantityError || loading}
                >
                  Generate
                </Button>
              </div>
            </div>
            {quantityError && (
              <span className="my-1 mb-4 text-red-500">
                {' '}
                Key expiration value needs to be greater than 0{' '}
              </span>
            )}
            {generatedApiKey && keyGenerated && !loading && (
              <div className="flex flex-col my-1 mb-4">
                <div className="flex space-x-2">
                  <ApiKeyBox apiKey={generatedApiKey} />
                  <CopyButton content={generatedApiKey} />
                </div>
                <div className="flex space-x-2">
                  <EOS_INFO_OUTLINED size="20" className="mt-2" />

                  <div className="mt-2 text-gray-600 text-sm">
                    {generatedApiKeyExpiration
                      ? `Key will expire ${format(
                          parseISO(generatedApiKeyExpiration),
                          'd LLL yyyy'
                        )}`
                      : 'Key will never expire'}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div className="w-1/6 h-4/5 flex">
          {showConfirmation ? (
            <>
              <Button
                className="w-1/6 mr-2 generate-api-confirmation"
                onClick={() => generateApiKeyExpiration()}
                disabled={loading}
              >
                Generate
              </Button>
              <Button
                type="primary-white"
                onClick={() => setShowConfirmation(false)}
                className="w-1/6"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="primary-white" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeySettingsModal;
