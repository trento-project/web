import React from 'react';
import { noop } from 'lodash';

import Banner from '@common/Banners/Banner';
import Button from '@common/Button';
import Modal from '@common/Modal';

function DeleteTokenModal({
  name,
  isOpen = false,
  onDelete = noop,
  onClose = noop,
}) {
  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Delete Token"
      open={isOpen}
      onClose={onClose}
    >
      <div className="text-gray-500">
        Delete <span className="font-bold">{name}</span> personal access token.
      </div>
      <Banner type="warning">
        Any tool using this token will stop working with Trento.
      </Banner>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="danger-bold"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          onClick={onDelete}
        >
          Delete Token
        </Button>
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

export default DeleteTokenModal;
