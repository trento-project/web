import React from 'react';
import { toast } from 'react-hot-toast';

function DismissableToast({ text, toastInstance }) {
  return (
    <div className="flex space-x-4">
      <p className="text-sm font-medium text-gray-900">{text}</p>
      <button
        type="button"
        className="text-jungle-green-500"
        onClick={() => toast.dismiss(toastInstance.id)}
      >
        Close
      </button>
    </div>
  );
}

export default DismissableToast;
