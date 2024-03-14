import React from 'react';
import { toast } from 'react-hot-toast';

function DismissableToast({ text, toastID }) {
  return (
    <div className="flex space-x-4">
      <p className="text-sm font-medium text-gray-900">{text}</p>
      <button
        type="button"
        className="text-jungle-green-500 text-sm"
        onClick={() => toast.dismiss(toastID)}
      >
        Close
      </button>
    </div>
  );
}

export default DismissableToast;
