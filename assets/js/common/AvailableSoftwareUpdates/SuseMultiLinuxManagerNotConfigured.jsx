// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { EOS_SETTINGS } from 'eos-icons-react';

import { SMLM_PRODUCT_LABEL } from '@lib/model/suse_multilinux_manager';

import Button from '@common/Button';

function SuseMultiLinuxManagerNotConfigured({
  className,
  onBackToSettings = noop,
}) {
  return (
    <div
      className={classNames(
        className,
        'place-content-between',
        'w-full',
        'my-4'
      )}
    >
      <div>
        <p className="font-bold text-2xl">Available Software Updates</p>

        <p>
          {SMLM_PRODUCT_LABEL} is not configured. Go to Settings to add your{' '}
          {SMLM_PRODUCT_LABEL} connection credentials.
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

export default SuseMultiLinuxManagerNotConfigured;
