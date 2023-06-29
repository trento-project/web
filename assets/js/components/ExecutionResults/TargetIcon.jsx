import React from 'react';
import { EOS_COLLOCATION, EOS_DESKTOP_WINDOWS } from 'eos-icons-react';

function TargetIcon({ isCluster = false }) {
  return (
    <span className="inline-flex bg-jungle-green-500 p-1 rounded-full self-center">
      {isCluster ? (
        <EOS_COLLOCATION className="fill-white" />
      ) : (
        <EOS_DESKTOP_WINDOWS className="fill-white" />
      )}
    </span>
  );
}

export default TargetIcon;
