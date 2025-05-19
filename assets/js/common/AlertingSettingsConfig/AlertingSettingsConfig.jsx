import React from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import Tooltip from '@common/Tooltip';

const alertingSettingsPermittedFor = ['all:alerting_settings'];

export const ENFORCED_FROM_ENV_MESSAGE =
  'Alerting settings are enforced by environment variables';

export default function AlertingSettingsConfig({
  settings: {
    alertingEnabled = false,
    smtpServer = 'https://.....',
    smtpPort = 587,
    smtpUsername = '.....',
    senderEmail = '...@...',
    recipientEmail = '...@...',
    enforcedFromEnv = false,
  } = {},
  userAbilities = [],
  onEditClick = noop,
}) {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-2xl font-bold inline-block">Email Alerts</h2>

        <span className="float-right">
          <DisabledGuard
            userAbilities={userAbilities}
            permitted={alertingSettingsPermittedFor}
          >
            <Tooltip
              isEnabled={enforcedFromEnv}
              content={ENFORCED_FROM_ENV_MESSAGE}
              place="bottom"
            >
              <Button
                type="primary-white-fit"
                size="small"
                aria-label="alerting-edit-button"
                onClick={onEditClick}
                disabled={enforcedFromEnv}
              >
                Edit Settings
              </Button>
            </Tooltip>
          </DisabledGuard>
        </span>
      </div>

      <p className="mt-3 mb-3 text-gray-500">
        Settings used to send Trento system e-mails.
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold mb-3">SMTP Server</div>
        <div
          aria-label="smtp-server"
          className="col-span-2 text-gray-500 mb-3 truncate pr-12"
        >
          {smtpServer}
        </div>

        <div className="font-bold mb-3">SMTP Port</div>
        <div aria-label="smtp-port" className="col-span-2 text-gray-500 mb-3">
          {smtpPort}
        </div>

        <div className="font-bold mb-3">SMTP User</div>
        <div
          aria-label="smtp-username"
          className="col-span-2 text-gray-500 mb-3 pr-12"
        >
          {smtpUsername}
        </div>

        <div className="font-bold mb-3">Password</div>
        <div
          aria-label="smtp-password"
          className="col-span-2 text-gray-500 mb-3"
        >
          •••••
        </div>

        <div className="font-bold mb-3">Alerting Sender</div>
        <div
          aria-label="alerting-sender"
          className="col-span-2 text-gray-500 mb-3 truncate pr-12"
        >
          {senderEmail}
        </div>

        <div className="font-bold mb-3">Alerting Recipient</div>
        <div
          aria-label="alerting-recipient"
          className="col-span-2 text-gray-500 mb-3"
        >
          {recipientEmail}
        </div>

        <div className="font-bold mb-3">Send Email Alerts</div>
        <div
          aria-label="alerting-enabled"
          className="col-span-2 text-gray-500 mb-3 truncate pr-12"
        >
          {alertingEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>
    </div>
  );
}
