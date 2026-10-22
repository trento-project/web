// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { Link } from 'react-router';

import { find, get, groupBy, map, noop, some, split } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Banner from '@common/Banners';

const replacePattern = /({\d+})/;
const urlTypes = {
  cluster: 'clusters',
  database: 'databases',
  host: 'hosts',
  sap_system: 'sap_systems',
};

const findBulkResource = (metadata) => find(metadata, 'bulk_operation');

const formatError = (error, metadata, onCancel) => {
  // find {i} entries in the text splitting the whole content
  const parts = split(error, replacePattern);

  return map(parts, (part) => {
    // if a part matches with the replacement pattern, find the
    // corresponding metadata by index and create the link
    if (part.match(replacePattern)) {
      const index = parseInt(part.substring(1));
      const { id, label, type } = get(metadata, index) ?? {};

      return id ? (
        <Link
          className="text-jungle-green-500 hover:opacity-75"
          onClick={onCancel}
          key={id}
          to={`/${urlTypes[type]}/${id}`}
        >
          {label}
        </Link>
      ) : (
        part
      );
    }
    return part;
  });
};

const renderErrors = (errors, onCancel) =>
  map(errors, ({ detail, metadata }) => (
    <li key={detail} className="text-sm">
      {formatError(detail, metadata, onCancel)}
    </li>
  ));

const renderBulkErrors = (errors, onCancel) => {
  const errorsByResource = groupBy(
    errors,
    ({ metadata }) => findBulkResource(metadata)?.id
  );

  return map(errorsByResource, (resourceErrors, id) => {
    const { label, type } = findBulkResource(resourceErrors[0].metadata);

    return (
      <li key={id} className="text-sm">
        <Link
          className="text-jungle-green-500 hover:opacity-75"
          onClick={onCancel}
          to={`/${urlTypes[type]}/${id}`}
        >
          {label}
        </Link>
        <ul className="list-[circle] list-inside ml-6 mt-1 space-y-1">
          {renderErrors(resourceErrors, onCancel)}
        </ul>
      </li>
    );
  });
};

function OperationForbiddenModal({
  operation,
  errors,
  isOpen = false,
  onCancel = noop,
}) {
  const isBulkOperation = some(errors, ({ metadata }) =>
    findBulkResource(metadata)
  );

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Operation Forbidden"
      open={isOpen}
      onClose={onCancel}
    >
      <Banner type="error">
        Unable to run {operation} operation. Some pre-requisites are not met.
      </Banner>
      <p className="text-sm mb-1">
        Some of the following pre-requisites are not met:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-1 max-h-60 overflow-y-auto">
        {isBulkOperation
          ? renderBulkErrors(errors, onCancel)
          : renderErrors(errors, onCancel)}
      </ul>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={onCancel}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default OperationForbiddenModal;
