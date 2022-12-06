import React from 'react';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

function LoadingBox({ text }) {
  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-1/2 m-auto">
      <div className="w-full h-full text-center">
        <div className="flex h-full flex-col justify-between">
          <EOS_LOADING_ANIMATED className="m-auto" color="green" size="xl" />
          <p className="text-gray-600 dark:text-gray-100 text-md py-2 px-6">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingBox;
