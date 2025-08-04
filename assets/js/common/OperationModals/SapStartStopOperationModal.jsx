import React, { useState } from 'react';
import { get, noop } from 'lodash';
import {
  DATABASE_START,
  DATABASE_STOP,
  SAP_SYSTEM_START,
  SAP_SYSTEM_STOP,
} from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

import { InputNumber } from '@common/Input';
import Select from '@common/Select';

import OperationModal from './OperationModal';

const TITLES = {
  [DATABASE_START]: 'Start database',
  [DATABASE_STOP]: 'Stop database',
  [SAP_SYSTEM_START]: 'Start SAP system',
  [SAP_SYSTEM_STOP]: 'Stop SAP system',
};

const ALL_SELECTED = 'all';

const instanceTypes = [
  {
    key: 'All instances',
    value: ALL_SELECTED,
  },
  {
    key: 'ABAP instances',
    value: 'abap',
  },
  {
    key: 'J2EE instances',
    value: 'j2ee',
  },
  {
    key: 'ASCS/SCS instances',
    value: 'scs',
  },
  {
    key: 'ENQREP instances',
    value: 'enqrep',
  },
];

const DEFAULT_TIMEOUT = 5;
const MIN_TIMEOUT = 1;
const MAX_TIMEOUT = 720; // 12 hours

const getOperationTitle = (operation) =>
  get(TITLES, operation, 'unknown operation');

function SapStartStopOperationModal({
  operation,
  type,
  sid,
  site = null,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);
  const [instanceType, setInstanceType] = useState(ALL_SELECTED);
  const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT);

  const operationTitle = getOperationTitle(operation);

  return (
    <OperationModal
      title={operationTitle}
      description={`${operationTitle} ${sid}${site ? ` on ${site} site` : ''}`}
      operationText={operationTitle}
      applyDisabled={!checked}
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() => {
        onRequest({
          timeout: timeout * 60,
          ...(type === APPLICATION_TYPE && { instance_type: instanceType }),
          ...(type === DATABASE_TYPE && site && { site }),
        });
        setChecked(false);
      }}
      onCancel={() => {
        onCancel();
        setChecked(false);
        setInstanceType(ALL_SELECTED);
        setTimeout(DEFAULT_TIMEOUT);
      }}
    >
      <div>
        {type === APPLICATION_TYPE && (
          <div className="flex items-center justify-start gap-2 mt-4">
            <p className="font-semibold text-gray-900 tracking-wide">
              Instance type
            </p>
            <Select
              className="ml-auto !flex-none !w-2/3"
              optionsName="instance_type"
              options={instanceTypes}
              value={instanceType}
              onChange={(value) => setInstanceType(value)}
              disabled={!checked}
              renderOption={(item) => item.key}
            />
          </div>
        )}
        <div className="flex items-center justify-start gap-2 mt-4">
          <p className="font-semibold text-gray-900 tracking-wide">
            Timeout (minutes)
          </p>
          <InputNumber
            id="timeout-input"
            name="timeout-input"
            className="ml-auto !w-2/3 h-8"
            value={timeout}
            min={MIN_TIMEOUT}
            max={MAX_TIMEOUT}
            onChange={(value) => {
              setTimeout(value);
            }}
            disabled={!checked}
          />
        </div>
      </div>
    </OperationModal>
  );
}

export default SapStartStopOperationModal;
