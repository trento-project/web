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
import { noop, truncate } from 'lodash';
import { EOS_CONTENT_COPY, EOS_INFO_OUTLINED } from 'eos-icons-react';
import Button from '@common/Button';
import Modal from '@common/Modal';
import { InputNumber } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import Switch from '@common/Switch';

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
  const [apiKeyNeverExpires, setapiKeyNeverExpires] = useState(false);

  const generateApiKeyExpiration = () => {
    if (apiKeyNeverExpires) {
      onGenerate({ apiKeyExpiration: null });
      setKeyGenerated(true);
      return;
    }
    if (timeQuantity === 0 || !timeQuantity) {
      setQuantityError(true);
      return;
    }
    const timeQuantitySettings = availableTimeOptions.find(
      (q) => q.type === timeQuantityType
    );
    const apiKeyExpiration = timeQuantitySettings.timeGenerator(timeQuantity);

    onGenerate({ apiKeyExpiration: normalizeExpiration(apiKeyExpiration) });
    setKeyGenerated(true);
  };

  useEffect(() => {
    setapiKeyNeverExpires(false);
    setQuantityError(false);
    setTimeQuantityType(timeOptions[0]);
    setTimeQuantity(0);
    setKeyGenerated(false);
  }, [open]);

  return (
    <Modal
      title="API Key Settings"
      className="!w-3/4 !max-w-3xl"
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col my-5">
        <span className="my-2 mb-4 text-gray-500">
          {' '}
          By generating a new key, you will need to replace the API key on all
          hosts.{' '}
        </span>

        <div className="flex space-x-1">
          <div className="w-1/5">
            <Label>Never Expires</Label>
          </div>

          <Switch
            selected={apiKeyNeverExpires}
            onChange={() => {
              setapiKeyNeverExpires((enabled) => !enabled);
              setQuantityError(false);
            }}
          />
        </div>
        <div className="flex items-center my-2 space-x-2">
          <div className="w-1/3">
            <Label>Key Expiration</Label>
          </div>

          <div className="w-2/4 pt-1">
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
              optionsName=""
              options={timeOptions}
              disabled={apiKeyNeverExpires}
              value={timeQuantityType}
              onChange={(value) => setTimeQuantityType(value)}
            />
          </div>
          <div className="w-1/6 h-4/5">
            <Button
              onClick={() => generateApiKeyExpiration()}
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
              <div className="w-full break-words p-2 pr-2 rounded-lg bg-white border-gray-300 border">
                <code> {truncate(generatedApiKey, { length: 65 })} </code>
              </div>
              <button
                type="button"
                aria-label="copy api key"
                onClick={() => {
                  window.navigator.clipboard.writeText(generatedApiKey);
                }}
              >
                <EOS_CONTENT_COPY role="button" size="25" />
              </button>
            </div>
            <div className="flex space-x-2">
              <EOS_INFO_OUTLINED size="20" className="mt-2" />

              <div className="mt-2 text-gray-600 text-sm">
                {generatedApiKeyExpiration
                  ? `Key Will Expire ${format(
                      parseISO(generatedApiKeyExpiration),
                      'd LLL yyyy'
                    )}`
                  : 'Key will never expire'}
              </div>
            </div>
          </div>
        )}
        <div className="w-1/6 h-4/5">
          <Button type="primary-white" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeySettingsModal;
