// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { get, isEmpty, noop } from 'lodash';
import {
  DATABASE_START,
  DATABASE_STOP,
  getOperationTitle,
} from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

import { InputNumber } from '@common/Input';
import Select from '@common/Select';

import OperationModal from './OperationModal';

const ALL_SELECTED = 'all';

const instanceTypes = [
  {
    label: 'All instances',
    value: ALL_SELECTED,
  },
  {
    label: 'ABAP instances',
    value: 'abap',
  },
  {
    label: 'J2EE instances',
    value: 'j2ee',
  },
  {
    label: 'ASCS/SCS instances',
    value: 'scs',
  },
  {
    label: 'ENQREP instances',
    value: 'enqrep',
  },
];

const DEFAULT_TIMEOUT = 5;
const MIN_TIMEOUT = 1;
const MAX_TIMEOUT = 720; // 12 hours

const BULK_DESCRIPTIONS = {
  [DATABASE_START]: 'Start the following databases:',
  [DATABASE_STOP]: 'Stop the following databases:',
};

function SapStartStopOperationModal({
  operation,
  type,
  sid,
  site = null,
  resources = [],
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [instanceType, setInstanceType] = useState(ALL_SELECTED);
  const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT);

  const operationTitle = getOperationTitle(operation);

  const description = isEmpty(resources)
    ? `${operationTitle} ${sid}${site ? ` on ${site} site` : ''}`
    : get(BULK_DESCRIPTIONS, operation, 'No description available');

  return (
    <OperationModal
      title={operationTitle}
      description={description}
      operationText={operationTitle}
      resources={resources}
      isOpen={isOpen}
      onRequest={() => {
        onRequest({
          timeout: timeout * 60,
          ...(type === APPLICATION_TYPE && { instance_type: instanceType }),
          ...(type === DATABASE_TYPE && site && { site }),
        });
      }}
      onCancel={() => {
        onCancel();
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
              aria-label="instance_type"
              options={instanceTypes}
              initialValues={[instanceTypes[0]]}
              onChange={setInstanceType}
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
          />
        </div>
      </div>
    </OperationModal>
  );
}

export default SapStartStopOperationModal;
