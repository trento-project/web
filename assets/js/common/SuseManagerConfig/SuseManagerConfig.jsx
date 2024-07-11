import React from 'react';
import { defaultTo, noop } from 'lodash';

import Button from '@common/Button';

import DisabledGuard from '@common/DisabledGuard';
import SuseManagerClearSettingsModal from '@common/SuseManagerClearSettingsDialog';
import CertificateUploadDate from './CertificateUploadDate';

const sumaSettingsPermittedFor = ['all:suma_settings'];

function SuseManagerConfig({
  url = 'https://',
  username,
  certUploadDate,
  onEditClick = noop,
  clearSettingsDialogOpen = false,
  testConnectionEnabled = false,
  onClearClick = noop,
  onClearSettings = noop,
  onTestConnection = noop,
  onCancel = noop,
  userAbilities,
}) {
  return (
    <>
      <SuseManagerClearSettingsModal
        open={clearSettingsDialogOpen}
        onClearSettings={onClearSettings}
        onCancel={onCancel}
      />
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold inline-block">
            SUSE Manager Config
          </h2>
          <span className="float-right">
            <Button
              aria-label="test-suma-connection"
              className="mr-2"
              type="default-fit"
              size="small"
              disabled={!testConnectionEnabled}
              onClick={onTestConnection}
            >
              Test Connection
            </Button>
            <DisabledGuard
              userAbilities={userAbilities}
              permitted={sumaSettingsPermittedFor}
            >
              <Button
                className="mr-2"
                type="primary-white-fit"
                size="small"
                onClick={onEditClick}
              >
                Edit Settings
              </Button>
            </DisabledGuard>
            <DisabledGuard
              userAbilities={userAbilities}
              permitted={sumaSettingsPermittedFor}
            >
              <Button
                aria-label="clear-suma-settings"
                type="danger"
                size="small"
                onClick={onClearClick}
              >
                Clear Settings
              </Button>
            </DisabledGuard>
          </span>
        </div>
        <p className="mt-3 mb-3 text-gray-500">
          SUSE Manager integration will unlock additional features throughout
          the Trento application
        </p>

        <div className="grid grid-cols-6 mt-5 items-center">
          <div className="font-bold mb-3">SUSE Manager URL</div>
          <div
            aria-label="suma-url"
            className="col-span-2 text-gray-500 mb-3 truncate pr-12"
          >
            {url}
          </div>
          <div className="font-bold mb-3">CA Certificate</div>
          <div
            aria-label="suma-cacert-upload-date"
            className="col-span-2 text-gray-500 mb-3"
          >
            <CertificateUploadDate date={certUploadDate} />
          </div>

          <div className="font-bold">Username</div>
          <div aria-label="suma-username" className="col-span-2 text-gray-500">
            {defaultTo(username, '.....')}
          </div>
          <div className="font-bold">Password</div>
          <div aria-label="suma-password" className="col-span-2 text-gray-500">
            {username ? '•••••' : '.....'}
          </div>
        </div>
      </div>
    </>
  );
}

export default SuseManagerConfig;
