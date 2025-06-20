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
  const alertingFields = [
    {
      label: 'SMTP Server',
      value: smtpServer,
      ariaLabel: 'smtp-server',
      addClasses: 'truncate pr-12',
    },
    {
      label: 'SMTP Port',
      value: smtpPort,
      ariaLabel: 'smtp-port',
    },
    {
      label: 'SMTP User',
      value: smtpUsername,
      ariaLabel: 'smtp-username',
      addClasses: 'truncate pr-12',
    },
    {
      label: 'Password',
      value: '•••••',
      ariaLabel: 'smtp-password',
    },
    {
      label: 'Alerting Sender',
      value: senderEmail,
      ariaLabel: 'alerting-sender',
      addClasses: 'truncate pr-12',
    },
    {
      label: 'Alerting Recipient',
      value: recipientEmail,
      ariaLabel: 'alerting-recipient',
    },
    {
      label: 'Send Email Alerts',
      value: alertingEnabled ? 'Enabled' : 'Disabled',
      ariaLabel: 'alerting-enabled',
    },
  ];

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

      <div className="grid grid-cols-6 gap-y-3 mt-5 items-center">
        {alertingFields.map(({ label, value, ariaLabel, addClasses }) => (
          <AlertingSettingsRow
            key={ariaLabel}
            label={label}
            value={value}
            ariaLabel={ariaLabel}
            addClasses={addClasses}
          />
        ))}
      </div>
    </div>
  );
}

function AlertingSettingsRow({ label, value, ariaLabel, addClasses = '' }) {
  return (
    <>
      <div className="font-bold">{label}</div>
      <div
        aria-label={ariaLabel}
        className={`col-span-2 text-gray-500 ${addClasses}`}
      >
        {value}
      </div>
    </>
  );
}
