import React from 'react';
import { defaultTo, noop } from 'lodash';

import Button from '@common/Button';

import CertificateUploadDate from './CertificateUploadDate';

const renderPassword = (username, certUploadDate) =>
  username && certUploadDate ? '•••••' : '.....';

function SuseManagerConfig({
  url = 'https://',
  username,
  certUploadDate,
  onEditClick = noop,
}) {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-2xl font-bold inline-block">SUSE Manager Config</h2>
        <span className="w-32 inline-block float-right">
          <Button type="primary-white" size="small" onClick={onEditClick}>
            Edit Settings
          </Button>
        </span>
      </div>
      <p className="mt-3 mb-3 text-gray-500">
        SUSE Manager integration will unlock additional features throughout the
        Trento application
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold mb-3">SUSE Manager URL</div>
        <div className="col-span-2 text-gray-500 mb-3">{url}</div>
        <div className="font-bold mb-3">CA Certificate</div>
        <div className="col-span-2 text-gray-500 mb-3">
          <CertificateUploadDate date={certUploadDate} />
        </div>

        <div className="font-bold">Username</div>
        <div className="col-span-2 text-gray-500">
          {defaultTo(username, '.....')}
        </div>
        <div className="font-bold">Password</div>
        <div className="col-span-2 text-gray-500">
          {renderPassword(username, certUploadDate)}
        </div>
      </div>
    </div>
  );
}

export default SuseManagerConfig;
