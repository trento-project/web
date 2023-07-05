import React from 'react';

import { EOS_CANCEL } from 'eos-icons-react';

function FailAlert({ onClose = () => {}, children }) {
  return (
    <div
      className="rounded relative bg-red-200 border-red-600 text-red-600 border-l-4 p-2 ml-2 pr-10"
      role="alert"
    >
      {children}
      <button
        type="button"
        className="absolute top-0 bottom-0 right-0 pr-2"
        onClick={() => onClose()}
      >
        <EOS_CANCEL size={14} className="fill-red-600" />
      </button>
    </div>
  );
}

export default FailAlert;
