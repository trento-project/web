import React, { Fragment } from 'react';
import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';

export const GlobalHealth = ({counters}) => {
    const {passing, warning, critical} = counters
  return (
    <Fragment>
      <h1 className="text-2xl font-semibold">At a glance</h1>
      <hr className="my-3" />
      <h5 className="text-xl">Global Health</h5>
      <div className="flex flex-row">
        <div className="w-1/3 py-4 px-8 bg-green-200 border-green-600 border-l-4 text-green-600 shadow rounded-lg my-2 mr-4">
          <div className="flex items-center rounded justify-between p-3 text-3xl">
            <span className="rounded-lg p-2 text-3xl">
              <EOS_CHECK_CIRCLE_OUTLINED size={30} className="fill-green-600" />
            </span>
            <div className="flex w-full ml-2 items-center justify-between">
              <p>Passing</p>
              <p className="font-semibold">{passing}</p>
            </div>
          </div>
        </div>
        <div className="w-1/3 py-4 px-8 bg-yellow-200 border-yellow-600 border-l-4 text-yellow-600 shadow rounded-lg my-2">
          <div className="flex items-center rounded justify-between p-3 text-3xl">
            <span className="rounded-lg p-2 text-3xl">
              <EOS_WARNING_OUTLINED size={30} className="fill-yellow-600" />
            </span>
            <div className="flex w-full ml-2 items-center justify-between">
              <p>Warning</p>
              <p className="font-semibold">{warning}</p>
            </div>
          </div>
        </div>
        <div className="w-1/3 py-4 px-8 bg-red-200 border-red-600 border-l-4 text-red-600 shadow rounded-lg my-2 ml-4">
          <div className="flex items-center rounded justify-between p-3 text-3xl">
            <span className="rounded-lg p-2 text-3xl">
              <EOS_ERROR_OUTLINED size={30} className="fill-red-600" />
            </span>
            <div className="flex w-full ml-2 items-center justify-between">
              <p>Critical</p>
              <p className="font-semibold">{critical}</p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
