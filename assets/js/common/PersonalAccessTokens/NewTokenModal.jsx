import React from 'react';
import { noop } from 'lodash';

import Banner from '@common/Banners';
import Button from '@common/Button';
import Modal from '@common/Modal';
import ApiKeyBox from '@common/ApiKeyBox';
import CopyButton from '@common/CopyButton';

function NewTokenModal({ accessToken, isOpen = false, onClose = noop }) {
  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Generated Token"
      open={isOpen}
      onClose={onClose}
    >
      <Banner type="warning">
        Copy this token. This will not be shown again.
      </Banner>
      <div className="flex space-x-2">
        <ApiKeyBox apiKey={accessToken} />
        <CopyButton content={accessToken} />
      </div>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default NewTokenModal;
