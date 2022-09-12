import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';
import React from 'react';

const ChecksResultOverview = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold">Check Results</h1>
      <h6 className="opacity-60 text-sm">Thu Aug 6, 16:55:24 2022</h6>

      <div className="flex flex-col self-start w-full px-4 mt-2">
        <div className="flex items-center rounded p-3 text-lg font-bold">
          <span className="rounded-lg p-2 bg-green-200 mr-2">
            <EOS_CHECK_CIRCLE_OUTLINED size={25} className="fill-green-600" />
          </span>
          <div className="flex w-full ml-2 items-center w-[65%]">
            <p>Passed</p>
          </div>
          <div className="flex text-xl">16</div>
        </div>
        <div className="flex items-center rounded p-3 text-lg font-bold">
          <span className="rounded-lg p-2 bg-yellow-200 mr-2">
            <EOS_WARNING_OUTLINED size={25} className="fill-yellow-600" />
          </span>
          <div className="flex w-full ml-2 items-center w-[65%]">
            <p>Warning</p>
          </div>
          <div className="flex text-xl">5</div>
        </div>
        <div className="flex items-center rounded p-3 text-lg font-bold">
          <span className="rounded-lg p-2 bg-red-200 mr-2">
            <EOS_ERROR_OUTLINED size={25} className="fill-red-600" />
          </span>
          <div className="flex w-full ml-2 items-center w-[65%]">
            <p>Critical</p>
          </div>
          <div className="flex text-xl">2</div>
        </div>
      </div>
    </div>
  );
};

export default ChecksResultOverview;
