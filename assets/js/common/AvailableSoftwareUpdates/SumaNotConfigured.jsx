import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { EOS_SETTINGS } from 'eos-icons-react';

import Button from '@common/Button';

function SumaNotConfigured({ className, onBackToSettings = noop }) {
  return (
    <div className={classNames(className, 'place-content-between')}>
      <div>
        <p className="font-bold text-2xl">Available Software Updates</p>

        <p>
          SUSE Manager is not configured. Go to Settings to add your SUSE
          Manager connection credentials.
        </p>
      </div>

      <Button
        type="primary-white-fit"
        className="inline-block mx-0.5 border-green-500 border"
        size="small"
        onClick={onBackToSettings}
      >
        <EOS_SETTINGS className="inline-block fill-jungle-green-500" /> Settings
      </Button>
    </div>
  );
}

export default SumaNotConfigured;
